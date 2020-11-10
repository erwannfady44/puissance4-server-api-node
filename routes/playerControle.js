//Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');

//Routes
module.exports = {
    register: function (req, res) {
        var pseudo = req.body.pseudo;
        var password = req.body.password;

        if (pseudo == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        models.Player.findOne({
            attributes: ['pseudo'],
            where: { pseudo: pseudo }
        })
            .then(function (userFound) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function (err, bcryptPassword) {
                        console.log("ok");
                        var newPlayer = models.Player.create({
                            pseudo: pseudo,
                            password: bcryptPassword,
                            defeat: 0,
                            victory: 0
                        })
                        .then(function (newUser) {
                            return res.status(201).json({
                                'playerId' : newUser.id
                            })
                       })
                        .catch(function (err) {
                            return res.status(500).json({
                                'erreur' : 'cannot add user'
                            })
                        });
                    })
                } else
                    return res.status(409).json({ 'error' : 'pseudo already exist'});
            })
            .catch(function (err) {
                return res.status(500).json({ 'error' : err.message});
            });
    },

    login: function (req, res) {
        var pseudo = req.body.pseudo;
        var password = req.body.password;

        models.Player.findOne({
            where: { pseudo: pseudo }
        }).then(function (userFound) {
            if (userFound) {

                bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                    if (resBycrypt) {
                        return res.status(200).json({
                            'playerId' : userFound.id,
                            'token' : jwtUtils.generateTokenForUser(userFound)
                        });
                    } else {
                        return res.status(403).json({ "error" : "invalid password" });
                    }

                })
            } else {
                return res.status(404).json({ 'error' : 'user doesn\'t existe' });
            }
        })
            .catch(function (err) {
                return res.status(500).json({ 'error' : err.message});
            })
    }
}