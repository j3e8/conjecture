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
  return db.runSql(`ALTER TABLE sentiment
    DROP COLUMN score,
    ADD COLUMN positivity int not null,
    ADD COLUMN negativity int not null
  `);
};

exports.down = function(db) {
  console.log("There's no going back. Back up another migration if you really care to");
  return Promise.resolve();
};

exports._meta = {
  "version": 1
};
