# ZenTask

ZenTask is a modern, real-time Task Management System designed for efficiency and collaboration. Built with a robust .NET API backend and a responsive React frontend, it provides a seamless experience for organizing tasks, tracking progress, and managing user profiles.

## Features
- **Real-time Updates:** Stay synced with your tasks using SignalR.
- **User Authentication & Authorization:** Secure registration, login, and profile management with role-based access control (Admin/Regular User).
- **Task Management:** Create, view, update, and delete tasks. Admins can assign tasks to other users.
- **Bulk Operations:** Export tasks to CSV and import from CSV for efficient data management.
- **Modern UI:** Clean, responsive design built with React, TypeScript, and Vanilla CSS.
- **Theming:** Full light and dark mode support for a personalized experience.
- **Reliability:** Global exception handling and comprehensive unit testing ensure a stable experience.

## Tech Stack
### Backend
- **Framework:** .NET 9
- **Database:** Entity Framework Core
- **Real-time:** SignalR
- **Architecture:** ASP.NET Web API

### Frontend
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Vanilla CSS
- **State Management:** React Context API

## Getting Started
### Prerequisites
- [.NET SDK 9.0](https://dotnet.microsoft.com/)
- [Node.js (LTS version)](https://nodejs.org/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Muskan-zehra12/Task-Management-System-.git
   cd Task-Management-System-
   ```

2. **Backend Setup:**
   ```bash
   cd Backend/ZenTask.API
   dotnet restore
   dotnet run
   ```

3. **Frontend Setup:**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## Architecture & Implementation
ZenTask follows a decoupled architecture separating concerns between the client and server:

- **Clean Architecture Principles:** The Backend separates concerns by organizing into layers (Models, Controllers, Hubs, Data), ensuring maintainability and scalability.
- **Asynchronous Communication:** Leveraging ASP.NET SignalR facilitates real-time bidirectional communication, allowing the UI to react instantly to data changes without manual polling.
- **RESTful API Design:** The backend exposes a strictly typed JSON API, ensuring high compatibility and predictable error handling.
- **State Management:** The frontend utilizes the React Context API to manage the global authentication state and theme preferences across the application tree without prop drilling.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Registers a new user with Identity. |
| POST | `/api/auth/login` | Authenticates a user and returns a bearer token. |
| GET | `/api/tasks` | Retrieves all tasks for the authenticated user. |
| POST | `/api/tasks` | Creates a new task item. |
| PUT | `/api/tasks/{id}` | Updates an existing task by ID. |
| DELETE | `/api/tasks/{id}` | Removes a specific task. |

## Why this approach?
- **TypeScript:** Used for both frontend and types definition to enforce strict typing, reducing runtime bugs.
- **SignalR:** Chosen over standard polling for real-time responsiveness, essential for collaborative task management systems.
- **Vite:** Chosen as the build tool for its superior hot-module replacement (HMR) and development performance compared to Webpack-based alternatives.
- **Vanilla CSS:** Kept styling lightweight and dependency-free to ensure maximum control over the visual design and to avoid bloated CSS frameworks.
