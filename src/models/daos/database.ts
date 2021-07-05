import PgPromise from "pg-promise";
import { env } from "../../util/env";

const initOptions = {};
const pgp = PgPromise(initOptions);

const connectionInfo = {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD
};
const databaseConnection = pgp(connectionInfo);

export default databaseConnection;
