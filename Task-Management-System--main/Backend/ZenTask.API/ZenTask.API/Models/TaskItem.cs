namespace ZenTask.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Status { get; set; } // Pending, InProgress, Completed

        public string? Priority { get; set; } // High, Medium, Low

        public string? Category { get; set; }

        public DateTime? DueDate { get; set; }

        public string? UserId { get; set; }
        
        public ApplicationUser? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public string? CreatedByUserId { get; set; }

        public bool IsAssignedByAdmin { get; set; }
    }
}