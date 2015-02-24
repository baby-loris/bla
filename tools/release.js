var argv = require('optimist')
    .usage('Release new version.\nUsage: $0 <release_type|version>')
    .demand(1)

    .describe('c', 'Changelog file path.')
    .options('c', {
        alias: 'changelog',
        default: 'CHANGELOG.md'
    })
    .describe('no-changelog', 'Prevent updating of the changelog.')

    .describe('no-edit', 'Do not start editor to edit changelog.')

    .describe('commit', 'Commit message. `%v` will be replaced with version string.')
    .default('commit', '%v')
    .describe('no-commit', 'Do not commit changes. Also implies `no-tag` option.')

    .describe('tag', 'Tag name. `%v` will be replaced with version string.')
    .default('tag', '%v')
    .describe('no-tag', 'Do not tag commit.')

    .argv;

var child_process = require('child_process');
var exec = child_process.exec;
var semver = require('semver');
var vow = require('vow');
var vowFs = require('vow-fs');
var util = require('util');

/**
 * Runs a command.
 *
 * @param {String} cmd The command to be run.
 * @returns {vow.Promise} Promise that will be fulfilled when the command exits
 *      with 0 return code and rejected if return code is non-zero.
 */
function vowExec(cmd) {
    var defer = vow.defer();
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            defer.reject({err: err, stderr: stderr});
        } else {
            defer.resolve(stdout.trim());
        }
    });
    return defer.promise();
}

/**
 * Runs editor (specified through EDITOR environment variable) to edit a file.
 *
 * @param {String} file The file to be edited.
 * @returns {vow.Promise} Promise that will be fulfilled when the editor exits
 *      with 0 return code and rejected if return code is non-zero.
 */
function runEditor(file) {
    var defer = vow.defer();
    var editor = process.env.EDITOR || 'vim';
    child_process.spawn(editor, [file], {stdio: 'inherit'})
        .on('exit', function (code) {
            if (code === 0) {
                defer.resolve();
            } else {
                defer.reject();
            }
        });
    return defer.promise();
}

/**
 * @returns {vow.Promise} Promise that'll be fulfilles with git tags which are valid
 *      semver versions.
 */
function versionTags() {
    return vowExec('git tag').then(function (stdout) {
        return stdout.split('\n')
            .map(function (tag) {
                return tag.trim();
            })
            .filter(function (tag) {
                return semver.valid(tag);
            });
    });
}

/**
 * Compares to semver versions.
 *
 * @param {String} fstVer
 * @param {String} sndVer
 * @returns {Number} -1 if fstVer if older than sndVer, 1 if newer and 0 if
 *      versions are equal.
 */
function compareVersions(fstVer, sndVer) {
    if (semver.lt(fstVer, sndVer)) {
        return 1;
    }
    if (semver.gt(fstVer, sndVer)) {
        return -1;
    }
    return 0;
}

/**
 * @returns {vow.Promise} Promise that'll be fulfilled with newest version tag.
 */
function lastVersion() {
    return versionTags().then(function (tags) {
        return tags.sort(compareVersions)[0];
    });
}

/**
 * Tags HEAD rev.
 *
 * @param {String} name Name of the tag.
 * @returns {vow.Promise} Promise that'll be fulfilled on success.
 */
function tagHead(name) {
    return vowExec(util.format('git tag "%s" HEAD', name));
}

/**
 * Commits changes in tracked files.
 *
 * @param {String} msg Commit message.
 * @returns {vow.Promise} Promise that'll be fulfilled on success.
 */
function commitAllChanges(msg) {
    return vowExec(util.format('git commit -a -m "%s" -n', msg))
        .fail(function (res) {
            return vow.reject('Commit failed:\n' + res.stderr);
        });
}

/**
 * Extracts changes from git history.
 *
 * @param {String} from Reference to a point in the history, starting from which
 *      changes will be extracted. Starting point will be the very first commit
 *      if an empty string's provided.
 * @param {String} to Reference to a point in the history, up to which changes
 *      will be extracted. If an empty string's provided change'll include all
 *      commits after the starting point.
 * @param {vow.Promise} Promise that'll be fulfilled with an array of commits'
 *      subject strings.
 */
function changelog(from, to) {
    return vowExec(util.format('git log --format="%%s" %s..%s', from, to))
        .then(function (stdout) {
            return stdout.split('\n');
        });
}

/**
 * Generates markdown text for new a changelog entry.
 *
 * @param {String} version Version of the entry.
 * @param {String[]} log Changes in the new version.
 * @param {String} Markdown.
 */
function mdLogEntry(version, log) {
    return util.format(
        '### %s\n%s\n\n',
        version,
        log.map(function (logItem) {
            return '  * ' + logItem;
        }).join('\n')
    );
}

var changelogFile = argv.changelog;
var pkgJsonIndent = argv.indent || 2;
var commitMessage = argv.commit;
var tagName = argv.tag;
var releaseType = argv._[0];

lastVersion()
    .then(function (lastVersion) {
        return changelog(lastVersion, 'HEAD').then(function (log) {
            /*
             * Generate new version string. It's either incremented last version
             * or provided as cli arg.
             */
            var newVersion = semver.valid(releaseType) ?
                releaseType :
                semver.inc(lastVersion, releaseType);
            return [newVersion, mdLogEntry(newVersion, log)];
        });
    })
    .spread(function (newVersion, newChangelogEntry) {
        var promise = vow.resolve();

        /*
         * Update changelog if `--no-changelog' cli opt isn't provided.
         */
        if (argv.changelog !== false) {
            promise = promise.then(function () {
                return vowFs.read(changelogFile)
                    .then(function (changelogContent) {
                        return vowFs.write(
                            changelogFile,
                            newChangelogEntry + changelogContent
                        );
                    })
                    .then(function () {
                        return argv.edit !== false ?
                            runEditor(changelogFile) :
                            vow.resolve();
                    });
            });
        }

        /*
         * Update `package.json' if `--no-pkgjson' cli opt isn't provided.
         */
        if (argv.pkgjson !== false) {
            promise = promise.then(function () {
                return vowFs.read('./package.json')
                    .then(function (pkgJson) {
                        var data = JSON.parse(pkgJson);
                        data.version = newVersion;
                        return vowFs.write(
                            './package.json',
                            JSON.stringify(data, null, pkgJsonIndent) + '\n'
                        );
                    });
            });
        }

        /*
         * Commit changelog and `package.json' if at least one of them updated
         * and `--no-commit' cli opt isn't provided.
         */
        if (
            argv.commit !== false &&
            (argv.changelog !== false || argv.pkgjson !== false)
        ) {
            promise = promise.then(function () {
                return commitAllChanges(commitMessage.replace('%v', newVersion));
            });

            /**
             * Tag commit if `--no-tag' cli opt isn't provided.
             */
            if (argv.tag !== false) {
                promise = promise.then(function () {
                    return tagHead(tagName.replace('%v', newVersion));
                });
            }
        }

        return promise;
    })
    .done(null, function (err) {
        console.error(err);
        process.exit(1);
    });
