import { generateReportMarkdown } from 'bundlemon-markdown-output';
import { CommitRecordsQueryResolution } from '../../consts/commitRecords';
import { generateLinkToReports, GenerateLinkToReportskParams } from '../../utils/linkUtils';
import { extractOwnerDetailsFromCommitRecord } from '../..//utils/ownerDetails';

import type { Report, CommitRecord } from 'bundlemon-utils/lib/esm/v2/types';

interface GetReportsPageLinkParams extends GenerateLinkToReportskParams {
  text: string;
}

function getReportsPageLink({ text, ...linkParams }: GetReportsPageLinkParams): string {
  return `<a href="${generateLinkToReports(linkParams)}" target="_blank" rel="noreferrer noopener">${text}</a>`;
}

// TODO: max 65535 chars
export function generateReportMarkdownWithLinks(report: Report): string {
  const {
    metadata: { record, baseRecord },
  } = report;

  let body = generateReportMarkdown(report);

  if (record || baseRecord) {
    const r = (record || baseRecord) as CommitRecord;
    const { subProject } = r;
    const ownerDetails = extractOwnerDetailsFromCommitRecord(r);

    const links: string[] = [];

    if (record) {
      links.push(
        getReportsPageLink({
          ownerDetails,
          subProject,
          branch: record.branch,
          resolution: CommitRecordsQueryResolution.All,
          text: 'Current branch size history',
        })
      );
    }

    if (baseRecord) {
      links.push(
        getReportsPageLink({
          ownerDetails,
          subProject,
          branch: baseRecord.branch,
          resolution: CommitRecordsQueryResolution.Days,
          text: 'Target branch size history',
        })
      );
    }

    body += `\n\n---\n<p align="center">${links.join(' | ')}</p>`;
  }

  return body;
}
