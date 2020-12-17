const jwt = require('jsonwebtoken');
const constants = require('../constants');

module.exports = function (permission) {
  return function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && (authHeader.split(' ')[1] || authHeader)
    if (token == null) {
      return res.status(401).send('Unauthorized');
    }
    jwt.verify(token, constants.TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(401).send('Unauthorized');
      } else if (!permission || user.permissions.includes(permission) || (req.body.belongs_to == user._id)) {
        req.user = user;
        return next();
      } else {
        return res.status(401).send('Unauthorized');
      }
    });
  }
}
