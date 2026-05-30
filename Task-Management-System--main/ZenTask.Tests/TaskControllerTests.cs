using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using System.Linq;
using ZenTask.API.Controllers;
using ZenTask.API.Data;
using ZenTask.API.Models;
using ZenTask.API.Hubs;
using Xunit;

namespace ZenTask.Tests
{
    public class TaskControllerTests
    {
        private readonly Mock<IHubContext<TaskHub>> _mockHubContext;
        private readonly Mock<IHubClients> _mockClients;
        private readonly Mock<IClientProxy> _mockClientProxy;
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;

        public TaskControllerTests()
        {
            _mockHubContext = new Mock<IHubContext<TaskHub>>();
            _mockClients = new Mock<IHubClients>();
            _mockClientProxy = new Mock<IClientProxy>();
            
            _mockHubContext.Setup(h => h.Clients).Returns(_mockClients.Object);
            _mockClients.Setup(c => c.All).Returns(_mockClientProxy.Object);
            _mockClients.Setup(c => c.User(It.IsAny<string>())).Returns(_mockClientProxy.Object);

            var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(userStoreMock.Object, null, null, null, null, null, null, null, null);
        }

        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();
            return databaseContext;
        }

        [Fact]
        public async Task GetTasks_ReturnsUserSpecificTasks()
        {
            // Arrange
            var db = GetDatabaseContext();
            db.Tasks.Add(new TaskItem { Title = "Task 1", UserId = "user1" });
            db.Tasks.Add(new TaskItem { Title = "Task 2", UserId = "user2" });
            await db.SaveChangesAsync();

            var controller = new TaskController(db, _mockUserManager.Object, _mockHubContext.Object);
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user1"),
                new Claim(ClaimTypes.Name, "user1"),
                new Claim(ClaimTypes.Role, "Regular User")
            }, "mock"));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            // Act
            var result = await controller.GetTasks(null, null, null, null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            // Since it returns a projected anonymous type, we check if it's an enumerable
            var tasks = Assert.IsAssignableFrom<System.Collections.IEnumerable>(okResult.Value);
            var taskList = tasks.Cast<object>().ToList();
            Assert.Single(taskList);
        }

        [Fact]
        public async Task CreateTask_AdminCanAssignToOtherUser()
        {
            // Arrange
            var db = GetDatabaseContext();
            var controller = new TaskController(db, _mockUserManager.Object, _mockHubContext.Object);
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "admin1"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "mock"));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            var newTask = new TaskItem { Title = "Task for user2", UserId = "user2" };

            // Act
            var result = await controller.CreateTask(newTask);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var task = Assert.IsType<TaskItem>(okResult.Value);
            Assert.Equal("user2", task.UserId);
        }

        [Fact]
        public async Task ExportTasks_ReturnsCsvFile()
        {
            // Arrange
            var db = GetDatabaseContext();
            db.Tasks.Add(new TaskItem { Title = "Export Task", UserId = "user1" });
            await db.SaveChangesAsync();

            var controller = new TaskController(db, _mockUserManager.Object, _mockHubContext.Object);
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user1")
            }, "mock"));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            // Act
            var result = await controller.ExportTasks();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("text/csv", fileResult.ContentType);
            Assert.StartsWith("ZenTask_Export_", fileResult.FileDownloadName);
            var csvContent = System.Text.Encoding.UTF8.GetString(fileResult.FileContents);
            Assert.Contains("Export Task", csvContent);
        }
    }
}
