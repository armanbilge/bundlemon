/* istanbul ignore file */

import type { GithubOutputTypes, Report } from 'bundlemon-utils';
import type { ProjectOwnerDetails } from 'bundlemon-utils/lib/esm/v2/types';
import type { AuthHeadersV1, AuthHeadersV2, BaseRequestSchema } from './common';

interface ProjectApiKeyHeaders {
  /**
   * @minLength 1
   */
  'x-api-key': string;
}

interface CreateGithubCheckBody {
  report: Report;
  git: {
    owner: string;
    repo: string;
    commitSha: string;
  };
}

export interface CreateGithubCheckRequestSchema extends BaseRequestSchema {
  body: CreateGithubCheckBody;
  params: ProjectOwnerDetails;
  headers: ProjectApiKeyHeaders;
}

interface CreateGithubCommitStatusBody {
  report: Report;
  git: {
    owner: string;
    repo: string;
    commitSha: string;
  };
}

export interface CreateGithubCommitStatusRequestSchema extends BaseRequestSchema {
  body: CreateGithubCommitStatusBody;
  params: ProjectOwnerDetails;
  headers: ProjectApiKeyHeaders;
}

interface CreateGithubPrCommentBody {
  report: Report;
  git: {
    owner: string;
    repo: string;
    prNumber: string;
  };
}

export interface PostGithubPRCommentRequestSchema extends BaseRequestSchema {
  body: CreateGithubPrCommentBody;
  params: ProjectOwnerDetails;
  headers: ProjectApiKeyHeaders;
}

interface GithubOutputBody {
  report: Report;
  git: {
    owner: string;
    repo: string;
    commitSha: string;
    prNumber?: string;
  };
  output: Partial<Record<GithubOutputTypes, boolean>>;
}

export interface GithubOutputV1RequestSchema extends BaseRequestSchema {
  body: GithubOutputBody;
  params: ProjectOwnerDetails;
  headers: AuthHeadersV1;
}

export interface GithubOutputV2RequestSchema extends BaseRequestSchema {
  body: GithubOutputBody;
  headers: AuthHeadersV2;
}
