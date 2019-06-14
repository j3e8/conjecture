require('dotenv').load();
const { exec } = require('child_process');

if (!process.argv[2]) {
  throw new Error("Must specify a database name as a final argument");
}

const dbname = process.argv[2];
const NODE_ENV = process.env.NODE_ENV;

/* eslint-disable max-len */
exec(`./node_modules/db-migrate/bin/db-migrate db:create ${dbname}_${NODE_ENV} && ./node_modules/db-migrate/bin/db-migrate db:create ${dbname}_test`, (err, stdout, stderr) => {
  if (err || stderr) {
    logWarning();
    process.exit(1);
  } else {
    console.log(stdout);
    if (stdout && stdout.toLowerCase().indexOf('error') > -1) {
      logWarning();
    }
    process.exit(0);
  }
});

function logWarning () {
  console.warn("\x1b[34mDon't forget to comment out the PGDATABASE and PGDATABASE_TEST variables in your .env file before running setup (since they don't exist yet). Then uncomment them to run migrations and start your server.\n\x1b[0m");
}
