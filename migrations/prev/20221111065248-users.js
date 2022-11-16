'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        createdat: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        avatar: {
          type: Sequelize.STRING,
          defaultValue: 1,
          allowNull: false
        },
      }
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};