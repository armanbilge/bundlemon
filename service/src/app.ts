import fs from 'fs';
import path from 'path';
import fastify from 'fastify';
import cors, { FastifyCorsOptions } from '@fastify/cors';
import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import secureSession, { SecureSessionPluginOptions } from '@fastify/secure-session';
import routes from '@/routes';
import * as schemas from '@/consts/schemas';
import { closeMongoClient } from '@/framework/mongo/client';
import { nodeEnv, secretSessionKey, rootDomain, isTestEnv } from '@/framework/env';
import { DEFAULT_SESSION_AGE_SECONDS } from '@/consts/auth';
import { RequestError as OctokitRequestError } from '@octokit/request-error';

import type { ServerOptions } from 'https';

function init() {
  let https: ServerOptions | null = null;

  if (nodeEnv === 'development') {
    https = {
      key: fs.readFileSync(path.join(__dirname, '../local-certs/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../local-certs/cert.pem')),
    };
  }

  const app = fastify({
    https,
    logger: {
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            hostname: req.hostname,
            remoteAddress: req.ip,
            clientName: req?.headers?.['x-api-client-name'] || 'unknown',
            clientVersion: req?.headers?.['x-api-client-version'] || 'unknown',
          };
        },
      },
    },
  });

  Object.values(schemas)
    .filter((schema) => !schema.$id.endsWith('RequestSchema'))
    .forEach((schema) => {
      app.addSchema(schema);
    });

  app.register(cors, {
    credentials: true,
    origin: true,
  } as FastifyCorsOptions);

  const cookieParseOptions: FastifyCookieOptions['parseOptions'] = {
    path: '/',
    domain: rootDomain,
    httpOnly: true,
    secure: true,
    sameSite: isTestEnv ? 'none' : 'strict',
    maxAge: DEFAULT_SESSION_AGE_SECONDS,
  };

  app.register(cookie, {
    parseOptions: cookieParseOptions,
  } as FastifyCookieOptions);

  app.register(secureSession, {
    cookieName: 'session',
    key: Buffer.from(secretSessionKey, 'hex'),
    cookie: cookieParseOptions,
  } as SecureSessionPluginOptions);
  app.register(routes);

  app.setErrorHandler((error, req, res) => {
    // check if we have a validation error
    if (error.validation) {
      return res.status(400).send({
        // @ts-ignore
        message: `A validation error occurred when validating the ${error.validationContext}`,
        errors: error.validation,
      });
    } else if (error instanceof OctokitRequestError) {
      req.log.warn(error);
      return res.status(400).send({
        message: `GitHub error: ${error.message}`,
      });
    }

    req.log.error(error);

    return res.status(500).send('unknown error');
  });

  app.addHook('onClose', () => closeMongoClient());

  return app;
}

// If called directly i.e. "node app"
if (require.main === module) {
  const app = init();

  // TODO: serve static files?

  app.listen({ port: 3333, host: '0.0.0.0' }, (err) => {
    if (err) {
      app.log.fatal(err);
      process.exit(1);
    }
  });
}

// Required as a module => executed on aws lambda
export default init;
