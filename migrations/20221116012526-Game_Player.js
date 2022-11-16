'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'Game_Player',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        playerID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "User",
            key: "id"
          },
        },
        gameID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Game",
            key: "id"
          },
        },
        playerIndex: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        hasConceded: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        turnsIdle: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Game_Player');
  }
};