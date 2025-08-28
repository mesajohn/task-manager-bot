class BlockKitBuilder {
  static createTaskCard(task) {
    const priorityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };

    const statusEmoji = {
      not_started: '⚪',
      in_progress: '🟡',
      blocked: '🔴',
      review: '🔵',
      complete: '🟢'
    };

    const dueText = task.dueDate 
      ? `*Due:* ${new Date(task.dueDate).toLocaleDateString()}`
      : '*Due:* Not set';

    const assigneeText = task.assignee 
      ? `<@${task.assignee.slackId}>`
      : 'Unassigned';

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📋 ${task.title}*\n${task.description || '_No description_'}\n\n*Assigned to:* ${assigneeText}\n${dueText}\n*Priority:* ${priorityEmoji[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}\n*Status:* ${statusEmoji[task.status]} ${task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)} ${task.progress > 0 ? `(${task.progress}%)` : ''}`
      },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: { type: 'plain_text', text: 'Mark Complete' },
            value: `complete_task_${task.id}`
          },
          {
            text: { type: 'plain_text', text: 'Update Status' },
            value: `update_status_${task.id}`
          },
          {
            text: { type: 'plain_text', text: 'Add Comment' },
            value: `add_comment_${task.id}`
          }
        ],
        action_id: 'task_overflow_menu'
      }
    };
  }

  static createTaskCreationModal() {
    return {
      type: 'modal',
      callback_id: 'task_creation_modal',
      title: { type: 'plain_text', text: 'Create New Task' },
      submit: { type: 'plain_text', text: 'Create Task' },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: 'input',
          block_id: 'task_title',
          label: { type: 'plain_text', text: 'Task Title' },
          element: {
            type: 'plain_text_input',
            action_id: 'title_input',
            placeholder: { type: 'plain_text', text: 'Enter task title...' },
            max_length: 100
          }
        },
        {
          type: 'input',
          block_id: 'task_description',
          label: { type: 'plain_text', text: 'Description' },
          optional: true,
          element: {
            type: 'plain_text_input',
            action_id: 'description_input',
            multiline: true,
            placeholder: { type: 'plain_text', text: 'Describe the task requirements...' }
          }
        },
        {
          type: 'input',
          block_id: 'task_assignee',
          label: { type: 'plain_text', text: 'Assign to' },
          element: {
            type: 'users_select',
            action_id: 'assignee_select',
            placeholder: { type: 'plain_text', text: 'Select team member...' }
          }
        },
        {
          type: 'input',
          block_id: 'task_priority',
          label: { type: 'plain_text', text: 'Priority' },
          optional: true,
          element: {
            type: 'radio_buttons',
            action_id: 'priority_select',
            initial_option: {
              text: { type: 'plain_text', text: '🟡 Medium' },
              value: 'medium'
            },
            options: [
              { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' },
              { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },
              { text: { type: 'plain_text', text: '🟠 High' }, value: 'high' },
              { text: { type: 'plain_text', text: '🔴 Urgent' }, value: 'urgent' }
            ]
          }
        }
      ]
    };
  }

  static createAppHomeView(user, tasks, stats) {
    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📋 Task Management Dashboard' }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '➕ Create Task' },
            style: 'primary',
            action_id: 'create_task_button'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '📊 My Tasks' },
            action_id: 'view_my_tasks'
          }
        ]
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*📈 Quick Stats*' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Active Tasks:*\n${(stats.not_started || 0) + (stats.in_progress || 0) + (stats.blocked || 0) + (stats.review || 0)}` },
          { type: 'mrkdwn', text: `*Completed:*\n${stats.complete || 0}` },
          { type: 'mrkdwn', text: `*In Progress:*\n${stats.in_progress || 0}` },
          { type: 'mrkdwn', text: `*Blocked:*\n${stats.blocked || 0}` }
        ]
      },
      { type: 'divider' }
    ];

    if (tasks.length > 0) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: '*🎯 My Active Tasks*' }
      });

      tasks.slice(0, 3).forEach(task => {
        blocks.push(this.createTaskCard(task));
      });

      if (tasks.length > 3) {
        blocks.push({
          type: 'section',
          text: { type: 'mrkdwn', text: `_... and ${tasks.length - 3} more tasks_` }
        });
      }
    } else {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: '*🎯 No active tasks*\nYou\'re all caught up! 🎉' }
      });
    }

    return {
      type: 'home',
      blocks: blocks
    };
  }

  static createTaskAssignmentNotification(task) {
    return [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📋 New Task Assigned' }
      },
      this.createTaskCard(task),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Accept Task' },
            style: 'primary',
            action_id: 'accept_task',
            value: task.id.toString()
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '💬 Ask Question' },
            action_id: 'ask_question',
            value: task.id.toString()
          }
        ]
      }
    ];
  }
}

module.exports = BlockKitBuilder;

