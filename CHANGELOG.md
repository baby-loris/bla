### 1.9.2
  * Updated vow version to 0.4.20 [#124](../../pull/124)

### 1.9.1
  * Updated extend version to 3.0.2

### 1.9.0
  * Remove `jade` package.
  * Pass extra data with `ApiError`.
  * Add custom params validation.

### 1.8.0
  * Support timeout option [#112](../../issues/112).

### 1.7.0
  * Rename engineStrict to engine-strict.
  * Rename toJson method to toJSON [#111](../../issues/111).
  * Move badges to the next line.

### 1.6.1
  * Add `client.js` to package assets.

### 1.6.0
  * Add more convenient way to require bla [#109](../../issues/109).

### 1.5.2
  * Use only latest browser versions for `zuul` tests.
  * Change examples port to `7777` to avoid collisions.
  * Show exra information in validation error messages [#108](../../pull/108).

### 1.5.1
  * Update vow and vow-fs.

### 1.5.0
  * Don't use predefined API errors for xhr.

### 1.4.3
  * Increase priority for xhr.responseText.

### 1.4.2
  * Remove vow from devDeps.
  * Add licence field.
  * Freeze dependencies in package.json.
  * Use container-base infrastructure.

### 1.4.1
  * Fix bla for commonjs.
  * Remove `NO_DEPRECATION` flag.

### 1.4.0
  * Add preventThrowingErrors option [#106](../../pull/106).

### 1.3.1
  * Add toJson support for batch method [#102](../../pull/102).
  * Fix misprint in an error message.
  * Add recommendation to use ApiError.

### 1.3.0
  * Add `toJson` method to ApiError [#101](../../pull/101).

### 1.2.0
  * Add default editor to release tool
  * Add Common JS support
  * Add link to cdnjs
  * Use svg instead of png to get better image quality
  * Update tests
  * Add zuul support

### 1.1.0
  * Add 'allowUndeclaredParams' option for methods [#95](../../pull/95).

### 1.0.0
  * Remove all deprecated methods and options [#92](../../pull/92). (**breaks backward compatibility**)
  * Throw an error for redeclared methods [#82](../../pull/92).
  * Support urlencoded params [#83](../../pull/83).
  * Prevent passing undeclared parameters [#85](../../pull/85).
  * Remove peerDependency for vow [#86](../../pull/86).
  * Rename bla-batch -> batch [#88](../../pull/88).
  * Pass only an Api instance to the middleware, not methodPathPattern [#89](../../pull/89). (**breaks backward compatibility**)
  * Add validators for method parameters [#87](../../pull/87).
  * Add strict type validator [#93](../../pull/93).
  * and a lot of fixes and improvements.

### 0.1.1
  * Support `enableBatching` option [#73](../../pull/73).
  * Rename `getParamsDeclarations` -> `getParams` [#80](../../pull/80).
  * Proxy query and post body to `api.exec` [#80](../../pull/80).

### 0.1.0
  * Fix bug in normalizing parameters (incorrect handling `null` or `false` values).
  * Remove `hiddenOnDocPage` option. Use `showOnDocPage` option instead. (**breaks backward compatibility**)
  * Support `enableDocPage` option (`disableDocPage` is deprecated).
  * Refactor enb example. Use BEM methodology by default.
  * Move reference to [a separate page](REFERENCE.md).
  * Show `asis` type in docpage instead of `String`.
  * Show warning about `body-parser` only for post requests.
  * Add link to [chrome extension](https://github.com/baby-loris/bla-batch-chrome-extension).

### 0.0.15
  * Change interface for declaring ApiMethod [#56](../../pull/56). The old one is deprecated and will be removed in the next version.
  * Add defaultValue for method parameters [#57](../../pull/57).
  * Add string type to method parameters [#58](../../pull/58).

### 0.0.14
  * Add `noBatching` option for `api.exec`. [#52](../../pull/52)
  * Rename option `noBatch` to `noBatching` for `Api` constructor. [#52](../../pull/52) (**breaks backward compatibility**)
  * Throw an error if body-parser is missed. [#55](../../pull/55)
  * Add an awesome release tool. Maintainers are happy :) [#51](../../pull/51)
  * And also a lot of small fixes and improvments were added. Enjoy the new version!

### 0.0.13
  * Change handling errors. If you throw ApiError in methods, you should return ```vow.reject``` instead. (**breaks backward compatibility**)
  * Add tests for examples.
  * Improve batch speed (using next tick for modern browsers).

### 0.0.12
  * Build on `npm prepublish`

### 0.0.11
  * Change package name: ```baby-loris-api``` -> ```bla```  (**breaks backward compatibility**).

### 0.0.10
  * Find api methods synchronously.

### 0.0.9
  * Delete using express session for search parameter value (**breaks backward compatibility**).
  * Fix bug when the batch method does not proxy request to submethods.

### 0.0.8
  * Add a possibility to pass an Api instance to the middleware. [#22](../../issues/22)
  * Proxy express request to a method. [#20](../../issues/20)
  * Export namespace instead of paths on file system.

### 0.0.7
  * Add ```setOption``` method. [#9](../../issues/9) (**breaks backward compatibility**)
  * Add batch support for the client side. [#10](../../issues/10)
  * Add more examples. [#6](../../issues/6), [#11](../../issues/11)
  * Add a special example for enb project. [#12](../../issues/12)
  * Add a contribution guide. [#18](../../issues/18)
  * Add AMD support and global for the client (remove ym dependency). [#16](../../issues/16)
  * Build baby-loris-api.min.js for each npm release. [#15](../../issues/15)
  * Remove jquery and inherit dependecies for the client. [#13](../../issues/13), [#14](../../issues/14)
  * Fix coverage calculating.

### 0.0.6
  * Add Features part and link to the [demo project](https://github.com/tarmolov/weatherpic).
  * Use json for body in post requests (**breaks backward compatibility**).
  * Fix a couple of issues: [#5](../../issues/5), [#7](../../issues/7)

### 0.0.5
  * Add ym to peerDependencies.
  * Strict a node engine. Works properly only with node >= 0.10.x.

### 0.0.4
  * Fix misprint in peerDependencies.

### 0.0.3
  * Add ```Array``` type.
  * Fix bugs: [#1](../../issues/1), [#2](../../issues/2), [#3](../../issues/3), [#4](../../issues/4).

### 0.0.2
  * Add the licence (MIT).
  * Add a test coverage.
  * Middleware looks up params in ```req.session```, too. See [express-session](https://github.com/expressjs/session) for more details.

### 0.0.1
  * Add the server side implementation (Api class, ApiMethod class, ApiError class).
  * Add the express middleware (provide access from the frontend side and can generate documentation for all api methods).
  * Add the frontend side implementation (Api class, ApiError class).
  * Add examples for each major cases.
  * Add tests and validation for the server side, for the frontend side, and for the middleware.
  * Add documentation.
