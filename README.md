# MyTasks

MyTasks is a full-stack task management application built with a Node.js/Express backend and a React frontend (powered by Vite). It supports team collaboration, user authentication, task boards and sprints.

## Features
- User signup and login with JWT authentication
- Team management: create teams, join teams, view members
- Task management: create, list, update and delete tasks per team
- Board and sprint management for organizing work
- React frontend using Vite and Tailwind CSS

## Prerequisites
- [Node.js](https://nodejs.org/) and npm
- A MongoDB instance

## Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root with:
   ```env
   MONGODB_URI=<your mongodb uri>
   PORT=3000
   ```
3. Start the API server:
   ```bash
   node server.js
   ```

## Frontend Setup
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd vite_frontend/my-project
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on Vite's default port (usually `5173`) and interacts with the backend API running on port `3000`.

## Testing
Currently no automated tests are defined. You can still run the default npm test command:
```bash
npm test
```
which will report that no test script is configured.

## License
This project does not currently specify a license.
