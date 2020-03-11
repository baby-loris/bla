import typescript from 'rollup-plugin-typescript2';
import * as pkg from './package.json';

const rollupConfig = ['server', 'client'].map(env => ({
    input: `./src/${env}/index.ts`,
    output: [
        {
            name: pkg.name,
            file: `./${env}/index.js`,
            format: 'cjs'
        }
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                    declarationDir: '.',
                    module: 'esnext',
                    target: env === 'client' ? 'es5' : 'es2017'
                },
                include: [`src/${env}/**/*`],
                exclude: [`src/${env}/__tests__`]
            }
        })
    ]
}));

export default rollupConfig;
