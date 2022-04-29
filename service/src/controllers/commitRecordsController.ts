import { createCommitRecord, getCommitRecords, getCommitRecord } from '../framework/mongo';
import { checkAuthHeaders, transformV1AuthHeadersToV2 } from '../utils/auth';
import { generateLinkToReport } from '../utils/linkUtils';
import { BaseRecordCompareTo } from '../consts/commitRecords';

import type {
  FastifyValidatedRoute,
  CreateCommitRecordV1RequestSchema,
  CreateCommitRecordV2RequestSchema,
  GetCommitRecordRequestSchema,
  GetCommitRecordsRequestSchema,
} from '../types/schemas';
import type {
  BaseCommitRecordResponse,
  CommitRecord,
  CreateCommitRecordResponse,
} from 'bundlemon-utils/lib/esm/v2/types';
import type { FastifyReply } from 'fastify';

export const getCommitRecordsController: FastifyValidatedRoute<GetCommitRecordsRequestSchema> = async (req, res) => {
  const records = await getCommitRecords(req.params, req.query);

  res.send(records);
};

export const createCommitRecordV1Controller: FastifyValidatedRoute<CreateCommitRecordV1RequestSchema> = async (
  { params: { projectId }, body, headers },
  res
) => {
  handleCreateCommitRecord({ body, headers: transformV1AuthHeadersToV2(headers, projectId), res });
};

export const createCommitRecordV2Controller: FastifyValidatedRoute<CreateCommitRecordV2RequestSchema> = async (
  { body, headers },
  res
) => {
  handleCreateCommitRecord({ body, headers, res });
};

interface HandleCreateCommitRecordParams {
  headers: CreateCommitRecordV2RequestSchema['headers'];
  // TODO: change to new body structure?
  body: CreateCommitRecordV2RequestSchema['body'];
  res: FastifyReply;
}

export const handleCreateCommitRecord = async ({ headers, body, res }: HandleCreateCommitRecordParams) => {
  const authResult = await checkAuthHeaders(headers, res.log);

  if (!authResult.authenticated) {
    res.status(403).send({ error: authResult.error });
    return;
  }

  const { ownerDetails } = authResult;
  const record = await createCommitRecord(ownerDetails, body);

  res.log.info({ recordId: record.id }, 'commit record created');

  let baseRecord: CommitRecord | undefined;

  try {
    baseRecord = (
      await getCommitRecords(ownerDetails, {
        branch: body.baseBranch ?? body.branch,
        subProject: body.subProject,
        latest: true,
        olderThan: new Date(record.creationDate),
      })
    )?.[0];

    if (baseRecord) {
      res.log.info({ baseRecordId: baseRecord.id }, 'base record found');
    }
  } catch (err) {
    res.log.error({ err }, 'Error while fetching base record');
  }

  const response: CreateCommitRecordResponse = {
    record,
    baseRecord,
    linkToReport: generateLinkToReport({ ownerDetails, commitRecordId: record.id }),
  };

  res.send(response);
};

export const getCommitRecordWithBaseController: FastifyValidatedRoute<GetCommitRecordRequestSchema> = async (
  req,
  res
) => {
  const { commitRecordId, ...ownerDetails } = req.params;
  const { compareTo = BaseRecordCompareTo.PreviousCommit } = req.query;

  const record = await getCommitRecord({ ownerDetails, commitRecordId });

  if (!record) {
    req.log.info({ commitRecordId, ownerDetails }, 'commit record not found');
    res.status(404).send('commit record not found for project');
    return;
  }

  const baseRecord = (
    await getCommitRecords(ownerDetails, {
      branch: record.baseBranch ?? record.branch,
      subProject: record.subProject,
      latest: true,
      olderThan: compareTo === BaseRecordCompareTo.PreviousCommit ? new Date(record.creationDate) : undefined,
    })
  )?.[0];

  const response: BaseCommitRecordResponse = { record, baseRecord };

  res.send(response);
};
