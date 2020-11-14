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
      models.Player.hasMany(models.Pawns);
    }
  };
  Player.init({
    pseudo: DataTypes.STRING,
    password: DataTypes.STRING,
    score: DataTypes.INTEGER,
    victory: DataTypes.INTEGER,
    defeat: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};