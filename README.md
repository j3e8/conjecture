# Setup
Run `git clone https://github.com/nuvi/nodebase.git`

`cd nodebase` (duh)

`npm install`

`cp .env.sample .env`

`npm run setup`

Open `.env` and uncomment the `PGDATABASE` and `PGDATABASE_TEST` values. Alter any other values that you need to.

`npm run migrate`

Run `npm run start` to start the server.

# Contributing
## Linting
This uses eslint. To run it call `npm run lint`

## Database
For consistency's sake the assumption is that Postgres will be used whenever a database is needed
and that most of our services will need one. For this reason, the `pg` package is included and
the `lib/database.js` file creates a connection pool during its first execution. The database
configuration is found in `./database.json`, however, it is set up to just point to the values in `.env`.

By default, Postgres on Mac OS X will support logging in with the current OS user's username and no password.
You can update the `.env` file to use your OS username and keep `PGPASSWORD=null` or you can create a username
and password for Postgres.

To set up the database initially (e.g. create the database), call `npm run setup`. You will need to make sure
your .env values for PGDATABASE and PGDATABASE_TEST are commented out so the creation of the databases can happen.
After this is run (one-time), uncomment those lines and forget all about this step.

To run database migrations, call `npm run migrate`. You'll want to make sure PGDATABASE and PGDATABASE_TEST are *not*
commented out for this to work (and everything else).

To create a migration, install db-migrate globally `npm install db-migrate -g` and then use `db-migrate create [name]`. This will create a file in the `migrations/` directory that
can be edited to create database schema alterations. See [https://db-migrate.readthedocs.io/en/latest/](https://db-migrate.readthedocs.io/en/latest/).

## API
We use express as our server. Routes are defined in the `./routes` directory and should be separated into files
based on the resource being accessed. We tap into express's default error handling such that whenever you throw
an error (or return a promise rejection), express will catch it and relay to the client. To enable proper HTTP
codes, you should always throw or reject an `HttpError` in the format `new HttpError(400, "Bad request")`. The
`HttpError` class is defined in `lib/httperror.js`. As part of the API's middleware, we automatically check for
a valid jwt in the Authorization header on every request. If that needs to be altered, you can edit the
`middleware/auth.js` file. When NODE_ENV is set to `test`, the jwt is not required.

## Directory Structure
The `api/` directory should contain functions that the routes directly call. This layer is responsible for
parameter checking and sanitization as well as any authorization that needs to take place (other than jwt validation).
This layer is responsible for throwing http errors or calling functions in the `modules` directory to execute
code. A file in this directory may require many modules from the `modules/` directory and chain together a list
of actions to perform.

The `modules/` directory contains resource-grouped files each with a single purpose. They are not responsible for any
API-related sanitization or authorization and should only validate their own input and perform their function. These
files should not usually chain any other actions together and it should be uncommon for them to require other modules.

The `lib/` directory contains helper files that can be included anywhere else in the project.

The `middleware/` directory is reserved for express-specific functions used by the API.

The `migrations/` directory is reserved for use with db-migrate.
