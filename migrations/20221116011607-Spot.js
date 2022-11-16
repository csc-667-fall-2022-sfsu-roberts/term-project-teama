'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable("Spot", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        area: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        playerIndex: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        index: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable("Spot");
  }
};
