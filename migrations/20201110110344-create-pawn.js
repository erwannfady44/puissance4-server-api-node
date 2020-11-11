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
      idGAME: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      idPLAYER: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model:'Players',
          key:'id'
        }
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