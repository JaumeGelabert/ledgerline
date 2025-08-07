#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { nanoid } from "nanoid";
import { loadExpenses, saveExpenses, getDataFilePath } from "./storage.js";
import type { Expense } from "./types.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command();

program
  .name("ledgerline")
  .description("Track expenses in a local JSON store")
  .version(pkg.version)
  .showHelpAfterError()
  .addHelpText(
    "afterAll",
    `
List filters (for 'list' command):
  -c, --category <category>  Filter by category
  --since <YYYY-MM-DD>       Start date inclusive
  --until <YYYY-MM-DD>       End date inclusive
  -l, --limit <n>            Limit number of results
  --json                     Output raw JSON

Examples:
  ledgerline add
  ledgerline add --amount 12.5 --category Food --date 2025-08-07 --note "Lunch"
  ledgerline list --category Food --since 2025-08-01 --until 2025-08-31
`
  );

program
  .command("add")
  .description("Add a new expense")
  .option("-a, --amount <number>", "Amount", (v: string) => parseFloat(v))
  .option("-c, --category <category>", "Category")
  .option("-d, --date <YYYY-MM-DD>", "Date in YYYY-MM-DD")
  .option("-n, --note <note>", "Note")
  .option("--currency <currency>", "Currency (ISO code)", "EUR")
  .option("-i, --interactive", "Prompt for values", false)
  .action(
    async (opts: {
      amount?: number;
      category?: string;
      date?: string;
      note?: string;
      currency?: string;
      interactive?: boolean;
    }) => {
      const shouldPrompt =
        opts.interactive || opts.amount == null || !opts.category || !opts.date;

      let amount: number | undefined = opts.amount;
      let category: string | undefined = opts.category;
      let date: string | undefined = opts.date;
      let note: string | undefined = opts.note;
      let currency: string | undefined = opts.currency;

      if (shouldPrompt) {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "amount",
            message: "Amount",
            when: () => amount == null,
            validate: (v: string) =>
              isNaN(parseFloat(v)) ? "Enter a number" : true,
            filter: (v: string) => parseFloat(v)
          },
          {
            type: "list",
            name: "category",
            message: "Category",
            when: () => !category,
            choices: [
              "Food",
              "Transport",
              "Groceries",
              "Utilities",
              "Rent",
              "Entertainment",
              "Health",
              "Shopping",
              "Travel",
              "Other"
            ],
            default: "Other"
          },
          {
            type: "input",
            name: "date",
            message: "Date (YYYY-MM-DD)",
            when: () => !date,
            default: new Date().toISOString().slice(0, 10),
            validate: (v: string) =>
              /^\d{4}-\d{2}-\d{2}$/.test(v) ? true : "Use YYYY-MM-DD"
          },
          {
            type: "input",
            name: "note",
            message: "Note (optional)",
            when: () => !note
          },
          {
            type: "input",
            name: "currency",
            message: "Currency (ISO)",
            when: () => !currency,
            default: "EUR"
          }
        ] as const);

        amount = amount ?? (answers as any).amount;
        category = category ?? (answers as any).category;
        date = date ?? (answers as any).date;
        note = note ?? (answers as any).note;
        currency = currency ?? (answers as any).currency;
      }

      if (typeof amount !== "number" || isNaN(amount)) {
        console.error(
          chalk.red(
            "Amount is required. Use --amount or run with --interactive."
          )
        );
        process.exit(1);
      }
      if (!category) {
        console.error(
          chalk.red(
            "Category is required. Use --category or run with --interactive."
          )
        );
        process.exit(1);
      }
      if (!date) {
        date = new Date().toISOString().slice(0, 10);
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.error(chalk.red("Date must be in YYYY-MM-DD"));
        process.exit(1);
      }

      const expense: Expense = {
        id: nanoid(10),
        amount,
        currency: currency || "EUR",
        category,
        date,
        note: note || undefined,
        createdAt: new Date().toISOString()
      };

      const expenses = await loadExpenses();
      expenses.push(expense);
      await saveExpenses(expenses);

      console.log(
        chalk.green("Saved expense:"),
        chalk.bold(expense.currency),
        expense.amount.toFixed(2),
        chalk.gray(`(${expense.category} on ${expense.date})`),
        expense.note ? `- ${expense.note}` : ""
      );
      console.log(chalk.gray(`Data file: ${getDataFilePath()}`));
    }
  );

program
  .command("list")
  .description("List expenses")
  .option("-c, --category <category>", "Filter by category")
  .option("--since <YYYY-MM-DD>", "Start date inclusive")
  .option("--until <YYYY-MM-DD>", "End date inclusive")
  .option("-l, --limit <n>", "Limit number", (v: string) => parseInt(v, 10))
  .option("--json", "Output raw JSON", false)
  .action(
    async (opts: {
      category?: string;
      since?: string;
      until?: string;
      limit?: number;
      json?: boolean;
    }) => {
      let expenses: Expense[] = await loadExpenses();

      if (opts.category) {
        const categoryLower = String(opts.category).toLowerCase();
        expenses = expenses.filter(
          (e: Expense) => e.category.toLowerCase() === categoryLower
        );
      }

      const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

      if (opts.since) {
        if (!validDate(opts.since)) {
          console.error(chalk.red("since must be YYYY-MM-DD"));
          process.exit(1);
        }
        expenses = expenses.filter(
          (e: Expense) => e.date >= (opts.since as string)
        );
      }

      if (opts.until) {
        if (!validDate(opts.until)) {
          console.error(chalk.red("until must be YYYY-MM-DD"));
          process.exit(1);
        }
        expenses = expenses.filter(
          (e: Expense) => e.date <= (opts.until as string)
        );
      }

      expenses.sort(
        (a: Expense, b: Expense) =>
          a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
      );

      if (opts.limit && Number.isFinite(opts.limit)) {
        expenses = expenses.slice(-opts.limit);
      }

      if (opts.json) {
        console.log(JSON.stringify(expenses, null, 2));
        return;
      }

      if (expenses.length === 0) {
        console.log(chalk.yellow("No expenses found."));
        return;
      }

      const rows = expenses.map((e: Expense) => {
        return `${chalk.gray(e.date)}  ${chalk.bold(e.currency)} ${e.amount
          .toFixed(2)
          .padStart(8)}  ${chalk.cyan(e.category.padEnd(14))} ${
          e.note ? e.note : ""
        }`;
      });

      console.log(rows.join("\n"));
      const total = expenses.reduce(
        (sum: number, e: Expense) => sum + e.amount,
        0
      );
      console.log(
        chalk.gray(
          `\nTotal: ${total.toFixed(2)} (mixed currencies may be summed as-is)`
        )
      );
    }
  );

program
  .command("path")
  .description("Show the data file path")
  .action(() => {
    console.log(getDataFilePath());
  });

program.parseAsync(process.argv);
