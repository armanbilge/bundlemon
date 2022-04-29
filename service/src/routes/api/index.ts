import v1Routes from './v1';
import v2Routes from './v2';

import type { FastifyPluginCallback } from 'fastify';

const apiRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(v1Routes, { prefix: '/v1' });
  app.register(v2Routes, { prefix: '/v2' });

  done();
};

export default apiRoutes;
