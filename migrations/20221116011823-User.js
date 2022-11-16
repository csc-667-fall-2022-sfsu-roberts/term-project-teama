'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'user',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        avatar: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        state: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        date_added: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        last_online: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
      }
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('User');
  }
};