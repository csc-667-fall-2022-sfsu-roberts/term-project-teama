'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'game_player',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        player_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "user",
            key: "id"
          },
        },
        game_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "game",
            key: "id"
          },
        },
        player_index: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        has_conceded: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        turns_idle: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Game_Player');
  }
};