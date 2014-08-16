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
        quotmark: 'single'
    },
    groups: {
        client: {
            options: {
                browser: true,
                predef: ['modules']
            },
            includes: [
                'blocks/**/*.js',
                'examples/**/*/*client.js'
            ],
            excludes: [
                'blocks/**/*.test.js'
            ]
        },

        server: {
            options: {
                node: true
            },
            includes: [
                'api/**/*.js',
                'examples/**/*.js',
                'lib/**/*.js'
            ],
            excludes: [
                'examples/**/*client.js'
            ]
        },

        'client tests': {
            options: {
                browser: true,
                predef: [
                    'modules',
                    'describe',
                    'it',
                    'before',
                    'beforeEach',
                    'after',
                    'afterEach',
                    'chai',
                    'sinon'
                ],
                expr: true
            },
            includes: [
                'blocks/**/*.test.js'
            ]
        },

        'server tests': {
            options: {
                node: true,
                predef: [
                    'describe',
                    'it',
                    'should',
                    'require'
                ],
                expr: true
            },
            includes: [
                'test/api/**/*.test.js',
                'test/server/**/*.test.js',
                'test/examples/**/*.test.js'
            ]
        }
    }
};
