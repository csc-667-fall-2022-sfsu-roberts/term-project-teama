"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("move", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            turnID: {
               type: Sequelize.INTEGER,
               allowNull: false,
               references: {
                 model: "Turn",
                 key: "id"
               },
            },

            marbleID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "Marble",
                  key: "id"
                },
            },

            fromSpotID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "Spot",
                  key: "id"
                },
            },

            toSpotID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "Spot",
                  key: "id"
                },
            },

            movementType: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.dropTable("Move");
    }
};