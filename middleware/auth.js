const jwt = require('jsonwebtoken');

module.exports = function auth (req, res, next) {
  const acceptHeader = req.headers.ServiceAuthToken;

  // If another service is communicating we can authorize by the Accept header
  if (process.env.APP_SECRET && process.env.APP_SECRET === acceptHeader) {
    return next();
  }

  // If the environment is test we don't want to require jwt. Otherwise all our tests would be dependent on some auth server
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const isSessionRequest = new RegExp(/^mutation(.|\n)*session/).test(req.body.query || '');
  if (isSessionRequest) {
    return next();
  }

  if (!req.headers.authorization) {
    return res.sendStatus(401);
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
      if (!err) {
        res.locals.userInfo = decoded.data;
        return next();
      }

      console.error('JWT is invalid: ', err, decoded);
      return res.sendStatus(401);
    });
  } catch (error) {
    console.error('JWT verify: ', error);
    return res.sendStatus(401);
  }
};
