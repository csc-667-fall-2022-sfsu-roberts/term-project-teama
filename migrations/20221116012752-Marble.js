"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("Marble", {
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
            currentSpot: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "Spot",
                  key: "id"
                },
            },
            marbleIndex: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.dropTable("Marble");
    }
};
