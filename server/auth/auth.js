var jwt = require('jsonwebtoken');

// This module is to be used when we want to protect an API endpoint.
// If we choose to protect an endpoint, the only way to access it is to
// supply the valid JWT token that is passed from backend to frontend on successful log in.
// In short, only logged in user's on the frontend can access protected backend endpoints
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
