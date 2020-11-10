//imports
var jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = 'MEj7ZHatGtZNsu7jwU6rzw5g8vD3L66Vx8B994rAaYUh43yh86LGsN3MzytvL4Pd88ehDn5774VC98w7S9jEMHC834jZyg93KVF6';
//Exported functions
module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
                userId: userData.id,
                pseudo: userData.pseudo
            },
            JWT_SIGN_SECRET,
            {
                expiresIn: '3h'
            })
    }
}