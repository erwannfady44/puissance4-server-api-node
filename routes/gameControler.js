//imports
var models = require('../models')
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');
var sequelize = require("sequelize");

//constants
const Op = sequelize.Op.ne;
//routes
module.exports = {
    createGame: function (req, res) {
        //getting auth header
        var headerAuth = req.headers['authorization'];
        var playerId = jwtUtils.getUserId(headerAuth);
        var turn = Math.floor(Math.random() * 10) % 2;


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
                            idPLAYER1 : playerFound.id,
                            turn: turn
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

                        var values = {
                            score: 0
                        };

                        var where = {
                            where: {id: playerFound.id}
                        };
                        playerFound.update(values, where)
                            .then(function () {
                                done(newGame);
                            }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        })

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
                            models.Game.findOne({
                                attributes: ['state', 'turn'],
                                where: {id: idGame}
                            }).then(function (gameFound) {
                                done(null, playerFound, gameFound);
                            }).catch(function (err) {
                                res.status(500).json({'error': err.message});
                            })
                    } else
                        res.status(404).json({'error': 'cannot find player'});
                },

                function (playerFound, gameFound, done) {
                    if (gameFound) {
                        if (gameFound.state === 0) {
                            var values = {
                                idPLAYER2: playerFound.id,
                                state: 1,
                            };

                            var where = {
                                where: {
                                    id: idGame
                                }
                            };
                            models.Game.update(values, where)
                                .then(function () {
                                    done(null, playerFound, gameFound);
                                }).catch(function (err) {
                                res.status(500).json({'error': err.message});
                            })
                        } else
                            res.status(404).json({'error': 'the game is full'});
                    } else
                        res.status(405).json({'error': 'cannot find this game'});
                },

                function (playerFound, gameFound, done) {
                    var values = {
                        score: 0
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
    },

    consult: function (req, res) {
        const headerAuth = req.headers['authorization'];
        const playerId = jwtUtils.getUserId(headerAuth);

        asyncLib.waterfall([
                function (done) {
                    models.Player.findOne({
                        attributes: ['idGAME'],
                        where:{id: playerId}
                    }).then(function (playerFound) {
                        done(null, playerFound)
                    }) 
                },

                function (playerFound, done) {
                    if (playerFound) {
                        models.Game.findOne({
                            attributes: ['id', 'idPLAYER'],
                            where: {id: playerFound.idGAME}
                        }).then(function (gameFound) {
                            done(null, gameFound);
                        }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        })
                    } else 
                        res.status(404).json({'error' : 'cannot find player'})
                },

                function (gameFound, done) {
                    if (gameFound) {
                        models.Player.findOne({
                            attributes: ['pseudo', 'score', 'victory', 'defeat'],
                            where: {
                                idGAME: idGame,
                                id: {[Op]: playerId}
                            }
                        }).then(function (opponentFound) {
                            done(null, gameFound, opponentFound);
                        }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        })
                    } else
                        res.status(404).json({'error': 'cannot find game'});
                },

                function (gameFound, opponentFound, done) {
                    if (opponentFound) {
                        models.Pawn.findAll({
                            attributes: ['id', 'colomn', 'height', 'idPlayer'],
                            where: {idGAME: idGame}
                        }).then(function (pawnFound) {
                            done(gameFound, opponentFound, pawnFound);
                        }).catch(function (err) {
                            res.status(500).json({'error': err.message});
                        })
                    } else
                        res.status(404).json({'error': 'cannot find player'});
                }],
            function (gameFound, playerFound, pawnFoud) {
                res.status(200).json({'game': gameFound, 'opponent': playerFound, 'pawns': pawnFoud});
            });
    }
}