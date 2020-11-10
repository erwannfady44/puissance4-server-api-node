'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pawn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pawn.belongsTo(models.Player, {
        foreignKey: {
          allowNull:false
        }
      })
    }
  };
  Pawn.init({
    idGame: DataTypes.INTEGER,
    idPlayer: DataTypes.INTEGER,
    colomn: DataTypes.INTEGER,
    height: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pawn',
  });
  return Pawn;
};