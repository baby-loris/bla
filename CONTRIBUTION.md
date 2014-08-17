## Pull requests and Code contributions

* Tests must pass.
* Follow existing coding style (jscs and jshint will help you).
* If you fix a bug, add a test.
* If you cannot fix a bug, add pull request with a test which failed but should not.
* Makes sure that coverage does not decrease.

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
