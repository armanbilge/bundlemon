import * as yup from 'yup';
import * as bytes from 'bytes';
import { branch, sha, pull_request_target_branch } from 'ci-env';
import { Config, NormalizedConfig, NormalizedFileConfig, GitConfig } from '../types';
import logger from '../../common/logger';
import { compressions } from 'bundletracker-utils';
import { validateYup } from './validationUtils';

export function normalizeConfig(config: Config): NormalizedConfig {
  return {
    ...config,
    verbose: config.verbose ?? false,
    defaultCompression: config.defaultCompression ?? 'gzip',
    trackBranches: config.trackBranches || ['master'],
    reportOutput: config.reportOutput || [],
    shouldRetainReportUrl: config.shouldRetainReportUrl ?? true,
    onlyLocalAnalyze: config.onlyLocalAnalyze ?? false,
    files: config.files.map(
      (f): NormalizedFileConfig => {
        const { maxSize, ...rest } = f;

        return { maxSize: maxSize ? bytes(maxSize) : undefined, ...rest };
      }
    ),
  };
}

export function validateConfig(config: Config): config is Config {
  const schema = yup
    .object()
    .required()
    .shape<Config>({
      baseDir: yup.string().required(),
      verbose: yup.boolean().optional(),
      defaultCompression: yup.string().optional().oneOf(compressions),
      trackBranches: yup.array().optional().of(yup.string().required()),
      shouldRetainReportUrl: yup.boolean().optional(),
      onlyLocalAnalyze: yup.boolean().optional(),
      files: yup
        .array()
        .required()
        .of(
          yup
            .object()
            .required()
            .shape({
              path: yup.string().required(),
              maxSize: yup
                .string()
                .optional()
                .test(
                  'maxSize',
                  (params) => `${params.path} not a valid max size`,
                  (value: string | undefined) => {
                    if (value === undefined) {
                      return true;
                    }
                    const sizeInBytes = bytes(value);

                    return !isNaN(sizeInBytes);
                  }
                ),
            })
        ),
    });

  return validateYup(schema, config, 'bundletracker');
}

export function isGitConfigValid(gitConfig: Partial<GitConfig>): boolean {
  const { branch, commitSha } = gitConfig;

  if (!branch) {
    logger.error('Missing "CI_BRANCH" env var');
    return false;
  }

  if (!commitSha) {
    logger.error('Missing "CI_COMMIT_SHA" env var');
    return false;
  }

  return true;
}

export function getGitConfig(): GitConfig | undefined {
  if (!branch) {
    logger.error('Missing "CI_BRANCH" env var');
    return undefined;
  }

  if (!sha) {
    logger.error('Missing "CI_COMMIT_SHA" env var');
    return undefined;
  }

  return { branch, commitSha: sha, baseBranch: pull_request_target_branch };
}