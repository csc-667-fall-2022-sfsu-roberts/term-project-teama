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
        gamePlayerID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "game_users",
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
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('turns');
  }
};
