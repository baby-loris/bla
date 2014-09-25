## Pull requests and Code contributions

* Tests must pass.
* Follow [our coding style](https://github.com/ymaps/codestyle/blob/master/js.md) (jscs and jshint will help you).
* If you fix a bug, add a test.
* If you can't fix a bug, file an [issue](https://github.com/baby-loris/bla/issues/new) with the steps to reproduce, the expected and the actual results.
* Make sure that the test coverage doesn't decrease.

## Library structure
```
.git-hooks              Git hooks
api                     Built-in Api methods
blocks                  Frontend side code
build                   Built version of the frontend code
examples                Usage examples
lib                     Server side code
tests                   Tests
```

## How to develop
### Create your own copy of bla
```
git clone https://github.com/baby-loris/bla.git
cd bla
make
```

**Note.** It's better to create a fork, if you plan to make a pull request.

### Run tests
All tests:
```
make test
```

Only client tests:
```
make test-client
```

Only server tests:
```
make test-server
```

Only examples tests:
```
make test-examples
```

### Build coverage (only for server side)
```
make coverage
```

## How to publish a new version to npm
**Note.** Only for maintainers.

  1. Increment version in [package.json](package.json).
  2. Add a new record to the [CHANGELOG.md](CHANGELOG.md).
  3. Add a version tag (for example, `git tag 0.0.12`).
  4. Push changelog and tag (basically, `git push && git push --tags`).

Travis does all other stuff for you.
