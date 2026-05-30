using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Security.Claims;
using ZenTask.API.Controllers;
using ZenTask.API.Data;
using ZenTask.API.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ZenTask.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly Mock<RoleManager<IdentityRole>> _mockRoleManager;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly AppDbContext _db;

        public AuthControllerTests()
        {
            var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(userStoreMock.Object, null, null, null, null, null, null, null, null);
            
            var roleStoreMock = new Mock<IRoleStore<IdentityRole>>();
            _mockRoleManager = new Mock<RoleManager<IdentityRole>>(roleStoreMock.Object, null, null, null, null);
            
            _mockConfiguration = new Mock<IConfiguration>();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _db = new AppDbContext(options);
        }

        [Fact]
        public async Task Register_FirstUser_AssignsAdminRole()
        {
            // Arrange
            var model = new RegisterModel { Username = "admin", Email = "admin@zentask.com", Password = "Password123" };
            
            _mockUserManager.Setup(u => u.FindByNameAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser)null);
            _mockUserManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser)null);
            _mockUserManager.Setup(u => u.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
            
            _mockRoleManager.Setup(r => r.RoleExistsAsync(It.IsAny<string>())).ReturnsAsync(true);
            
            // Mocking GetUsersInRoleAsync to return empty list (simulating first user)
            _mockUserManager.Setup(u => u.GetUsersInRoleAsync("Admin")).ReturnsAsync(new List<ApplicationUser>());

            var controller = new AuthController(_mockUserManager.Object, _mockRoleManager.Object, _mockConfiguration.Object, _db);

            // Act
            var result = await controller.Register(model);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            _mockUserManager.Verify(u => u.AddToRoleAsync(It.IsAny<ApplicationUser>(), "Admin"), Times.Once);
        }

        [Fact]
        public async Task UpdateProfile_RegularUser_ChangesOwnInfo()
        {
            // Arrange
            var user = new ApplicationUser { Id = "user-123", UserName = "oldname", Email = "old@email.com" };
            var model = new UpdateProfileModel { Username = "newname", Email = "new@email.com" };

            _mockUserManager.Setup(u => u.FindByIdAsync("user-123")).ReturnsAsync(user);
            _mockUserManager.Setup(u => u.UpdateAsync(It.IsAny<ApplicationUser>())).ReturnsAsync(IdentityResult.Success);
            _mockUserManager.Setup(u => u.GetRolesAsync(It.IsAny<ApplicationUser>())).ReturnsAsync(new List<string> { "Regular User" });

            var controller = new AuthController(_mockUserManager.Object, _mockRoleManager.Object, _mockConfiguration.Object, _db);
            
            var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, "user-123") };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await controller.UpdateProfile(model);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("newname", user.UserName);
            Assert.Equal("new@email.com", user.Email);
        }
    }
}
