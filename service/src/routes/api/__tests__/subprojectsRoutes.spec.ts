import { Compression } from 'bundlemon-utils';
import { app } from '@tests/app';
import { generateOwnerDetails, generateRandomString, ownerDetailsTypesApiVersions } from '@tests/utils';
import { createCommitRecord } from '../../../framework/mongo';
import { generateOwnerDetailsLinkPath } from '../../../utils/linkUtils';

describe.each(ownerDetailsTypesApiVersions)(
  'sub projects $apiVersion routes. owner type: $ownerDetailsType',
  ({ apiVersion, ownerDetailsType }) => {
    describe('get sub projects', () => {
      test('no records', async () => {
        const ownerDetails = generateOwnerDetails(ownerDetailsType);

        const response = await app.inject({
          method: 'GET',
          url: `/${apiVersion}/${generateOwnerDetailsLinkPath(ownerDetails)}/subprojects`,
        });

        console.log('TCL ~ test ~ response', response.json());
        expect(response.statusCode).toEqual(200);

        const subProjects = response.json<string[]>();

        expect(subProjects).toHaveLength(0);
      });

      test('no sub projects', async () => {
        const ownerDetails = generateOwnerDetails(ownerDetailsType);
        const ownerDetails2 = generateOwnerDetails(ownerDetailsType);

        await createCommitRecord(ownerDetails, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
        });

        await createCommitRecord(ownerDetails, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
          // @ts-expect-error
          subProject: null,
        });

        await createCommitRecord(ownerDetails2, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
          subProject: 'test',
        });

        const response = await app.inject({
          method: 'GET',
          url: `/${apiVersion}/${generateOwnerDetailsLinkPath(ownerDetails)}/subprojects`,
        });

        expect(response.statusCode).toEqual(200);

        const subProjects = response.json<string[]>();

        expect(subProjects).toHaveLength(0);
      });

      test('with sub projects', async () => {
        const ownerDetails = generateOwnerDetails(ownerDetailsType);
        const ownerDetails2 = generateOwnerDetails(ownerDetailsType);

        await createCommitRecord(ownerDetails, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
        });

        await createCommitRecord(ownerDetails, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
          subProject: 'sub1',
        });

        await createCommitRecord(ownerDetails, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
          subProject: 'sub2',
        });

        await createCommitRecord(ownerDetails, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
          subProject: 'sub1',
        });

        await createCommitRecord(ownerDetails2, {
          branch: 'other',
          commitSha: generateRandomString(8),
          files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
          groups: [],
          subProject: 'test',
        });

        const response = await app.inject({
          method: 'GET',
          url: `/${apiVersion}/${generateOwnerDetailsLinkPath(ownerDetails)}/subprojects`,
        });

        expect(response.statusCode).toEqual(200);

        const subProjects = response.json<string[]>();

        expect(subProjects).toHaveLength(2);
        expect(subProjects).toEqual(['sub1', 'sub2']);
      });
    });
  }
);
