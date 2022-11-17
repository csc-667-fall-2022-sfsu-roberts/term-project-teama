'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'game_players',
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
            model: "users",
            key: "id"
          },
        },
        game_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "games",
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
    return queryInterface.dropTable('game_player');
  }
};