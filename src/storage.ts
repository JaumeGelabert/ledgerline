import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import type { Expense } from "./types.js";

const dataDirectoryPath = path.join(os.homedir(), ".ledgerline");
const dataFilePath = path.join(dataDirectoryPath, "expenses.json");

export async function loadExpenses(): Promise<Expense[]> {
  const exists = await fs.pathExists(dataFilePath);
  if (!exists) return [];
  const raw = await fs.readFile(dataFilePath, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Expense[];
    if (parsed && Array.isArray((parsed as any).expenses))
      return (parsed as any).expenses as Expense[];
    return [];
  } catch {
    return [];
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await fs.ensureDir(dataDirectoryPath);
  await fs.writeFile(dataFilePath, JSON.stringify(expenses, null, 2), "utf-8");
}

export function getDataFilePath(): string {
  return dataFilePath;
}
