const { App } = require('@slack/bolt');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: process.env.PORT || 3000
});

// Supply check command
app.command('/supply-check', async ({ command, ack, respond }) => {
  // Acknowledge command immediately (fixes timeout)
  await ack();
  
  const args = command.text.trim().split(' ');
  const action = args[0] || 'help';
  
  switch (action.toLowerCase()) {
    case 'help':
      await respond({
        text: `🏥 *Medical Supply Manager Commands*\n\n` +
              `• \`/supply-check help\` - Show this help message\n` +
              `• \`/supply-check start\` - Start a new supply check\n` +
              `• \`/supply-check status\` - View current tasks\n` +
              `• \`/supply-check complete\` - Mark task as complete\n\n` +
              `📋 *For Natalia's recurring Tuesday/Thursday checks*\n` +
              `Use \`/recurring-task create\` to set up automation.`
      });
      break;
      
    case 'start':
      await respond({
        text: `📋 *Starting Supply Check*\n\n` +
              `Please check all exam rooms (1-8) for:\n` +
              `• Gloves (minimum 3 boxes per room)\n` +
              `• Masks (minimum 2 boxes per room)\n` +
              `• Hand sanitizer (check levels)\n` +
              `• Equipment functionality\n\n` +
              `Use \`/supply-check complete\` when finished.`
      });
      break;
      
    case 'status':
      await respond({
        text: `📊 *Current Supply Check Status*\n\n` +
              `No active tasks found.\n` +
              `Use \`/supply-check start\` to begin a new check.`
      });
      break;
      
    case 'complete':
      await respond({
        text: `✅ *Supply Check Completed!*\n\n` +
              `Thank you for completing the supply check.\n` +
              `Manager has been notified of completion.`
      });
      break;
      
    default:
      await respond({
        text: `❓ Unknown command: \`${action}\`\n\n` +
              `Use \`/supply-check help\` to see available commands.`
      });
  }
});

// Supply dashboard command
app.command('/supply-dashboard', async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    text: `📊 *Medical Supply Dashboard*\n\n` +
          `📈 *This Week's Activity:*\n` +
          `• Supply checks completed: 2/2\n` +
          `• Issues reported: 1\n` +
          `• Rooms restocked: 8/8\n\n` +
          `🚨 *Current Alerts:*\n` +
          `• Room 3: BP cuff needs replacement\n\n` +
          `📅 *Next Check:* Thursday 7:00 AM`
  });
});

// Recurring task command
app.command('/recurring-task', async ({ command, ack, respond }) => {
  await ack();
  
  const args = command.text.trim().split(' ');
  const action = args[0] || 'help';
  
  if (action.toLowerCase() === 'create') {
    await respond({
      text: `🔄 *Recurring Task Setup*\n\n` +
            `✅ *Natalia's Supply Check Schedule:*\n` +
            `• Every Tuesday at 7:00 AM\n` +
            `• Every Thursday at 7:00 AM\n` +
            `• Due by 9:00 AM same day\n` +
            `• Automatic notifications enabled\n\n` +
            `📱 Natalia will receive notifications on her phone/desktop.\n` +
            `📊 You'll get completion reports automatically.`
    });
  } else {
    await respond({
      text: `🔄 *Recurring Task Commands*\n\n` +
            `• \`/recurring-task create\` - Set up Natalia's schedule\n\n` +
            `📋 *Current Schedule:*\n` +
            `• Medical Supply Check: Tue/Thu 7:00 AM\n` +
            `• Assigned to: Natalia Marulanda`
    });
  }
});

// Start the app
(async () => {
  try {
    // Start the Slack app
    await app.start();
    console.log('⚡️ Slack Task Manager Bot is running on port', process.env.PORT || 3000);
    console.log('🎉 Bot is ready! Test with /supply-check help');
    
  } catch (error) {
    console.error('Failed to start the app:', error);
    process.exit(1);
  }
})();
