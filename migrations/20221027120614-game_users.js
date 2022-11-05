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
        },
        playerindex: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        // HasConceded: {
        //   type: Sequelize.BOOLEAN,
        //   default: false,
        //   allowNull: false
        // },
        // TurnsIdle: {
        //   type: Sequelize.INTEGER,
        //   default: 0
        // },
        isstarted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        }
      });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('game_users');
  }
};