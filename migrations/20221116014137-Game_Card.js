'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'game_card',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        game_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "game",
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
        location_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        index: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Game_Card');
  }
};