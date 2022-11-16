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
            turn_id: {
               type: Sequelize.INTEGER,
               allowNull: false,
               references: {
                 model: "turn",
                 key: "id"
               },
            },

            marble_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "marble",
                  key: "id"
                },
            },

            from_spot_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "spot",
                  key: "id"
                },
            },

            to_spot_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: "spot",
                  key: "id"
                },
            },

            movement_type: {
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