module.exports = {
    options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        undef: true,
        unused: true,
        trailing: true,
        maxlen: 120,
        quotmark: 'single',
        expr: true
    },
    groups: {
        client: {
            options: {
                browser: true,
                predef: ['modules', 'define', 'require', 'bla']
            },
            includes: [
                'blocks/**/*.js',
                'examples/frontend/*/client.js',
                'examples/frontend/enb/blocks/*.js'
            ],
            excludes: [
                'examples/frontend/ym/blocks/*.bt.js'
            ]
        },

        server: {
            options: {
                node: true
            },
            includes: [
                'tools/**/*.js',
                'api/**/*.js',
                'examples/api/*.js',
                'examples/backend/*.js',
                'examples/middleware/*.js',
                'examples/fronted/*/index.js',
                'examples/frontend/ym/blocks/*.bt.js',
                'lib/**/*.js'
            ]
        },

        'client tests': {
            options: {
                browser: true,
                predef: [
                    'modules',
                    'describe',
                    'it',
                    'beforeEach',
                    'afterEach',
                    'chai',
                    'should',
                    'sinon'
                ],
                expr: true
            },
            includes: [
                'tests/blocks/**/*.test.js'
            ]
        },

        'server tests': {
            options: {
                node: true,
                predef: [
                    'describe',
                    'it',
                    'beforeEach',
                    'afterEach',
                    'should',
                    'require'
                ],
                expr: true
            },
            includes: [
                'tests/api/**/*.test.js',
                'tests/server/**/*.test.js',
                'tests/examples/**/*.test.js'
            ]
        }
    }
};
