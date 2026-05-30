using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Text;
using ZenTask.API.Data;
using ZenTask.API.Models;

namespace ZenTask.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<ZenTask.API.Hubs.TaskHub> _hubContext;

        public TaskController(
            AppDbContext context, 
            UserManager<ApplicationUser> userManager,
            Microsoft.AspNetCore.SignalR.IHubContext<ZenTask.API.Hubs.TaskHub> hubContext)
        {
            _context = context;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        private string? GetUserId() 
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        }

        // ✅ GET TASKS (With Filter & Search)
        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] string? status, [FromQuery] string? priority, [FromQuery] string? search, [FromQuery] string? sort, [FromQuery] string? userId)
        {
            var currentUserId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            Serilog.Log.Information("Fetching tasks for User: {UserId}, IsAdmin: {IsAdmin}, Sort: {Sort}", currentUserId, isAdmin, sort);

            IQueryable<TaskItem> query = _context.Tasks;

            // If not admin, only show user's own tasks
            if (!isAdmin)
            {
                query = query.Where(t => t.UserId == currentUserId);
            }
            else if (!string.IsNullOrEmpty(userId))
            {
                // Admin can filter by specific user
                query = query.Where(t => t.UserId == userId);
            }

            if (!string.IsNullOrEmpty(status))
            {
                var statuses = status.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (statuses.Length > 1)
                {
                    query = query.Where(t => statuses.Contains(t.Status));
                }
                else
                {
                    query = query.Where(t => t.Status == status);
                }
            }

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(t => t.Priority == priority);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(t => 
                    (t.Title != null && t.Title.ToLower().Contains(search)) || 
                    (t.Description != null && t.Description.ToLower().Contains(search)) ||
                    (t.Category != null && t.Category.ToLower().Contains(search))
                );
            }

            // Sorting logic
            if (sort == "dueDate")
            {
                query = query.OrderBy(t => t.DueDate == null).ThenBy(t => t.DueDate);
            }
            else
            {
                query = query.OrderByDescending(t => t.Id); // Default sort
            }

            var tasks = await query
                .Include(t => t.User)
                .Select(t => new {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.Priority,
                    t.Category,
                    t.DueDate,
                    t.UserId,
                    t.CreatedAt,
                    t.IsAssignedByAdmin,
                    User = t.User != null ? new { t.User.UserName, t.User.Email } : null
                })
                .ToListAsync();
            return Ok(tasks);
        }

        // ✅ GET TASK BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            var userId = GetUserId();
            var task = await _context.Tasks
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();

            if (!User.IsInRole("Admin") && task.UserId != userId)
                return Forbid();

            return Ok(new {
                task.Id,
                task.Title,
                task.Description,
                task.Status,
                task.Priority,
                task.Category,
                task.DueDate,
                task.UserId,
                task.CreatedAt,
                task.IsAssignedByAdmin,
                User = task.User != null ? new { task.User.UserName, task.User.Email } : null
            });
        }

        // ✅ CREATE TASK
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskItem task)
        {
            if (!ModelState.IsValid)
            {
                Serilog.Log.Warning("CreateTask: Invalid ModelState {@ModelStateErrors}", 
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }

            var currentUserId = GetUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                Serilog.Log.Warning("CreateTask: User ID not found in token.");
                return Unauthorized("User ID not found in token.");
            }

            // Clean up the task object to prevent conflicts
            task.Id = 0; // Ensure it's a new task
            task.CreatedAt = DateTime.UtcNow;
            task.CreatedByUserId = currentUserId;
            
            // Allow Admin to assign task to another user
            if (User.IsInRole("Admin") && !string.IsNullOrEmpty(task.UserId) && task.UserId != currentUserId)
            {
                Serilog.Log.Information("Admin {AdminId} is assigning task to User {UserId}", currentUserId, task.UserId);
                task.IsAssignedByAdmin = true;
                
                // Real-time Notification for User
                await _hubContext.Clients.User(task.UserId).SendAsync("ReceiveNotification", new {
                    title = "New Task Assigned",
                    desc = $"Admin assigned you: {task.Title}",
                    type = "Assignment",
                    time = task.CreatedAt.ToString("MMM dd, HH:mm")
                });
            }
            else
            {
                task.UserId = currentUserId;
                task.IsAssignedByAdmin = false;
            }

            task.User = null; 
            
            Serilog.Log.Information("Creating task. Assigned to: {UserId}. Payload: {@Task}", task.UserId, task);

            try
            {
                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();
                Serilog.Log.Information("Task created successfully with ID: {TaskId}", task.Id);
                await _hubContext.Clients.All.SendAsync("TaskChanged");
                return Ok(task);
            }
            catch (Exception ex)
            {
                Serilog.Log.Error(ex, "Error saving task to database. Inner Exception: {InnerException}", 
                    ex.InnerException?.Message);
                return BadRequest($"Failed to save task. Database error: {ex.InnerException?.Message ?? ex.Message}");
            }
        }

        // ✅ UPDATE TASK
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskItem updatedTask)
        {
            var currentUserId = GetUserId();
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                Serilog.Log.Warning("UpdateTask failed: Task {TaskId} not found", id);
                return NotFound();
            }

            if (!User.IsInRole("Admin") && task.UserId != currentUserId)
            {
                Serilog.Log.Warning("UpdateTask forbidden: User {UserId} attempted to update Task {TaskId} belonging to User {OwnerId}", currentUserId, id, task.UserId);
                return Forbid();
            }

            var oldStatus = task.Status;
            var oldUserId = task.UserId;

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.Status = updatedTask.Status;
            task.Priority = updatedTask.Priority;
            task.Category = updatedTask.Category;
            task.DueDate = updatedTask.DueDate;
            task.UpdatedAt = DateTime.UtcNow;

            // Allow Admin to reassign task
            if (User.IsInRole("Admin") && !string.IsNullOrEmpty(updatedTask.UserId) && updatedTask.UserId != oldUserId)
            {
                Serilog.Log.Information("Admin {AdminId} reassigning Task {TaskId} from {OldOwner} to {NewOwner}", currentUserId, id, oldUserId, updatedTask.UserId);
                task.UserId = updatedTask.UserId;
                task.IsAssignedByAdmin = true;

                // Notify New Assignee
                await _hubContext.Clients.User(task.UserId).SendAsync("ReceiveNotification", new {
                    title = "Task Reassigned",
                    desc = $"Admin reassigned task to you: {task.Title}",
                    type = "Assignment",
                    time = DateTime.UtcNow.ToString("MMM dd, HH:mm")
                });
            }

            await _context.SaveChangesAsync();
            Serilog.Log.Information("Task {TaskId} updated by User {UserId}. Status changed from {OldStatus} to {NewStatus}", id, currentUserId, oldStatus, task.Status);
            
            // Notify Admin if task is completed by a regular user
            if (oldStatus != "Completed" && task.Status == "Completed" && !User.IsInRole("Admin"))
            {
                var admins = await _userManager.GetUsersInRoleAsync("Admin");
                var adminIds = admins.Select(a => a.Id).ToList();
                
                var userName = User.Identity?.Name ?? "A user";
                
                await _hubContext.Clients.Users(adminIds).SendAsync("ReceiveNotification", new {
                    title = "✅ Task Completed",
                    desc = $"{userName} finished: {task.Title}",
                    type = "Completion",
                    time = DateTime.UtcNow.ToString("HH:mm")
                });
            }

            await _hubContext.Clients.All.SendAsync("TaskChanged");

            return Ok(task);
        }

        // ✅ DELETE TASK
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = GetUserId();
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                Serilog.Log.Warning("DeleteTask failed: Task {TaskId} not found", id);
                return NotFound();
            }

            if (!User.IsInRole("Admin") && task.UserId != userId)
            {
                Serilog.Log.Warning("DeleteTask forbidden: User {UserId} attempted to delete Task {TaskId} belonging to User {OwnerId}", userId, id, task.UserId);
                return Forbid();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            
            Serilog.Log.Information("Task {TaskId} deleted by User {UserId}", id, userId);

            return Ok(new { Message = "Task deleted successfully" });
        }

        // ✅ DASHBOARD (COUNTS)
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            IQueryable<TaskItem> query = _context.Tasks;

            if (!isAdmin)
            {
                query = query.Where(t => t.UserId == userId);
            }

            var result = new
            {
                Completed = await query.CountAsync(t => t.Status == "Completed"),
                Pending = await query.CountAsync(t => t.Status == "Pending"),
                InProgress = await query.CountAsync(t => t.Status == "InProgress"),
                Total = await query.CountAsync(),
                DueToday = await query.CountAsync(t => t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.Today && t.Status != "Completed"),
                Upcoming = await query.CountAsync(t => t.DueDate.HasValue && t.DueDate.Value.Date > DateTime.Today && t.DueDate.Value.Date <= DateTime.Today.AddDays(3) && t.Status != "Completed"),
                Overdue = await query.CountAsync(t => t.DueDate.HasValue && t.DueDate.Value.Date < DateTime.Today && t.Status != "Completed")
            };

            return Ok(result);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var today = DateTime.Today;
            var notifications = new List<object>();

            if (isAdmin)
            {
                // For Admin: Get recently completed tasks by ANY user
                var completedTasks = await _context.Tasks
                    .Include(t => t.User)
                    .Where(t => t.Status == "Completed")
                    .OrderByDescending(t => t.UpdatedAt) // Need to ensure UpdatedAt exists or use Id
                    .Take(5)
                    .Select(t => new
                    {
                        id = t.Id,
                        title = "Task Completed",
                        desc = $"{t.User.UserName} completed: {t.Title}",
                        time = "Recently",
                        type = "Completion"
                    })
                    .ToListAsync();
                
                notifications.AddRange(completedTasks);

                // Also get urgent tasks that might need admin attention
                var urgentTasks = await _context.Tasks
                    .Where(t => t.Status != "Completed")
                    .Where(t => t.DueDate.HasValue && t.DueDate.Value.Date <= today.AddDays(1))
                    .Take(5)
                    .Select(t => new
                    {
                        id = t.Id,
                        title = "Urgent System Task",
                        desc = t.Title,
                        time = t.DueDate.HasValue ? t.DueDate.Value.ToString("MMM dd") : "Due",
                        type = "Deadline"
                    })
                    .ToListAsync();
                
                notifications.AddRange(urgentTasks);
            }
            else
            {
                // For Regular User: Get their specific notifications
                var userNotifications = await _context.Tasks
                    .Where(t => t.UserId == userId)
                    .Where(t => t.Status != "Completed")
                    .Where(t => (t.DueDate.HasValue && t.DueDate.Value.Date <= today.AddDays(3)) || t.IsAssignedByAdmin)
                    .OrderByDescending(t => t.IsAssignedByAdmin)
                    .ThenBy(t => t.DueDate)
                    .Take(5)
                    .Select(t => new
                    {
                        id = t.Id,
                        title = t.IsAssignedByAdmin ? "Admin Assignment" :
                                (t.DueDate.HasValue && t.DueDate.Value.Date < today ? "Overdue Task" :
                                t.DueDate.HasValue && t.DueDate.Value.Date == today ? "Due Today" : "Deadline Approaching"),
                        desc = t.Title,
                        time = t.DueDate.HasValue ? t.DueDate.Value.ToString("MMM dd") : "Just now",
                        type = t.IsAssignedByAdmin ? "Assignment" : "Deadline"
                    })
                    .ToListAsync();
                
                notifications.AddRange(userNotifications);
            }

            return Ok(notifications);
        }

        // ✅ EXPORT TASKS (CSV)
        [HttpGet("export")]
        public async Task<IActionResult> ExportTasks()
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");
            
            IQueryable<TaskItem> query = _context.Tasks;
            if (!isAdmin)
            {
                query = query.Where(t => t.UserId == userId);
            }

            var tasks = await query.ToListAsync();

            var csv = new StringBuilder();
            // BOM for Excel UTF-8 support
            csv.Append('\uFEFF');
            csv.AppendLine("Title,Description,Status,Priority,Category,DueDate");

            foreach (var task in tasks)
            {
                var title = EscapeCsvField(task.Title);
                var desc = EscapeCsvField(task.Description);
                var status = EscapeCsvField(task.Status);
                var priority = EscapeCsvField(task.Priority);
                var category = EscapeCsvField(task.Category);
                var dueDate = task.DueDate?.ToString("yyyy-MM-dd") ?? "";

                csv.AppendLine($"{title},{desc},{status},{priority},{category},{dueDate}");
            }

            byte[] buffer = Encoding.UTF8.GetBytes(csv.ToString());
            return File(buffer, "text/csv", $"ZenTask_Export_{DateTime.Now:yyyyMMdd}.csv");
        }

        private string EscapeCsvField(string? field)
        {
            if (string.IsNullOrEmpty(field)) return "\"\"";
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }

        // ✅ IMPORT TASKS (CSV)
        [HttpPost("import")]
        public async Task<IActionResult> ImportTasks(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var currentUserId = GetUserId();
            var tasks = new List<TaskItem>();
            var errorCount = 0;

            try
            {
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    var header = await reader.ReadLineAsync(); // Skip header
                    string? line;
                    while ((line = await reader.ReadLineAsync()) != null)
                    {
                        if (string.IsNullOrWhiteSpace(line)) continue;

                        try
                        {
                            var parts = ParseCsvLine(line);
                            if (parts.Count < 5) {
                                errorCount++;
                                continue;
                            }

                            var task = new TaskItem
                            {
                                Title = parts[0],
                                Description = parts.Count > 1 ? parts[1] : "",
                                Status = parts.Count > 2 ? parts[2] : "Pending",
                                Priority = parts.Count > 3 ? parts[3] : "Medium",
                                Category = parts.Count > 4 ? parts[4] : "General",
                                DueDate = parts.Count > 5 && DateTime.TryParse(parts[5], out var dt) ? dt : null,
                                UserId = currentUserId
                            };

                            // Validate essential fields
                            if (string.IsNullOrWhiteSpace(task.Title)) {
                                errorCount++;
                                continue;
                            }

                            tasks.Add(task);
                        }
                        catch
                        {
                            errorCount++;
                        }
                    }
                }

                if (tasks.Count > 0)
                {
                    _context.Tasks.AddRange(tasks);
                    await _context.SaveChangesAsync();
                    
                    // Notify clients of bulk change
                    await _hubContext.Clients.All.SendAsync("TaskChanged");
                }

                return Ok(new { 
                    Message = $"{tasks.Count} tasks imported successfully.", 
                    Errors = errorCount > 0 ? $"{errorCount} lines were skipped due to formatting errors." : null 
                });
            }
            catch (Exception ex)
            {
                Serilog.Log.Error(ex, "Error importing tasks from CSV");
                return BadRequest($"Import failed: {ex.Message}");
            }
        }

        private List<string> ParseCsvLine(string line)
        {
            var result = new List<string>();
            var current = new StringBuilder();
            var inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                if (line[i] == '\"')
                {
                    inQuotes = !inQuotes;
                }
                else if (line[i] == ',' && !inQuotes)
                {
                    result.Add(current.ToString());
                    current.Clear();
                }
                else
                {
                    current.Append(line[i]);
                }
            }
            result.Add(current.ToString());
            return result;
        }
    }
}