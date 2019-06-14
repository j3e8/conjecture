require('dotenv').load();

const port = process.env.PORT;
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const auth = require('./middleware/auth');
const cors = require('./middleware/cors');
const routes = require('./routes');

const HttpError = require('./lib/httperror');

const app = express();
app.locals.title = process.env.APP_NAME;

app
  .disable('x-powered-by')
  .use(morgan('short')) // for logging a single line for each request received
  .use(compression()) // for http compression
  .use(bodyParser.json()) // for parsing application/json
  .use(cors) // enable cors
  .use(auth); // require jwt authorization

const server = app.listen(port, () => {
  console.info(`${process.env.APP_NAME} has been started on port ${port}`);
});

// initialize all the routes for the app
routes(app);

// custom error handler must be the last thing in the project
app.use((err, req, res, next) => {
  if (typeof res)
  if (err instanceof HttpError) {
    res.status(err.code || 500);
  } else if (err instanceof Error) {
    res.status(500);
  }

  if (err.code >= 500) {
    console.error(err);
  }

  if (res.json) {
    res.json({
      message: err.message,
    });
  } else {
    next();
  }
});

module.exports = server;
