'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Player.hasMany(models.Game);
      models.Player.hasMany(models.Pawn);
    }
  };
  Player.init({
    idGAME: DataTypes.INTEGER,
    pseudo: DataTypes.STRING,
    password: DataTypes.STRING,
    score: DataTypes.INTEGER,
    victory: DataTypes.INTEGER,
    defeat: DataTypes.INTEGER,
    firstPlayer: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};