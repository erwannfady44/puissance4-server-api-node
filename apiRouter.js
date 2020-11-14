//Imports
var express = require('express');
var playerControler = require('./routes/playerControler');
var gameControler = require('./routes/gameControler');
var pawnControler = require('./routes/pawnControler');

//Router
exports.router = (function () {
    var apiRouter = express.Router();

    //player routes
    apiRouter.route('/players/register').post(playerControler.register);
    apiRouter.route('/players/login').post(playerControler.login);
    apiRouter.route('/players/me').get(playerControler.getPlayerProfile);
    apiRouter.route('/players/consult').get(playerControler.consult);
    apiRouter.route('/players/update').put(playerControler.updateUserProfile);

    //game routes
    apiRouter.route('/games/create').put(gameControler.createGame);
    apiRouter.route('/games/join').post(gameControler.joinGame);
    apiRouter.route('/games/waiting').get(gameControler.waitingGames);
    apiRouter.route('/games/consult').get(gameControler.consult);

    //pawn routes
    apiRouter.route('/pawn/play').post(pawnControler.play);

    return apiRouter;
})();