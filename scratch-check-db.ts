import { prisma } from "./lib/db/prisma";
import { getUserLedgerData } from "./lib/data/user-ledger";

async function inspectNeonDatabase() {
  console.log("==================================================");
  console.log("🔍 FETCHING DATA DIRECTLY FROM NEON POSTGRESQL");
  console.log("==================================================\n");

  // 1. Users table
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log(`👤 USERS TABLE (${users.length} records):`);
  console.dir(users, { depth: null });
  console.log("\n--------------------------------------------------");

  // 2. Expenses table
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      user: { select: { id: true, email: true, clerkId: true, firstName: true } },
    },
  });
  console.log(`💳 EXPENSES TABLE (${expenses.length} records):`);
  console.dir(
    expenses.map((e) => ({
      id: e.id,
      userId: e.userId,
      userEmail: e.user?.email,
      userClerkId: e.user?.clerkId,
      amount: Number(e.amount),
      merchant: e.merchant,
      description: e.description,
      category: e.category?.name ?? e.categoryId,
      date: e.date,
      time: e.time,
      paymentMethod: e.paymentMethod,
      isRecurring: e.isRecurring,
      split: e.split,
      tags: e.tags,
      note: e.note,
      location: e.location,
      createdAt: e.createdAt,
    })),
    { depth: null }
  );
  console.log("\n--------------------------------------------------");

  // 3. Budgets table
  const budgets = await prisma.budget.findMany({
    include: {
      category: { select: { id: true, name: true } },
      user: { select: { id: true, email: true } },
    },
  });
  console.log(`📊 BUDGETS TABLE (${budgets.length} records):`);
  console.dir(
    budgets.map((b) => ({
      id: b.id,
      userId: b.userId,
      userEmail: b.user?.email,
      category: b.category?.name ?? "Overall",
      limit: Number(b.limit),
      period: b.period,
      carry: b.carry,
    })),
    { depth: null }
  );
  console.log("\n--------------------------------------------------");

  // 4. Recurring Expenses table
  const recurring = await prisma.recurringExpense.findMany({
    include: {
      user: { select: { id: true, email: true } },
    },
  });
  console.log(`🔁 RECURRING EXPENSES TABLE (${recurring.length} records):`);
  console.dir(
    recurring.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      amount: Number(r.amount),
      categoryId: r.categoryId,
      frequency: r.frequency,
      nextDate: r.nextDate,
      active: r.active,
    })),
    { depth: null }
  );
  console.log("\n--------------------------------------------------");

  // 5. App Data via getUserLedgerData()
  console.log("📦 DATA AS RETURNED BY getUserLedgerData():");
  const appData = await getUserLedgerData();
  console.log({
    expensesCount: appData.expenses.length,
    budgetsCount: appData.budgets.length,
    recurringCount: appData.recurring.length,
    categoriesCount: appData.categories.length,
    settingsName: appData.settings.name,
    expensesSummary: appData.expenses.map((e) => ({
      id: e.id,
      merchant: e.merchant,
      amount: e.amount,
      date: e.date,
      category: e.categoryId,
    })),
  });
  console.log("\n==================================================");
}

inspectNeonDatabase()
  .catch((err) => {
    console.error("❌ Error querying database:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
