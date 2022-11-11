"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("Marble", {
            gamePlayerID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "game_users",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            CurrentSpot: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            MarbleIndex: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.dropTable("Marble");
    }
};
