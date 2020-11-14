'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPLAYER1: {
        allowNull : true,
        type: Sequelize.INTEGER
      },
      idPLAYER2: {
        allowNull : true,
        type: Sequelize.INTEGER
      },
      turn: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      state: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Games');
  }
};