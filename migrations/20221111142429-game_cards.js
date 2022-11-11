'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'game_cards',
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
            model: "games",
            key: "id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        },
        cardID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "cards",
            key: "id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
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
    return queryInterface.dropTable('game_cards');
  }
};