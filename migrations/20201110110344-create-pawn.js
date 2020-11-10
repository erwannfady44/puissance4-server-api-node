'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Pawns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idGame: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      idPlayer: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      colomn: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      height: {
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
    await queryInterface.dropTable('Pawns');
  }
};