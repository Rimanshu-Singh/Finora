import { getUserLedgerData } from "./lib/data/user-ledger";

async function main() {
  const data = await getUserLedgerData();
  console.log("getUserLedgerData returned:");
  console.log("- expenses count:", data.expenses.length);
  if (data.expenses.length > 0) {
    console.log("- first expense:", data.expenses[0]);
  }
  console.log("- user settings name:", data.settings.name);
}

main();
