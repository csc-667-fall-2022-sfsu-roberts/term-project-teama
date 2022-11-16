"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("marble", {
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
            current_spot: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "spot",
                  key: "id"
                },
            },
            marble_index: {
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
