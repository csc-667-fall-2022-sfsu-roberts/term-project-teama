'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'Turn',
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
            model: "Game_Player",
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
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Turn');
  }
};
