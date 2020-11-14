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
                    })
                        .then(function (playerFound) {
                            done(null, playerFound)
                        }).catch(function (err) {
                        return res.status(500).json({'error': "err.message"})
                    })
                },

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
                }],

            function (newPlayer) {
                if (newPlayer) {
                    return res.status(201).json({
                        'playerId': newPlayer.id,
                        'token': jwtUtils.generateTokenForUser(newPlayer)
                    });
                } else {
                    return res.status(500).json({'error': err.message});
                }
            }
        );
    },

    login: function (req, res) {
        var pseudo = req.body.pseudo;
        var password = req.body.password;

        asyncLib.waterfall([
                function (done) {
                    models.Player.findOne({
                        where: {pseudo: pseudo}
                    })
                        .then(function (playerFound) {
                            done(null, playerFound);
                        }).catch(function (err) {
                        return res.status(404).json({'error': 'user doesn\'t existe'});
                    })
                },

                function (playerFound, done) {
                    if (playerFound) {
                        bcrypt.compare(password, playerFound.password, function (err, bcryptPassword) {
                            done(playerFound, bcryptPassword);
                        })
                    } else {
                        return res.status(409).json({'error': 'wrong password'});
                    }
                }],

            function (playerFound, bcryptPassword) {
                if (bcryptPassword) {
                    return res.status(200).json({
                        'playerId': playerFound.id,
                        'token': jwtUtils.generateTokenForUser(playerFound)
                    });
                }
            }
        );
    },

    getPlayerProfile: function (req, res) {
        //getting auth header
        var headerAuth = req.headers['authorization'];
        var playerId = jwtUtils.getUserId(headerAuth);

        if (playerId < 0)
            return res.status(400).json({'error': 'wrong token'});

        models.Player.findOne({
            attributes: ['id', 'pseudo', 'color', 'score', 'victory', 'defeat', 'idGAME'],
            where: {id: playerId}
        }).then(function (player) {
            if (player)
                return res.status(201).json(player);
            else
                res.status(204).json({'error': 'cannont fetch user'});
        }).catch(function (err) {
            res.status(500).json({'error': err.message});
        });
    },

    updateUserProfile: function (req, res) {
        //getting auth header
        var headerAuth = req.headers['authorization'];
        var playerId = jwtUtils.getUserId(headerAuth);
        var idGame = req.body.idGame;

        asyncLib.waterfall([
                function (done) {
                    models.Player.findOne({
                        attributes: ['id', 'pseudo', 'color', 'score', 'victory', 'defeat', 'idGAME', 'firstPlayer'],
                        where: {id: playerId}
                    }).then(function (playerFound) {
                        done(null, playerFound);
                    }).catch(function (err) {
                        return res.status(500).json({'error': err.message});
                    })
                },

                function (playerFound, done) {
                    if (playerFound, done) {
                        playerFound.update({
                            idGAME: (idGame)
                        }).then(function () {
                            done(playerFound);
                        }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        });
                    } else
                        return res.status(404).json({'error': 'player not found'});
                }],

            function (playerFound) {
                if (playerFound)
                    return res.status(201).json(playerFound);
                else
                    return res.status(500).json({'error': 'cannot update player profile'});
            }
        );
    },

    consult: function (req, res) {
        var idPlayer = req.query.idPlayer;

        if (!idPlayer)
            res.status(404).json({'error' : 'missing argument'});

        models.Player.findOne({
            attributes: ['idGAME', 'pseudo', 'score', 'victory', 'defeat'],
            where: {id: idPlayer}
        }).then(function (playerFound) {
            if (playerFound)
                return res.status(201).json(playerFound);
            else
                return res.status(404).json({'error': 'cannot find player'});
        }).catch(function (err) {
            res.status(500).json({'error': err.message});
        });
    }
}