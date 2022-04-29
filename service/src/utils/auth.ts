import { Octokit } from '@octokit/rest';
import { GitProvider } from 'bundlemon-utils';
import { getProjectApiKeyHash } from '../framework/mongo';
import { verifyHash } from './hashUtils';
import { getInstallationId, createInstallationOctokit } from '../framework/github';

import type { FastifyLoggerInstance } from 'fastify';
import type { AuthHeadersV2, ProjectAuthV2Headers, GithubActionsAuthHeaders, AuthHeadersV1 } from '../types/schemas';
import type { OwnerDetails } from 'bundlemon-utils/lib/esm/v2/types';

type CheckAuthHeadersResponse =
  | {
      authenticated: false;
      error: string;
      extraData?: Record<string, any>;
    }
  | { authenticated: true; installationOctokit?: Octokit; ownerDetails: OwnerDetails };

export async function checkAuthHeaders(
  headers: AuthHeadersV2,
  log: FastifyLoggerInstance
): Promise<CheckAuthHeadersResponse> {
  const { 'bundlemon-auth-type': authType } = headers;

  switch (authType) {
    case 'API_KEY': {
      return handleProjectAuth(headers, log);
    }
    case 'GITHUB_ACTION': {
      return handleGithubActionAuth(headers, log);
    }
    default: {
      return { authenticated: false, error: 'forbidden' };
    }
  }
}

export function transformV1AuthHeadersToV2(headers: AuthHeadersV1, projectId: string): AuthHeadersV2 {
  const { 'bundlemon-auth-type': authType } = headers;

  if (!authType || authType === 'API_KEY') {
    return {
      ...headers,
      'bundlemon-auth-type': 'API_KEY',
      'bundlemon-project-id': projectId,
      'x-api-key': headers['x-api-key'],
    };
  } else if (authType === 'GITHUB_ACTION') {
    return headers;
  }

  throw Error('unknown auth headers');
}

async function handleProjectAuth(
  headers: ProjectAuthV2Headers,
  log: FastifyLoggerInstance
): Promise<CheckAuthHeadersResponse> {
  const { 'bundlemon-project-id': projectId, 'x-api-key': apiKey } = headers;

  const hash = await getProjectApiKeyHash(projectId);

  if (!hash) {
    log.warn({ projectId }, 'project id not found');
    return { authenticated: false, error: 'forbidden' };
  }

  const isAuthenticated = await verifyHash(apiKey, hash);

  if (isAuthenticated) {
    return { authenticated: true, ownerDetails: { projectId } };
  }

  log.warn({ projectId }, 'wrong API key');
  return { authenticated: isAuthenticated, error: 'forbidden' };
}

async function handleGithubActionAuth(
  headers: GithubActionsAuthHeaders,
  log: FastifyLoggerInstance
): Promise<CheckAuthHeadersResponse> {
  const { 'github-owner': owner, 'github-repo': repo, 'github-run-id': runId } = headers as GithubActionsAuthHeaders;

  const installationId = await getInstallationId(owner, repo);

  if (!installationId) {
    log.info({ owner, repo }, 'missing installation id');
    return { authenticated: false, error: `BundleMon GitHub app is not installed on this repo (${owner}/${repo})` };
  }

  const octokit = createInstallationOctokit(installationId);

  try {
    const res = await octokit.actions.getWorkflowRun({ owner, repo, run_id: Number(runId) });

    // check job status
    if (!['in_progress', 'queued'].includes(res.data.status ?? '')) {
      log.warn(
        { runId, status: res.data.status, createdAt: res.data.created_at, updatedAt: res.data.updated_at },
        'GitHub action should be in_progress/queued status'
      );
      return {
        authenticated: false,
        error: `GitHub action status should be "in_progress" or "queued"`,
        extraData: {
          actionId: runId,
          status: res.data.status,
          workflowId: res.data.workflow_id,
          createdAt: res.data.created_at,
          updatedAt: res.data.updated_at,
        },
      };
    }

    return {
      authenticated: true,
      installationOctokit: octokit,
      ownerDetails: { provider: GitProvider.GitHub, owner, repo },
    };
  } catch (err) {
    let errorMsg = 'forbidden';

    if ((err as any).status === 404) {
      errorMsg = `GitHub action ${runId} not found for ${owner}/${repo}`;
      log.warn({ owner, repo, runId }, 'workflow not found');
    } else {
      log.warn({ err, owner, repo, runId }, 'error during getWorkflowRun');
    }

    return { authenticated: false, error: errorMsg };
  }
}
