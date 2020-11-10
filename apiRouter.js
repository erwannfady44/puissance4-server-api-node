//Imports
var express = require('express');
var playerControler = require('./routes/playerControle');

//Router
exports.router = (function () {
    var apiRouter = express.Router();

    apiRouter.route('/player/register').post(playerControler.register);
    apiRouter.route('/player/login').post(playerControler.login);

    return apiRouter;
})();