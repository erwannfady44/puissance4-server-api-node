//Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');


//Routes
module.exports = {
    register: function (req, res) {
        var pseudo = req.body.pseudo;
        var password = req.body.password;

        if (pseudo == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        asyncLib.waterfall([
            function (done) {
                models.Player.findOne({
                    attributes: ['pseudo'],
                    where: {pseudo: pseudo}
                });
            }.then(function (playerFound) {
                done(null, playerFound)
            }).catch(function (err) {
                return res.status(500).json({'error': err.message})
            }),

            function (playerFound, done) {
                if (!playerFound) {
                    bcrypt.hash(password, 5, function (err, bcryptPassword) {
                        done(null, playerFound, bcryptPassword)
                    });
                } else {
                    return res.status(409).json({'error': 'player already existe'});
                }
            },

            function (playerFound, bcryptPassword, done) {
                var newPlayer = models.Player.create({
                    pseudo: pseudo,
                    password: bcryptPassword,
                    defeat: 0,
                    victory: 0
                })
                    .then(function (newPlayer) {
                        done(newPlayer);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': err.message});
                    })
            },

            function (newPlayer) {
                if (newPlayer) {
                    return res.status(201).json({
                        'playerId': newPlayer.id
                    });
                } else {
                    return res.status(500).json({'error': err.message});
                }
            }
        ]);
    },

    login: function (req, res) {
        var pseudo = req.body.pseudo;
        var password = req.body.password;

        asyncLib.waterfall([
            function (done) {
                models.Player.findOne({
                    where: {pseudo: pseudo}
                });
            }.then(function (playerFound) {
                done(null, playerFound);
            }).catch(function (err) {
                return res.status(404).json({'error': 'user doesn\'t existe'});
            }),

            function (playerFound, done) {
                if (playerFound) {
                    bcrypt.compare(password, playerFound.password, function (err, bcryptPassword) {
                        done(null, playerFound, bcryptPassword);
                    })
                } else {
                    return res.status(409).json({'error': 'player already existe'});
                }
            },

            function (playerFound, bcryptPassword, done) {
                if (bcryptPassword) {
                    return res.status(200).json({
                        'playerId': playerFound.id,
                        'token': jwtUtils.generateTokenForUser(playerFound)
                    });
                }
            }
        ]);
    }
}