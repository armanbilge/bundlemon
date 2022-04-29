/* istanbul ignore file */

import type {
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteHandlerMethod,
} from 'fastify';

export interface BaseRequestSchema {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  headers?: unknown;
}

export interface BaseGetRequestSchema {
  query?: unknown;
  params?: unknown;
  headers?: unknown;
}

export type FastifyValidatedRoute<RouteGeneric extends BaseRequestSchema> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Body: RouteGeneric['body'];
    Querystring: RouteGeneric['query'];
    Params: RouteGeneric['params'];
    Headers: RouteGeneric['headers'];
  }
>;

export interface ProjectAuthV1Headers {
  'bundlemon-auth-type'?: 'API_KEY';
  /**
   * @minLength 1
   */
  'x-api-key': string;
}

export interface ProjectAuthV2Headers {
  'bundlemon-auth-type': 'API_KEY';
  /**
   * @minLength 1
   */
  'bundlemon-project-id': string;
  /**
   * @minLength 1
   */
  'x-api-key': string;
}

export interface GithubActionsAuthHeaders {
  'bundlemon-auth-type': 'GITHUB_ACTION';
  /**
   * @minLength 1
   */
  'github-owner': string;
  /**
   * @minLength 1
   */
  'github-repo': string;
  /**
   * @minLength 1
   * @pattern ^\d+$
   */
  'github-run-id': string;
}

export type AuthHeadersV1 = { [key: string]: any } & (ProjectAuthV1Headers | GithubActionsAuthHeaders);
export type AuthHeadersV2 = { [key: string]: any } & (ProjectAuthV2Headers | GithubActionsAuthHeaders);
