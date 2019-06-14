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
  return db.runSql(`CREATE TABLE language (
    token varchar(100) not null,
    language_code char(2) not null default 'en',
    occurrences int not null default 1,
    primary key (token, language_code)
  )
  `);
};

exports.down = function(db) {
  return db.dropTable('language');
};

exports._meta = {
  "version": 1
};
