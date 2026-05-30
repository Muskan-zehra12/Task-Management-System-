using Microsoft.AspNetCore.SignalR;

namespace ZenTask.API.Hubs
{
    public class TaskHub : Hub
    {
        public async Task NotifyTaskChanged()
        {
            await Clients.All.SendAsync("TaskChanged");
        }
    }
}