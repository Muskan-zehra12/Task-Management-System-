using Microsoft.AspNetCore.Identity;

namespace ZenTask.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
    }
}
