//imports
var jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = 'MEj7ZHatGtZNsu7jwU6rzw5g8vD3L66Vx8B994rAaYUh43yh86LGsN3MzytvL4Pd88ehDn5774VC98w7S9jEMHC834jZyg93KVF6';
//Exported functions
module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
                playerId: userData.id,
                pseudo: userData.pseudo
            },
            JWT_SIGN_SECRET,
            {
                expiresIn: '3h'
            })
    },

    parseAuthorization: function (authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },

    getUserId: function (authorization) {
        var playerId = -1;
        var token = module.exports.parseAuthorization(authorization);

        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);

                if (jwtToken != null) {
                    playerId = jwtToken.playerId;
                }
            } catch (e) {
                e.message
            }
        }
        return playerId;
    }
}