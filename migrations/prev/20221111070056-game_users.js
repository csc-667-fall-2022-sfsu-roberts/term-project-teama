'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'game_users',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        game_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        iscreator: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        playerindex: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        hasconceded: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        turnsidle: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        isstarted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        iswinner: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('game_users');
  }
};