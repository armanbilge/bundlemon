import * as yup from 'yup';
import path from 'path';
import fs from 'fs';
import { Report } from 'bundlemon-utils';
import { createLogger } from '../../../common/logger';
import { validateYup } from '../../utils/validationUtils';
import type { Output, OutputInstance } from '../types';

const NAME = 'custom';

const logger = createLogger(`${NAME} output`);

interface CustomOutputOptions {
  path?: string;
}
interface NormalizedCustomOutputOptions {
  path: string;
}

export type CustomOutputFunction = (results: Report) => any;

function validateOptions(options: unknown): NormalizedCustomOutputOptions {
  const schema: yup.SchemaOf<CustomOutputOptions, CustomOutputOptions> = yup.object().required().shape({
    path: yup.string().required(),
  });

  const normalizedOptions = validateYup(schema, options, `${NAME} output`);

  if (!normalizedOptions) {
    throw new Error(`validation error in output "${NAME}" options`);
  }

  return normalizedOptions as NormalizedCustomOutputOptions;
}

const output: Output = {
  name: NAME,
  create: ({ options }): OutputInstance | Promise<OutputInstance | undefined> | undefined => {
    const normalizedOptions = validateOptions(options);

    const resolvedPath = path.resolve(normalizedOptions.path);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`custom output file not found: ${resolvedPath}`);
    }

    return {
      generate: async (report: Report): Promise<void> => {
        logger.debug(`Requiring ${resolvedPath}`);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const customOutput = require(resolvedPath);
        customOutput(report);
      },
    };
  },
};

export default output;
