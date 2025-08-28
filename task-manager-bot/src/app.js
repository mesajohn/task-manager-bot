const { App } = require('@slack/bolt');
const sequelize = require('./config/database');
const { User, Task, Comment } = require('./models');
const userService = require('./services/userService');
const taskService = require('./services/taskService');
const BlockKitBuilder = require('./utils/blockKit');

require('dotenv').config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false
});

// App Home opened event
app.event('app_home_opened', async ({ event, client }) => {
  try {
    console.log(`App home opened by user: ${event.user}`);
    const user = await userService.findOrCreateUser(event.user);
    const tasks = await taskService.getUserTasks(user.id, ['not_started', 'in_progress', 'blocked', 'review']);
    const stats = await taskService.getTaskStats(user.id);
    
    const homeView = BlockKitBuilder.createAppHomeView(user, tasks, stats);
    
    await client.views.publish({
      user_id: event.user,
      view: homeView
    });
  } catch (error) {
    console.error('Error handling app_home_opened:', error);
  }
});

// Task command
app.command('/task', async ({ command, ack, respond, client }) => {
  await ack();
  
  try {
    const user = await userService.findOrCreateUser(command.user_id);
    const args = command.text.trim().split(' ');
    const action = args[0]?.toLowerCase();

    switch (action) {
      case 'create':
        const modal = BlockKitBuilder.createTaskCreationModal();
        await client.views.open({
          trigger_id: command.trigger_id,
          view: modal
        });
        break;
        
      case 'list':
        const tasks = await taskService.getUserTasks(user.id);
        
        if (tasks.length === 0) {
          await respond({
            text: 'You have no tasks assigned. Great job! 🎉',
            response_type: 'ephemeral'
          });
          return;
        }

        const blocks = [
          {
            type: 'header',
            text: { type: 'plain_text', text: '📋 Your Tasks' }
          }
        ];

        tasks.forEach(task => {
          blocks.push(BlockKitBuilder.createTaskCard(task));
          blocks.push({ type: 'divider' });
        });

        await respond({
          text: `You have ${tasks.length} task(s)`,
          blocks: blocks,
          response_type: 'ephemeral'
        });
        break;
        
      case 'complete':
        const taskId = parseInt(args[1]);
        if (!taskId) {
          await respond({
            text: 'Please provide a task ID. Usage: `/task complete [task_id]`',
            response_type: 'ephemeral'
          });
          return;
        }

        const task = await taskService.getTaskById(taskId);
        if (!task) {
          await respond({
            text: 'Task not found.',
            response_type: 'ephemeral'
          });
          return;
        }

        if (task.assigneeId !== user.id) {
          await respond({
            text: 'You can only complete tasks assigned to you.',
            response_type: 'ephemeral'
          });
          return;
        }

        await taskService.updateTaskStatus(task.id, 'complete', user.id, 'Completed via slash command');
        
        await respond({
          text: `✅ Task "${task.title}" marked as complete!`,
          response_type: 'ephemeral'
        });
        break;
        
      default:
        await respond({
          text: 'Task Management Commands',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Task Management Commands:*\n\n• `/task create` - Create a new task\n• `/task list` - View your tasks\n• `/task complete [task_id]` - Mark task as complete'
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '➕ Create Task' },
                  style: 'primary',
                  action_id: 'create_task_button'
                }
              ]
            }
          ]
        });
    }
  } catch (error) {
    console.error('Error handling task command:', error);
    await respond({
      text: 'Sorry, something went wrong. Please try again.',
      response_type: 'ephemeral'
    });
  }
});

// Button interactions
app.action('create_task_button', async ({ ack, body, client }) => {
  await ack();
  
  try {
    const modal = BlockKitBuilder.createTaskCreationModal();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: modal
    });
  } catch (error) {
    console.error('Error opening task creation modal:', error);
  }
});

app.action('accept_task', async ({ ack, body, respond }) => {
  await ack();
  
  try {
    const taskId = parseInt(body.actions[0].value);
    const user = await userService.findOrCreateUser(body.user.id);
    
    await taskService.updateTaskStatus(taskId, 'in_progress', user.id, 'Task accepted');
    
    await respond({
      text: '✅ Task accepted and marked as in progress!',
      replace_original: false,
      response_type: 'ephemeral'
    });
  } catch (error) {
    console.error('Error accepting task:', error);
  }
});

app.action('task_overflow_menu', async ({ ack, body, respond }) => {
  await ack();
  
  try {
    const action = body.actions[0].selected_option.value;
    const taskId = parseInt(action.split('_').pop());
    const user = await userService.findOrCreateUser(body.user.id);
    
    if (action.startsWith('complete_task_')) {
      const task = await taskService.getTaskById(taskId);
      
      if (task.assigneeId !== user.id) {
        await respond({
          text: '❌ You can only complete tasks assigned to you.',
          response_type: 'ephemeral'
        });
        return;
      }

      await taskService.updateTaskStatus(taskId, 'complete', user.id, 'Marked complete via button');
      
      await respond({
        text: `✅ Task "${task.title}" marked as complete!`,
        response_type: 'ephemeral'
      });
    }
  } catch (error) {
    console.error('Error handling overflow menu action:', error);
  }
});

// Modal submissions
app.view('task_creation_modal', async ({ ack, body, view, client }) => {
  await ack();
  
  try {
    const user = await userService.findOrCreateUser(body.user.id);
    const values = view.state.values;
    
    const taskData = {
      title: values.task_title.title_input.value,
      description: values.task_description.description_input.value || null,
      creatorId: user.id,
      assigneeId: null,
      priority: values.task_priority.priority_select.selected_option?.value || 'medium'
    };

    // Get assignee user
    if (values.task_assignee.assignee_select.selected_user) {
      const assigneeSlackId = values.task_assignee.assignee_select.selected_user;
      const assignee = await userService.findOrCreateUser(assigneeSlackId);
      taskData.assigneeId = assignee.id;
    }

    const task = await taskService.createTask(taskData);
    
    // Send notification to assignee
    if (task.assignee) {
      const notificationBlocks = BlockKitBuilder.createTaskAssignmentNotification(task);
      await client.chat.postMessage({
        channel: task.assignee.slackId,
        blocks: notificationBlocks
      });
    }

    // Send confirmation to creator
    await client.chat.postMessage({
      channel: body.user.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Task Created Successfully*\n\nTask: *${task.title}*\nAssigned to: ${task.assignee ? `<@${task.assignee.slackId}>` : 'Unassigned'}\nTask ID: ${task.id}`
          }
        }
      ]
    });
  } catch (error) {
    console.error('Error creating task:', error);
  }
});

// Error handling
app.error(async (error) => {
  console.error('Slack app error:', error);
});

// Database initialization
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
}

// Start the application
async function start() {
  try {
    await initializeDatabase();
    
    // Start Slack app
    const port = process.env.PORT || 3000;
    await app.start(port);
    console.log(`⚡️ Slack Task Manager Bot is running on port ${port}!`);
    console.log('🔗 Make sure to set your Request URL to: https://your-domain.com/slack/events');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

start();

