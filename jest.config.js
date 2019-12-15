module.exports = {
    globals: {
        'ts-jest': {
            diagnostics: true,
            isolatedModules: true
        }
    },
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testRegex: '__tests__/.*\\.test\\.ts$',
    moduleFileExtensions: ['ts', 'js'],
    automock: false,
    setupFiles: [
        './jestSetup.ts'
    ]
};
