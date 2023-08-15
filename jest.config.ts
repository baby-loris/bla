import { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/**/*.test.ts'],
    setupFiles: ['<rootDir>/jestSetup.ts']
};

export default config;
