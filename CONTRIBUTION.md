## Pull requests and Code contributions

* Tests must pass.
* Follow [existing coding style](https://github.com/ymaps/codestyle/blob/master/js.md) (jscs and jshint will help you).
* If you fix a bug, add a test.
* If you cannot fix a bug, add pull request with a test which failed but should not.
* Makes sure that coverage does not decrease.

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
### Create your own copy of baby-loris-api
```
git clone https://github.com/tarmolov/baby-loris-api.git
cd baby-loris-api
make
```

**Note.** It is better to create a fork if you plan to make a pull request.

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

### Build coverage (only for sever side)
```
make coverage
```

## How to publish a new version to npm
**Note.** Only for maintainers.

  1. Add a new record to the [CHANGELOG.md](CHANGELOG.md).
  2. Add a version tag.
  3. Push changelog and tag.

Travis does all other stuff for you.
