/* istanbul ignore file */

import type { Compression, DiffChange, FailReason, GitProvider, Status } from '../consts';

export interface FileDetails {
  pattern: string;
  path: string;
  size: number;
  compression: Compression;
  maxSize?: number;
  maxPercentIncrease?: number;
}

export interface DiffFromBase {
  bytes: number;
  percent: number;
  change: DiffChange;
}

export type FileStatusObject =
  | { status: Status.Pass; failReasons?: undefined }
  | { status: Status.Fail; failReasons: FailReason[] };

export type FileDetailsDiff = FileDetails & { diff: DiffFromBase } & FileStatusObject;

export interface CommitRecordPayload {
  /**
   * @minLength 1
   * @maxLength 100
   * @pattern ^[A-Za-z0-9_\-. ]*$
   */
  subProject?: string;
  files: FileDetails[];
  groups: FileDetails[];
  /**
   * @minLength 1
   * @maxLength 100
   */
  branch: string;
  /**
   * @minLength 1
   * @maxLength 100
   * @pattern ^[A-Za-z0-9]*$
   */
  commitSha: string;
  /**
   * @minLength 1
   * @maxLength 100
   */
  baseBranch?: string;
  /**
   * @minLength 1
   * @maxLength 10
   * @pattern ^[0-9]*$
   */
  prNumber?: string;
}

export interface BaseCommitRecord extends CommitRecordPayload {
  id: string;
  creationDate: string;
}

export type ProjectCommitRecord = BaseCommitRecord & ProjectOwnerDetails;
export type GitCommitRecord = BaseCommitRecord & GitOwnerDetails;
export type CommitRecord = ProjectCommitRecord | GitCommitRecord;

export interface DiffStats {
  currBranchSize: number;
  baseBranchSize: number;
  diff: {
    bytes: number;
    percent: number;
  };
}

export interface BaseCommitRecordResponse {
  record: CommitRecord;
  baseRecord?: CommitRecord;
}

export interface CreateCommitRecordResponse extends BaseCommitRecordResponse {
  linkToReport: string;
}

export interface ReportMetadata {
  subProject?: string;
  linkToReport?: string;
  record?: CommitRecord;
  baseRecord?: CommitRecord;
}

export interface DiffReportInput {
  files: FileDetails[];
  groups: FileDetails[];
}

export interface DiffReport {
  files: FileDetailsDiff[];
  stats: DiffStats;
  groups: FileDetailsDiff[];
  status: Status;
}

export interface Report extends DiffReport {
  metadata: ReportMetadata;
}

export interface CreateProjectResponse {
  projectId: string;
  apiKey: string;
}

export type OutputResult = 'success' | 'failure' | 'skipped';

export interface OutputResponse {
  result: OutputResult;
  message: string;
  metadata?: Record<string, unknown>;
}
export type GithubOutputTypes = 'checkRun' | 'commitStatus' | 'prComment';
export type GithubOutputResponse = Partial<Record<GithubOutputTypes, OutputResponse>>;

export interface ProjectOwnerDetails {
  /**
   * @pattern ^[0-9a-fA-F]{24}$
   */
  projectId: string;
}

export interface GitOwnerDetails {
  provider: GitProvider;
  owner: string;
  repo: string;
}

export type OwnerDetails = ProjectOwnerDetails | GitOwnerDetails;
