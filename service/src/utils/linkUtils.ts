import { appDomain } from '../framework/env';
import { URLSearchParams } from 'url';
import { CommitRecordsQueryResolution } from '../consts/commitRecords';
import { OwnerDetails } from 'bundlemon-utils/lib/esm/v2/types';

interface GenerateLinkToReport {
  ownerDetails: OwnerDetails;
  commitRecordId: string;
}

export function generateLinkToReport({ ownerDetails, commitRecordId }: GenerateLinkToReport) {
  return `${generateBaseLinkByOwnerDetails(ownerDetails)}/reports/${commitRecordId}`;
}

export interface GenerateLinkToReportskParams {
  ownerDetails: OwnerDetails;
  subProject?: string;
  branch: string;
  resolution: CommitRecordsQueryResolution;
}

export function generateLinkToReports({ ownerDetails, subProject, branch, resolution }: GenerateLinkToReportskParams) {
  const query = new URLSearchParams({ branch, resolution });

  if (subProject) {
    query.append('subProject', subProject);
  }

  return `${generateBaseLinkByOwnerDetails(ownerDetails)}/reports?${query.toString()}`;
}

function generateBaseLinkByOwnerDetails(ownerDetails: OwnerDetails) {
  return `https://${appDomain}/${generateOwnerDetailsLinkPath(ownerDetails)}`;
}

export function generateOwnerDetailsLinkPath(ownerDetails: OwnerDetails) {
  if ('projectId' in ownerDetails) {
    const { projectId } = ownerDetails;
    return `projects/${projectId}`;
  } else {
    const { provider, owner, repo } = ownerDetails;
    return `providers/${provider}/${owner}/${repo}`;
  }
}
