# ledgerline

A modern, friendly CLI to track your expenses, saved locally in JSON.

- Stores data at `~/.ledgerline/expenses.json`
- Add expenses via flags or interactive prompts
- List with powerful filters and JSON output

## Requirements
- Node.js >= 18

## Install

Global install:
```bash
npm i -g ledgerline
```

Run the CLI help menu:
```bash
npx ledgerline -h
```

Upgrade to latest:
```bash
npm i -g ledgerline@latest
```

## Quick start

Add an expense (interactive):
```bash
npx ledgerline add
```

Add an expense (flags):
```bash
npx ledgerline add --amount 12.50 --category Food --date 2025-08-07 --note "Lunch" --currency EUR
```

List expenses (pretty):
```bash
npx ledgerline list
```

List as JSON (machine-readable):
```bash
npx ledgerline list --json
```

## Commands

### add
Add a new expense using flags or interactive prompts.

Options:
- `-a, --amount <number>`: Amount (required unless using interactive)
- `-c, --category <category>`: Category (required unless using interactive)
- `-d, --date <YYYY-MM-DD>`: Date (defaults to today if omitted)
- `-n, --note <note>`: Optional note/description
- `--currency <currency>`: ISO currency code (default: `EUR`)
- `-i, --interactive`: Prompt for values (you can also just run `ledgerline add`)

Examples:
```bash
# Minimal via interactive prompts
npx ledgerline add

# Fully specified via flags
npx ledgerline add --amount 45.00 --category Transport --date 2025-08-07 --note "Airport bus" --currency EUR

# Let date default to today
npx ledgerline add -a 3.40 -c Groceries --note "Milk"
```

### list
List expenses with optional filters and outputs.

Options:
- `-c, --category <category>`: Filter by category (case-insensitive)
- `--since <YYYY-MM-DD>`: Start date inclusive
- `--until <YYYY-MM-DD>`: End date inclusive
- `-l, --limit <n>`: Limit the number of results (most recent)
- `--json`: Output raw JSON instead of pretty text

Examples:
```bash
# All expenses (pretty)
npx ledgerline list

# Filter by category
npx ledgerline list --category Food

# Filter by date range
npx ledgerline list --since 2025-08-01 --until 2025-08-31

# Last 10 expenses
npx ledgerline list --limit 10

# Combine filters
npx ledgerline list --category Transport --since 2025-07-01 --until 2025-07-31 --limit 20

# JSON output, then post-process with jq
npx ledgerline list --json | jq '. | map({date, amount, category})'
```

### path
Show the data file path.

```bash
npx ledgerline path
```

## Data format

Data is stored at `~/.ledgerline/expenses.json` as a flat array:
```json
[
  {
    "id": "a1B2c3D4e5",
    "amount": 12.5,
    "currency": "EUR",
    "category": "Food",
    "date": "2025-08-07",
    "note": "Lunch",
    "createdAt": "2025-08-07T12:34:56.789Z"
  }
]
```

- `date` is in `YYYY-MM-DD` format.
- `createdAt` is an ISO timestamp for when the entry was recorded.


## License
MIT
