'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'games',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        state: {
          type: Sequelize.STRING,
          defaultValue: 0
        },
        datecreated: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()'),
        },
        dateended: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('games');
  }
};