import { CommitRecord, OwnerDetails, ProjectCommitRecord, GitCommitRecord } from 'bundlemon-utils/lib/esm/v2/types';

export function extractOwnerDetailsFromCommitRecord(record: CommitRecord): OwnerDetails {
  if (isProjectCommitRecord(record)) {
    return { projectId: record.projectId };
  }

  if (isGitCommitRecord(record)) {
    return { provider: record.provider, owner: record.owner, repo: record.repo };
  }

  throw Error('unknown owner details');
}

function isProjectCommitRecord(record: CommitRecord): record is ProjectCommitRecord {
  return !!(record as ProjectCommitRecord).projectId;
}

function isGitCommitRecord(record: CommitRecord): record is GitCommitRecord {
  const r = record as GitCommitRecord;

  return Boolean(r.provider && r.owner && r.repo);
}
