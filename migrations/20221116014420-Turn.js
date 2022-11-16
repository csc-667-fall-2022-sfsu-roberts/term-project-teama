'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'turn',
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
            model: "game_player",
            key: "id"
          },
        },
        card_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "card",
            key: "id"
          },
        },
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Turn');
  }
};
