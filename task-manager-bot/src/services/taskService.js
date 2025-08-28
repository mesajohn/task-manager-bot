const { Task, User, Comment } = require('../models');
const { Op } = require('sequelize');

class TaskService {
  async createTask(taskData) {
    try {
      const task = await Task.create(taskData);
      return await this.getTaskById(task.id);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTaskById(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'username', 'displayName', 'slackId'] },
          { model: User, as: 'assignee', attributes: ['id', 'username', 'displayName', 'slackId'] },
          { 
            model: Comment, 
            include: [{ model: User, attributes: ['username', 'displayName'] }],
            order: [['createdAt', 'ASC']]
          }
        ]
      });
      return task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async getUserTasks(userId, statusFilter = null) {
    try {
      const whereClause = { assigneeId: userId };
      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          whereClause.status = { [Op.in]: statusFilter };
        } else {
          whereClause.status = statusFilter;
        }
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'creator', attributes: ['username', 'displayName', 'slackId'] },
          { model: User, as: 'assignee', attributes: ['username', 'displayName', 'slackId'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      return tasks;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId, status, userId, comment = null) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const updateData = { status };
      if (status === 'complete') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }

      await task.update(updateData);

      // Add status update comment
      if (comment) {
        await Comment.create({
          taskId: taskId,
          userId: userId,
          content: comment,
          commentType: 'status_update'
        });
      }

      return await this.getTaskById(taskId);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async addComment(taskId, userId, content) {
    try {
      const comment = await Comment.create({
        taskId: taskId,
        userId: userId,
        content: content,
        commentType: 'comment'
      });

      return await Comment.findByPk(comment.id, {
        include: [{ model: User, attributes: ['username', 'displayName'] }]
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getTaskStats(userId = null) {
    try {
      const whereClause = userId ? { assigneeId: userId } : {};
      
      const allTasks = await Task.findAll({
        where: whereClause,
        attributes: ['status']
      });

      const stats = allTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      return stats;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();

