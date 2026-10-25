const { User } = require('../models/User.ts');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({
      where: { email: String(email).trim() },
    });
  }

  async findBySessionToken(sessionToken) {
    return User.findOne({
      where: { sessionToken },
    });
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async create(userData) {
    return User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'user',
    });
  }

  async findByResetToken(token) {
    return User.findOne({
      where: { resetToken: token },
    });
  }

  async updateUser(id, updates) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(updates);
    return user;
  }
}

module.exports = new UserRepository();
