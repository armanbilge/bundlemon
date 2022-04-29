/* istanbul ignore file */

import type { OwnerDetails } from 'bundlemon-utils/lib/esm/v2/types';
import type { BaseGetRequestSchema } from './common';

export interface GetSubprojectsRequestSchema extends BaseGetRequestSchema {
  params: OwnerDetails;
}
