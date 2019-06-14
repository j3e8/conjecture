/** *
* This generic routes file simply requires all the different
* routes files (one for each domain/resource/area of concern)
** */

module.exports = (app) => {
  require('./language')(app);
  require('./mention')(app);
  require('./sentiment')(app);
  require('./spam')(app);
  require('./token')(app);
  require('./vulgarity')(app);
};
