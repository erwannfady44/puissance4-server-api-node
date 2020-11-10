'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idGAME: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      pseudo: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      score: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      victory: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      defeat: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      firstPlayer: {
        allowNull: true,
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
    await queryInterface.dropTable('Players');
  }
};