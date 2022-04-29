import { GitProvider } from 'bundlemon-utils';
import { OwnerDetails } from 'bundlemon-utils/lib/esm/v2/types';
import { randomBytes } from 'crypto';

export enum OwnerDetailsType {
  Project = 'project',
  GitHub = 'github',
}

export const ownerDetailsTypes = Object.values(OwnerDetailsType);
export const ownerDetailsTypesApiVersions = [
  { apiVersion: 'v1', ownerDetailsType: OwnerDetailsType.Project },
  { apiVersion: 'v2', ownerDetailsType: OwnerDetailsType.Project },
  { apiVersion: 'v2', ownerDetailsType: OwnerDetailsType.GitHub },
];

export function generateRandomString(length = 10) {
  return randomBytes(length / 2).toString('hex');
}

export function generateOwnerDetails(ownerDetailsType: OwnerDetailsType): OwnerDetails {
  switch (ownerDetailsType) {
    case 'github': {
      return {
        provider: GitProvider.GitHub,
        owner: generateRandomString(),
        repo: generateRandomString(),
      };
    }
    case 'project': {
      return { projectId: generateRandomString(24) };
    }
  }

  throw new Error('unknown ownerDetailsType');
}
