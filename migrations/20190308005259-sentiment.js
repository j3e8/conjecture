'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`CREATE TABLE sentiment (
    token varchar(100) not null primary key,
    occurrences int not null,
    score int not null
  )
  `);
};

exports.down = function(db) {
  return db.dropTable('sentiment');
};

exports._meta = {
  "version": 1
};
