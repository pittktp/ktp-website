var jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    /*
     * Check if authorization header is set
     */
    if(req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')) {
        const token = req.headers['authorization'].replace('Bearer ', '');
        jwt.verify(token, 'ktp-secret', function(err, decoded) {
          if(err) {
            return res.status(401);
          }
          else { // JWT is verified
            return
          }
        });
    } else {
        return res.status(401).json({
            error: {
                msg: 'No token!'
            }
        });
    }
    next();
    return;
}
