import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private taskCallbacks: Array<() => void> = [];
  private notificationCallbacks: Array<(data: unknown) => void> = [];

  public async connect(): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5110';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/taskHub`, {
        accessTokenFactory: () => token || '',
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('TaskChanged', () => {
      this.taskCallbacks.forEach((callback) => callback());
    });

    this.connection.on('ReceiveNotification', (data: unknown) => {
      this.notificationCallbacks.forEach((callback) => callback(data));
    });

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log('SignalR disconnected');
    } catch (error) {
      console.error('SignalR disconnect error:', error);
    } finally {
      this.connection = null;
    }
  }

  public onTaskChanged(callback: () => void): () => void {
    this.taskCallbacks.push(callback);

    return () => {
      this.taskCallbacks = this.taskCallbacks.filter(
        (item) => item !== callback
      );
    };
  }

  public onNotificationReceived(
    callback: (data: unknown) => void
  ): () => void {
    this.notificationCallbacks.push(callback);

    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(
        (item) => item !== callback
      );
    };
  }
}

export const signalRService = new SignalRService();