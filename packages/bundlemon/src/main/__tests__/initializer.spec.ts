import * as fs from 'fs';
import { validateConfig } from '../utils/configUtils';
import { initializer } from '../initializer';
import { Config } from '../types';
import { initOutputs } from '../outputs';
import { generateNormalizedConfigRemoteOn } from '../utils/__tests__/configUtils';

jest.mock('fs');
jest.mock('../../common/logger');
jest.mock('../utils/configUtils');
jest.mock('../outputs');

const config: Config = {
  files: [],
};

describe('initializer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('validate config failed', async () => {
    const mockedValidateConfig = jest.mocked(validateConfig).mockResolvedValue(undefined);

    const result = await initializer(config);

    expect(mockedValidateConfig).toHaveBeenCalledWith(config);
    expect(result).toEqual(undefined);
  });

  test('base dir not found', async () => {
    const expectedNormalizedConfig = generateNormalizedConfigRemoteOn();
    const mockedValidateConfig = jest.mocked(validateConfig).mockResolvedValue(expectedNormalizedConfig);
    const mockedExistsSync = jest.mocked(fs.existsSync).mockReturnValue(false);

    const result = await initializer(config);

    expect(mockedValidateConfig).toHaveBeenCalledWith(config);
    expect(mockedExistsSync).toHaveBeenCalledWith(expectedNormalizedConfig.baseDir);
    expect(result).toEqual(undefined);
  });

  test('failed to initialize outputs', async () => {
    const expectedNormalizedConfig = generateNormalizedConfigRemoteOn();
    const mockedValidateConfig = jest.mocked(validateConfig).mockResolvedValue(expectedNormalizedConfig);
    const mockedExistsSync = jest.mocked(fs.existsSync).mockReturnValue(true);
    const mockedInitOutputs = jest.mocked(initOutputs).mockRejectedValue(new Error('error'));

    const result = await initializer(config);

    expect(mockedValidateConfig).toHaveBeenCalledWith(config);
    expect(mockedExistsSync).toHaveBeenCalledWith(expectedNormalizedConfig.baseDir);
    expect(mockedInitOutputs).toHaveBeenCalledWith(expectedNormalizedConfig);
    expect(result).toEqual(undefined);
  });

  test('success', async () => {
    const expectedNormalizedConfig = generateNormalizedConfigRemoteOn();
    const mockedValidateConfig = jest.mocked(validateConfig).mockResolvedValue(expectedNormalizedConfig);
    const mockedExistsSync = jest.mocked(fs.existsSync).mockReturnValue(true);
    const mockedInitOutputs = jest.mocked(initOutputs).mockResolvedValue();

    const result = await initializer(config);

    expect(mockedValidateConfig).toHaveBeenCalledWith(config);
    expect(mockedExistsSync).toHaveBeenCalledWith(expectedNormalizedConfig.baseDir);
    expect(mockedInitOutputs).toHaveBeenCalledWith(expectedNormalizedConfig);
    expect(result).toEqual(expectedNormalizedConfig);
  });
});
