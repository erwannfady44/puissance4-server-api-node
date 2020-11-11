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

        var player = null;

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
                        player = playerFound;
                        models.Game.create({
                            state: 0,
                            PlayerId: idPlayerGame === 0 ? playerFound.id : null
                        }).then(function (newGame) {
                            done(null, newGame);
                        }).catch(function (err) {
                            res.status(500).json({'error' : err.message});
                        })
                    } else {
                        res.status(404).json({'error': 'player not found'});
                    }
                },

                function (newGame, done) {
                    if (newGame) {
                        if (newGame.PlayerId) {
                            player.update({
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
                    return res.status(500).json({'error' : 'cannot create game'});
            }
        );
    },

    waitingGames: function(res) {
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
                res.status(404).json({'error' : 'no game found'});
        }).catch(function (err) {
            res.status(500).json({'error' : err.message});
        })
    }
}