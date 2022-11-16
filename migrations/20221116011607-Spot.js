'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable("spot", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        area: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        player_index: {
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
