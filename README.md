# @ailo/date

Features:

- `DateTimeWithTimeZone` - date + time + timezone
- `LocalDate` - date
- `RecurringDate` - date that repeats daily/weekly/fortnightly/monthly/annually
- `DefaultTimeZoneRef` - holds the default timezone that will be used (when timezone arg is not passed)

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

**Note: Releasing is done manually. This project has no CI/CD configuration.**

```sh
yarn release # will automatically ask you about version bump, run tests and build, and push new version to git & npm
```
