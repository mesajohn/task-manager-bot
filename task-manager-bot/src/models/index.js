const User = require('./User');
const Task = require('./Task');
const Comment = require('./Comment');

// User associations
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'creatorId' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });
User.hasMany(Comment, { foreignKey: 'userId' });

// Task associations
Task.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
Task.hasMany(Comment, { foreignKey: 'taskId', onDelete: 'CASCADE' });

// Comment associations
Comment.belongsTo(Task, { foreignKey: 'taskId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Task,
  Comment
};

