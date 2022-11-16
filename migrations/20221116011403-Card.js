'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
      return queryInterface.createTable(
        'Card',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          suite: {
            type: Sequelize.STRING,
            allowNull: false
          },
          value: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          }
        });
    },
  
    async down(queryInterface, Sequelize) {
      return queryInterface.dropTable('Card');
    }
};
