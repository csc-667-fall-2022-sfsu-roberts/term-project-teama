"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("Move", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            //TurnID: {
            //    type: Sequelize.INTEGER,
            //    references: { models: "turns", key: "id" },
            //    onDelete: "CASCADE",
            //    onUpdate: "CASCADE",
            //},

            //Marble: {
            //    type: Sequelize.INTEGER,
            //    references: { models: "Marble", key: "MarbleIndex" },
            //    onDelete: "CASCADE",
            //    onUpdate: "CASCADE",
            //},

            FromSpotID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: true,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            ToSpotID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: true,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            MovementType: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: true,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.dropTable("Move");
    }
};
