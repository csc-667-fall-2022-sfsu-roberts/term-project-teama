'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'Game_Card',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        gameID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Game",
            key: "id"
          },
        },
        cardID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Card",
            key: "id"
          },
        },
        locationID: {
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