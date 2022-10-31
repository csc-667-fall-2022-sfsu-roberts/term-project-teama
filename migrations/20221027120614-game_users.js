'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'game_users',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        game_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        iscreator: {
          type: Sequelize.BOOLEAN,
          allowNull: false
        }
        // playerIndex: {
        //   type: Sequelize.STRING,
        //   allowNull: false
        // },
        // HasConceded: {
        //   type: Sequelize.BOOLEAN,
        //   default: false,
        //   allowNull: false
        // },
        // TurnsIdle: {
        //   type: Sequelize.INTEGER,
        //   default: 0
        // }
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('game_users');
  }
};