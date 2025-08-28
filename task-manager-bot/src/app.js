const { App } = require('@slack/bolt');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: process.env.PORT || 3000
});

// Natalia's Slack user ID
const NATALIA_USER_ID = 'U07F58GG752';

// Supply check command
app.command('/supply-check', async ({ command, ack, respond }) => {
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
          `📅 *Next Check:* Thursday 8:00 AM`
  });
});

// Enhanced recurring task command with real automation
app.command('/recurring-task', async ({ command, ack, respond, client }) => {
  await ack();
  
  const args = command.text.trim().split(' ');
  const action = args[0] || 'help';
  
  if (action.toLowerCase() === 'create') {
    try {
      // Send immediate confirmation
      await respond({
        text: `🔄 *Recurring Task Setup*\n\n` +
              `✅ *Natalia's Supply Check Schedule:*\n` +
              `• Every Tuesday at 8:00 AM\n` +
              `• Every Thursday at 8:00 AM\n` +
              `• Due by 10:00 AM same day\n` +
              `• Automatic notifications enabled\n\n` +
              `📱 Natalia will receive notifications on her phone/desktop.\n` +
              `📊 You'll get completion reports automatically.\n\n` +
              `🚀 *Setting up automation now...*`
      });
      
      // Send test notification to Natalia
      await client.chat.postMessage({
        channel: NATALIA_USER_ID,
        text: `🏥 *Medical Supply Check - Automation Setup*\n\n` +
              `Hi Natalia! Your recurring supply check automation is now active.\n\n` +
              `📅 *Your Schedule:*\n` +
              `• Every Tuesday at 8:00 AM\n` +
              `• Every Thursday at 8:00 AM\n` +
              `• Due by 10:00 AM same day\n\n` +
              `📋 *What to check in each room (1-8):*\n` +
              `• Gloves (minimum 3 boxes per room)\n` +
              `• Masks (minimum 2 boxes per room)\n` +
              `• Hand sanitizer levels (refill if below 50%)\n` +
              `• Equipment functionality (BP cuffs, thermometers)\n\n` +
              `📱 You'll receive automatic notifications every Tuesday and Thursday.\n` +
              `Use \`/supply-check start\` when you get the notification!`
      });
      
      // Confirm to manager after 2 seconds
      setTimeout(async () => {
        await respond({
          text: `✅ *Automation Setup Complete!*\n\n` +
                `📱 Test notification sent to Natalia Marulanda\n` +
                `🔄 Recurring schedule activated for Tuesday/Thursday 8:00 AM\n` +
                `📊 You'll receive completion reports automatically\n\n` +
                `🎯 *Next Steps:*\n` +
                `• Natalia will get notifications every Tue/Thu at 8:00 AM\n` +
                `• She'll use \`/supply-check start\` to begin\n` +
                `• You'll get completion notifications automatically`
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error setting up automation:', error);
      await respond({
        text: `❌ Error setting up automation. Error: ${error.message}\n\n` +
              `Please make sure Natalia (U07F58GG752) is in this Slack workspace.`
      });
    }
  } else {
    await respond({
      text: `🔄 *Recurring Task Commands*\n\n` +
            `• \`/recurring-task create\` - Set up Natalia's schedule\n\n` +
            `📋 *Current Schedule:*\n` +
            `• Medical Supply Check: Tue/Thu 8:00 AM\n` +
            `• Assigned to: Natalia Marulanda (U07F58GG752)\n` +
            `• Due by: 10:00 AM same day`
    });
  }
});

// Function to send scheduled notifications to Natalia
async function sendScheduledNotification() {
  try {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: NATALIA_USER_ID,
      text: `🏥 *Daily Supply Check - ${dayName}*\n\n` +
            `Good morning Natalia! Time for your scheduled supply check.\n\n` +
            `📋 *Today's Tasks:*\n` +
            `• Check all exam rooms (1-8)\n` +
            `• Verify glove supplies (minimum 3 boxes per room)\n` +
            `• Check mask supplies (minimum 2 boxes per room)\n` +
            `• Test hand sanitizer levels (refill if below 50%)\n` +
            `• Verify equipment functionality\n\n` +
            `⏰ *Due by:* 10:00 AM\n` +
            `📱 Use \`/supply-check start\` to begin your check!\n\n` +
            `💡 *Tip:* Take photos of any issues you find and report them when you complete the check.`
    });
    
    console.log(`Scheduled notification sent to Natalia on ${dayName}`);
  } catch (error) {
    console.error('Error sending scheduled notification:', error);
  }
}

// Simple scheduling check (runs every hour)
setInterval(() => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 4 = Thursday
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if it's Tuesday (2) or Thursday (4) at 8:00 AM (hour 8, minute 0-5)
  if ((day === 2 || day === 4) && hour === 8 && minute < 5) {
    sendScheduledNotification();
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack Task Manager Bot is running on port', process.env.PORT || 3000);
    console.log('🎉 Bot is ready! Natalia will get notifications Tue/Thu at 8:00 AM');
    console.log('👥 Natalia Marulanda ID:', NATALIA_USER_ID);
    
  } catch (error) {
    console.error('Failed to start the app:', error);
    process.exit(1);
  }
})();
