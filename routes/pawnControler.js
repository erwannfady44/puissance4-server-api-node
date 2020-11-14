//imports
var models = require('../models')
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');
var sequelize = require("sequelize");

//constants
const or = sequelize.Op.or;
const lte = sequelize.Op.lte;

module.exports = {
    play: function (req, res) {
        let headerAuth = req.headers['authorization'];
        let playerId = jwtUtils.getUserId(headerAuth);

        const column = req.body.column;
        let height;

        if (column && column <= 7 && column >= 1) {
            asyncLib.waterfall([
                    function (done) {
                        models.Player.findOne({
                            attributes: ['id', 'pseudo', 'score', 'victory', 'defeat'],
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
                                attributes: ['id', 'idPLAYER1', 'idPLAYER2', 'turn', 'state'],
                                where: {
                                    [or]: [
                                        {idPLAYER1: playerFound.id},
                                        {idPLAYER2: playerFound.id}
                                    ]
                                }
                            }).then(function (gameFound) {
                                done(null, playerFound, gameFound);
                            }).catch(function (err) {
                                res.status(500).json({'error': err.message});
                            })
                        } else
                            res.status(404).json({'errror': 'cannot find player'});
                    },

                    function (playerFound, gameFound, done) {
                        if (gameFound) {
                            models.Pawns.count({
                                distinct: true,
                                where: {
                                    idGAME: gameFound.id,
                                    column: column
                                }
                            }).then(function (count) {
                                done(null, playerFound, gameFound, count);
                            }).catch(function (err) {
                                res.status(500).json({'error': err.message});
                            })
                        } else
                            res.status(404).json({'error': 'cannot find game'});
                    },

                    function (playerFound, gameFound, height, done) {
                        //Si c'est a notre tour de jouer
                        //if ((gameFound.turn === 0 && gameFound.idPLAYER1 === playerId) || (gameFound.turn === 1 && gameFound.idPLAYER2 === playerId)) {
                        //TODO
                        if (height <= 1000) {
                            models.Pawns.create({
                                idGAME: gameFound.id,
                                idPLAYER: playerFound.id,
                                column: column,
                                height: height
                            }).then(function (newPawns) {
                                done(null, playerFound, gameFound, newPawns);
                            }).catch(function (err) {
                                res.status(500).json({'error': err.message});
                            })
                        } else
                            return res.status(409).json({'error': 'column full'});
                        /*} else
                            res.status(409).json({'error': 'not your turn'});*/
                    },

                    function (playerFound, gameFound, newPawns, done) {
                        models.Pawns.count({
                            distinct: true,
                            where: {
                                idGAME: gameFound.id
                            }
                        }).then(function (number) {

                            if (number < 42)
                                done(null, playerFound, gameFound, newPawns, false);
                            else
                                done(null, playerFound, gameFound, newPawns, true);
                        })

                    },

                    function (playerFound, gameFound, newPawn, equality, done) {
                        //TODO
                        if (equality) {
                            asyncLib.waterfall([
                                function (done) {
                                    models.Player.findOne({
                                        attributes: ['id', 'victory', 'defeat'],
                                        where: {
                                            id: gameFound.idPLAYER1
                                        }
                                    }).then(function (player1) {
                                        done(null, player1);
                                    }).catch(function (err) {
                                        res.status(500).json({'error': err.message});
                                    })
                                },

                                function (done, player1) {
                                    models.Player.findOne({
                                        attributes: ['id', 'victory', 'defeat'],
                                        where: {
                                            id: gameFound.idPLAYER2
                                        }
                                    }).then(function (player2) {
                                        done(null, player1, player2);
                                    }).catch(function (err) {
                                        res.status(500).json({'error': err.message});
                                    })
                                },

                                function (done, player1, player2) {
                                    models.Player.update({
                                        score: 0
                                    }, {
                                        [or]: [
                                            {authorId: player1.id},
                                            {authorId: player2.id}
                                        ]
                                    }).then(function () {
                                        //TODO
                                        done();
                                    })
                                        .catch(function (err) {
                                            res.status(500).json({'error': err.message});
                                        });
                                },
                            ]);
                        } else {
                            asyncLib.waterfall([
                                //vertical check
                                function (done) {
                                    if (newPawn.height >= 4) {
                                        models.Pawns.findAll({
                                            attributes: ['id', 'column', 'height', 'idPLAYER', 'idGAME'],
                                            where: {
                                                column: newPawn.column,
                                                idGAME: gameFound.id,
                                                //[lte] : [height, (newPawns.height - 4)],
                                            }
                                        }).then(function (thePawns) {
                                            var nb = 0;
                                            thePawns.forEach(function (pawn) {
                                                if (pawn.idPLAYER === playerFound.id)
                                                    nb += 1;
                                                else
                                                    nb = 0;
                                            });

                                            if (nb >= 4) {
                                                victory();
                                                //done(null, true);
                                                //TODO
                                                done(null, false);
                                            } else {
                                                done(null, false);
                                            }
                                        }).catch(function (err) {
                                            console.log(err.message);
                                        });
                                    } else
                                        done(null, false);

                                },

                                //horizontal check
                                function (vertical, done) {
                                    if (!vertical) {
                                        models.Pawns.findAll({
                                            attributes: ['id', 'column', 'height', 'idPLAYER', 'idGAME'],
                                            where: {
                                                height: newPawn.height,
                                                idGAME: gameFound.id,
                                            }
                                        }).then(function (thePawns) {
                                            var nb = 0;
                                            thePawns.forEach(function (pawn) {
                                                if (pawn.idPLAYER === playerId)
                                                    nb += 1;
                                                else
                                                    nb = 0;
                                            });

                                            if (nb >= 4) {
                                                victory();
                                                //done(null, vertical, true);

                                                //TODO
                                                done(null, vertical, false);
                                            } else {
                                                done(null, vertical, false);
                                            }
                                        });
                                    }
                                },

                                //left diagonal
                                function (vertical, horizontal) {
                                    if (!vertical && !horizontal) {
                                        let maxColumn = parseInt(newPawn.column), maxHeight = newPawn.height;
                                        let i = 0;
                                        while (maxColumn > 1 && maxHeight < 5 && i < 3) {
                                            maxHeight += 1;
                                            maxColumn -= 1;
                                        }

                                        models.Pawns.findAll({
                                            attributes: ['idGAME'],
                                            where: {
                                                idGAME : gameFound.id,
                                            }
                                        }).then(function (thePawns) {
                                            
                                        })
                                    }
                                }
                            ]);


                        }

                    }

                ],

                function (gameFound) {
                    if (gameFound) {
                        return res.status(200).json({gameFound});
                    } else
                        return res.status(500).json({'error': 'problem'});
                }
            )
            ;
        } else
            res.status(404).json({'error': 'wrong column'});
    }

}

function victory(idGAME, idPLAYER, height, column, res) {
    return false;
}