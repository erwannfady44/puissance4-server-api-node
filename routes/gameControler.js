//imports
var models = require('../models')
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');
//constants

//routes
module.exports = {
    createGame: function (req, res) {
        //getting auth header
        var headerAuth = req.headers['authorization'];
        var playerId = jwtUtils.getUserId(headerAuth);
        var idPlayerGame = Math.floor(Math.random()) % 2;


        asyncLib.waterfall([
                function (done) {
                    models.Player.findOne({
                        where: {id: playerId}
                    }).then(function (playerFound) {
                        done(null, playerFound);
                    }).catch(function (err) {
                        res.status(500).json({'error': err.message});
                    })
                },

                function (playerFound, done) {
                    if (playerFound) {
                        models.Game.create({
                            state: 0,
                            PlayerId: idPlayerGame === 0 ? playerFound.id : null
                        }).then(function (newGame) {
                            done(null, newGame, playerFound);
                        }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        })
                    } else {
                        res.status(404).json({'error': 'player not found'});
                    }
                },

                function (newGame, playerFound, done) {
                    if (newGame) {
                        if (newGame.PlayerId) {
                            playerFound.update({
                                idGAME: newGame.id
                            }).then(function () {
                                done(newGame);
                            }).catch(function (err) {
                                res.status(500).json({'error': err.message});
                            })
                        } else {
                            done(newGame);
                        }
                    } else {
                        return res.status(500).json({'error': 'cannot create game'});
                    }
                }],

            function (newGame) {
                if (newGame)
                    return res.status(201).json(newGame);
                else
                    return res.status(500).json({'error': 'cannot create game'});
            }
        );
    },

    joinGame: function (req, res) {
        const headerAuth = req.headers['authorization'];
        const playerId = jwtUtils.getUserId(headerAuth);

        const idGame = req.body.idGame;

        asyncLib.waterfall([
                function (done) {
                    models.Player.findOne({
                        where: {id: playerId}
                    }).then(function (playerFound) {
                        done(null, playerFound);
                    }).catch(function (err) {
                        res.status(500).json({'error': err.message});
                    })
                },

                function (playerFound, done) {
                    if (playerFound) {
                        if (!playerFound.idGAME) {
                            models.Game.findOne({
                                where: {id: idGame}
                            }).then(function (gameFound) {
                                done(null, playerFound, gameFound);
                            }).catch(function (err) {
                                res.status(404).json({'error': err.message});
                            })
                        } else
                            res.status(401).json({'error': 'you are already in game'});
                    } else
                        res.status(404).json({'error': 'cannot find player'});
                },

                function (playerFound, gameFound, done) {
                    if (gameFound, done) {
                        var values = {
                            PlayerId: gameFound.PlayerId === null ? gameFound.playerId : playerFound.id,
                            state: 1
                        };

                        var where = {
                            where: {
                                id: idGame
                            }
                        }
                        models.Game.update(values, where)
                            .then(function () {
                                done(null, playerFound, gameFound);
                            }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        })
                    } else
                        res.status(404).json({'error': 'cannot find the game'});
                },

                function (playerFound, gameFound, done) {
                    var values = {
                        idGAME: gameFound.id
                    };

                    var where = {
                        where: {id: playerFound.id}
                    };
                    models.Player.update(values, where)
                        .then(function () {
                        done(gameFound);
                    }).catch(function (err) {
                        res.status(500).json({'error': err.message});
                    })
                }
            ],

            function (gameFound) {
                if (gameFound)
                    return res.status(201).json(gameFound);
                else
                    return res.status(500).json({'error': 'cannot join the game'});
            }
        );
    },

    waitingGames: function (res) {
        models.Game.findAll({
            state: 0,
            include: [{
                model: models.Player,
                attributes: ['pseudo']
            }]
        }).then(function (games) {
            if (games) {
                res.status(200).json(games);
            } else
                res.status(404).json({'error': 'no game found'});
        }).catch(function (err) {
            res.status(500).json({'error': err.message});
        })
    }
}