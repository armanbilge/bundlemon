import {
  createCommitRecordV2Controller,
  getCommitRecordsController,
  getCommitRecordWithBaseController,
} from '../../controllers/commitRecordsController';
import { createProjectController } from '../../controllers/projectsController';
import {
  CreateCommitRecordV2RequestSchema,
  GetCommitRecordsRequestSchema,
  GetCommitRecordRequestSchema,
  GithubOutputV2RequestSchema,
  GetSubprojectsRequestSchema,
} from '../../consts/schemas';

import type { FastifyPluginCallback } from 'fastify';
import { githubOutputV2Controller } from '../../controllers/githubController';
import { getSubprojectsController } from '../../controllers/subprojectsController';

const commitRecordRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/base', { schema: GetCommitRecordRequestSchema.properties }, getCommitRecordWithBaseController);

  done();
};

const commitRecordsRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/', { schema: GetCommitRecordsRequestSchema.properties }, getCommitRecordsController);

  app.register(commitRecordRoutes, { prefix: '/:commitRecordId' });

  done();
};

const outputsRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.post('/github', { schema: GithubOutputV2RequestSchema.properties }, githubOutputV2Controller);

  done();
};

const subprojectsRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/', { schema: GetSubprojectsRequestSchema.properties }, getSubprojectsController);

  done();
};

const projectRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(commitRecordsRoutes, { prefix: '/commit-records' });
  app.register(subprojectsRoutes, { prefix: '/subprojects' });

  done();
};

const projectsRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.post('/', createProjectController);

  app.register(projectRoutes, { prefix: '/:projectId' });

  done();
};

const providersRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.post('/', createProjectController);

  app.register(projectRoutes, { prefix: '/:provider/:owner/:repo' });

  done();
};

const v2Routes: FastifyPluginCallback = (app, _opts, done) => {
  app.register(projectsRoutes, { prefix: '/projects' });
  app.register(providersRoutes, { prefix: '/providers' });

  app.register(outputsRoutes, { prefix: '/outputs' });

  app.post('/commit-records', { schema: CreateCommitRecordV2RequestSchema.properties }, createCommitRecordV2Controller);

  done();
};

export default v2Routes;
