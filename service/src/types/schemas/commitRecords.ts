/* istanbul ignore file */

import type { CommitRecordPayload } from 'bundlemon-utils';
import type { ProjectOwnerDetails, OwnerDetails } from 'bundlemon-utils/lib/esm/v2/types';
import type { CommitRecordsQueryResolution, BaseRecordCompareTo } from '../../consts/commitRecords';
import type { BaseRequestSchema, BaseGetRequestSchema, AuthHeadersV1, AuthHeadersV2 } from './common';

export interface CreateCommitRecordV1RequestSchema extends BaseRequestSchema {
  body: CommitRecordPayload;
  params: ProjectOwnerDetails;
  headers: AuthHeadersV1;
}

export interface CreateCommitRecordV2RequestSchema extends BaseRequestSchema {
  body: CommitRecordPayload;
  headers: AuthHeadersV2;
}

type GetCommitRecordRequestParams = OwnerDetails & {
  /**
   * @pattern ^[0-9a-fA-F]{24}$
   */
  commitRecordId: string;
};

interface GetCommitRecordRequestQuery {
  /**
   * @default "PREVIOUS_COMMIT"
   */
  compareTo?: BaseRecordCompareTo;
}

export interface GetCommitRecordRequestSchema extends BaseGetRequestSchema {
  params: GetCommitRecordRequestParams;
  query: GetCommitRecordRequestQuery;
}

export interface GetCommitRecordsQuery {
  branch: string;
  latest?: boolean;
  resolution?: CommitRecordsQueryResolution;
  subProject?: string;
  olderThan?: Date;
}

export interface GetCommitRecordsRequestSchema extends BaseGetRequestSchema {
  params: OwnerDetails;
  query: GetCommitRecordsQuery;
}
