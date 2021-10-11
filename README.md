# @ailo/date

Features:

- `DateTimeWithTimeZone` - date + time + timezone
- `LocalDate` - date
- `RecurringDate` - date that repeats daily/weekly/fortnightly/monthly/annually
- `DefaultTimeZoneRef` - holds the default timezone that will be used (when timezone arg is not passed)
- `DateRange` - date range that spans between two dates

## Development

```sh
yarn
yarn start
```

## Testing

```sh
yarn lint # prettier and eslint
yarn test # unit tests
yarn test:watch # unit tests in watch mode
yarn validate # run linters, tests and build
```

## Releasing

Push changes to master. Buildkite will automatically bump the version using [standard-version](https://github.com/conventional-changelog/standard-version) and publish it to npm.
