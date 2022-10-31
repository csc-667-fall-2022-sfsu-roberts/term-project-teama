("use strict");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable("Spot", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
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
            Area: {
                type: Sequelize.Integer,
                allowNull: true,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            Index: {
                type: Sequelize.Integer,
                allowNull: true,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.dropTable("Spot");
    },
};
