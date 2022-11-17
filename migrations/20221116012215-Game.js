'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'games',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        state: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        winner: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: {
            model: "users",
            key: "id"
          },
        },
        creator: {
          type: Sequelize.INTEGER,
          defaultValue: null,
          references: {
            model: "users",
            key: "id"
          },
        },
        date_created: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()'),
        },
        date_ended: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('game');
  }
};