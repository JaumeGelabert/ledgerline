# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

## [0.1.3] - 2025-08-07
### Changed
- CLI version now sourced dynamically from `package.json` (no longer hard-coded).


## [0.1.0] - 2025-08-07
### Added
- Initial public release of `ledgerline` (published to npm).
- TypeScript ESM CLI with `commander`, `inquirer`, `chalk`.
- Command: `add` to create expenses via flags or interactive prompts.
  - Flags: `--amount`, `--category`, `--date`, `--note`, `--currency`, `--interactive`.
- Command: `list` to display expenses with filters and output modes.
  - Filters: `--category`, `--since`, `--until`, `--limit`.
  - Output: pretty text and `--json`.
- Command: `path` to display the data file location.
- JSON persistence at `~/.ledgerline/expenses.json` using `fs-extra`.
- Helpful `-h` output including list filters and examples.
- Build setup with `tsconfig.json`, `npm scripts`, and binary mapping in `package.json`.
