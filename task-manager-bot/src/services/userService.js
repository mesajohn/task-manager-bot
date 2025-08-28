const { User } = require('../models');

class UserService {
  async findOrCreateUser(slackId, userInfo = {}) {
    try {
      let user = await User.findOne({ where: { slackId } });
      
      if (!user) {
        user = await User.create({
          slackId: slackId,
          username: userInfo.name || `user_${slackId}`,
          email: userInfo.email || null,
          displayName: userInfo.display_name || userInfo.real_name || null,
          timezone: userInfo.tz || 'UTC'
        });
        console.log(`Created new user: ${user.username} (${slackId})`);
      }
      
      return user;
    } catch (error) {
      console.error('Error finding or creating user:', error);
      throw error;
    }
  }

  async getUserBySlackId(slackId) {
    try {
      return await User.findOne({ where: { slackId } });
    } catch (error) {
      console.error('Error fetching user by Slack ID:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await User.findAll({
        where: { isActive: true },
        attributes: ['id', 'slackId', 'username', 'displayName', 'role'],
        order: [['username', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}

module.exports = new UserService();

