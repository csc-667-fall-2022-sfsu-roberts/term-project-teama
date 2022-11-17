'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'turns',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        game_player_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "game_players",
            key: "id"
          },
        },
        card_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "cards",
            key: "id"
          },
        },
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('turn');
  }
};
