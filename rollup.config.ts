import typescript from 'rollup-plugin-typescript2';
import * as pkg from './package.json';

const rollupConfig = [
    {
        input: './src/server/index.ts',
        output: [
            {
                name: pkg.name,
                file: './server/index.js',
                format: 'cjs'
            }
        ],
        external: Object.keys(pkg.dependencies),
        plugins: [
            typescript({
                useTsconfigDeclarationDir: true,
                tsconfigOverride: {
                    compilerOptions: {
                        allowJs: false,
                        declaration: true,
                        declarationDir: '.',
                        module: 'esnext'
                    },
                    include: ['src/server/**/*'],
                    exclude: ['src/server/__tests__']
                }
            })
        ]
    },
    {
        input: './src/client/index.ts',
        output: [
            {
                name: pkg.name,
                file: './client/index.js',
                format: 'cjs'
            }
        ],
        external: Object.keys(pkg.dependencies),
        plugins: [
            typescript({
                useTsconfigDeclarationDir: true,
                tsconfigOverride: {
                    compilerOptions: {
                        allowJs: false,
                        declaration: true,
                        declarationDir: '.',
                        module: 'esnext',
                        target: 'es5'
                    },
                    include: ['src/client/**/*'],
                    exclude: ['src/client/__tests__']
                }
            })
        ]
    }
];

export default rollupConfig;
