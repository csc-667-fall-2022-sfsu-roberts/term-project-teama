"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("marbles", {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            game_player_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "game_players",
                  key: "id"
                },
            },
            current_spot: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "spots",
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
        return queryInterface.dropTable("marble");
    }
};
