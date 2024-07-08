const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'staging', 'development', 'test').required(),
        PORT: Joi.number().default(4000),
        DB_HOST: Joi.string().required().description('Postgress DB host'),
        DB_USER: Joi.string().required().description('Postgress DB user'),
        DB_NAME: Joi.string().description('Postgress DB name'),
        // DB_PASSWORD: Joi.string().description('Postgress DB password'),
        DB_PORT: Joi.string().required().description('Postgress DB port'),
        JWT_SECRET: Joi.string().required().description('JWT secret'),
        JWT_ISSUER: Joi.string().required().description('JWT issuer'),
        JWT_ACCESS_EXPIRATION_DAYS: Joi.string().description('JWT exipiration in days'),
        JWT_ALGORITHM: Joi.string().required().description('JWT algorithim'),

    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mysql: {
        host: envVars.DB_HOST,
        user: envVars.DB_USER,
        name: envVars.DB_NAME,
        password: envVars.DB_PASSWORD,
        port: envVars.DB_PORT,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        issuer: envVars.JWT_ISSUER,
        expire_in_days: envVars.JWT_ACCESS_EXPIRATION_DAYS,
        algo: envVars.JWT_ALGORITHM,
    },

};
