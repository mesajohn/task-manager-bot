# Slack Task Manager Bot - Prototype

A working prototype of a Slack bot that automates task assignment and tracking for teams.

## Features

- ✅ Create tasks via slash commands or interactive modals
- ✅ Assign tasks to team members with automatic notifications
- ✅ Track task status and completion
- ✅ Interactive App Home dashboard
- ✅ Task management via buttons and overflow menus
- ✅ SQLite database for persistent storage

## Quick Start

### 1. Prerequisites

- Node.js 16+ installed
- A Slack workspace where you have admin permissions
- ngrok or similar tool for local development (optional)

### 2. Slack App Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name: "Task Manager Bot"
4. Select your workspace

#### Configure OAuth Scopes
Add these Bot Token Scopes in **OAuth & Permissions**:
- `app_mentions:read`
- `channels:read`
- `chat:write`
- `chat:write.public`
- `commands`
- `im:read`
- `im:write`
- `users:read`

#### Enable Events
In **Event Subscriptions**:
- Enable Events: ON
- Request URL: `https://your-domain.com/slack/events`
- Subscribe to bot events: `app_home_opened`

#### Add Slash Command
In **Slash Commands**:
- Command: `/task`
- Request URL: `https://your-domain.com/slack/events`
- Short Description: "Manage tasks"

#### Enable Interactivity
In **Interactivity & Shortcuts**:
- Request URL: `https://your-domain.com/slack/events`

### 3. Installation

```bash
# Clone or download the project
cd task-manager-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 4. Configuration

Edit `.env` file with your Slack app credentials:

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database/taskmanager.db
```

### 5. Run the Bot

```bash
# Start the application
npm start

# For development with auto-reload
npm run dev
```

The bot will start on port 3000. Make sure your Slack app's Request URL points to your server.

## Usage

### Slash Commands

- `/task` - Show help and available commands
- `/task create` - Open task creation modal
- `/task list` - View your assigned tasks
- `/task complete [task_id]` - Mark a task as complete

### Interactive Features

1. **App Home**: Click on the bot in your Slack sidebar to view your task dashboard
2. **Task Creation**: Use the "Create Task" button or `/task create` command
3. **Task Management**: Use overflow menus on task cards for actions
4. **Notifications**: Receive automatic notifications when tasks are assigned

### Workflow Example

1. Manager runs `/task create`
2. Fills out the task creation modal (title, description, assignee, priority)
3. Task is created and assignee receives notification
4. Assignee can accept task, ask questions, or mark complete
5. Manager receives completion notifications

## Database

The prototype uses SQLite for simplicity. The database file is created automatically at `./database/taskmanager.db`.

### Tables Created:
- `users` - Slack user information
- `tasks` - Task details and status
- `comments` - Task comments and status updates

## Development

### Project Structure

```
src/
├── app.js              # Main application
├── config/
│   └── database.js     # Database configuration
├── models/             # Sequelize models
│   ├── User.js
│   ├── Task.js
│   ├── Comment.js
│   └── index.js
├── services/           # Business logic
│   ├── userService.js
│   └── taskService.js
└── utils/
    └── blockKit.js     # UI components
```

### Adding Features

The prototype provides a solid foundation for additional features:

- Task due dates and reminders
- File attachments
- Task categories and tags
- Advanced reporting
- Integration with external tools

## Deployment

For production deployment:

1. Use a production database (PostgreSQL recommended)
2. Set up proper environment variables
3. Configure HTTPS endpoint for Slack webhooks
4. Implement proper error handling and logging
5. Add monitoring and health checks

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check that Request URL is correct and accessible
2. **Database errors**: Ensure write permissions for database directory
3. **Token errors**: Verify Slack app tokens are correct and have proper scopes

### Logs

The application logs important events to console. Check logs for error details.

## License

ISC License - See package.json for details.

## Support

This is a prototype for demonstration purposes. For production use, additional security, error handling, and scalability considerations should be implemented.

