import { ETimeRange } from "../types/Enums";

const pastelColors = [
  "#FFB3BA",
  "#BAFFC9",
  "#BAE1FF",
  "#FFFFBA",
  "#FFB3F7",
  "#E0BBE4",
  "#957DAD",
  "#FEC8D8",
  "#D4F0F0",
  "#FFDFD3",
];

export const getDateRangeFilter = (range: ETimeRange) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  startOfDay.setHours(0, 0, 0, 0); // Set to beginning of day

  switch (range) {
    case ETimeRange.Today:
      return {
        start: startOfDay,
        end: now,
      };
    case ETimeRange.Week:
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      return {
        start: weekStart,
        end: now,
      };
    case ETimeRange.Month:
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      return {
        start: monthStart,
        end: now,
      };
    case ETimeRange.Year:
      const yearStart = new Date(now.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);
      return {
        start: yearStart,
        end: now,
      };
    default:
      return {
        start: startOfDay,
        end: now,
      };
  }
};

export const getFilteredExpenses = (expenses: any[], range: ETimeRange) => {
  if (!expenses || expenses.length === 0) return [];

  const { start, end } = getDateRangeFilter(range);

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.created_at); // Make sure this matches your date field name
    return expenseDate >= start && expenseDate <= end;
  });
};

export function getCategoryData(expenses: any[]) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category.name;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals).map(([name, amount], index) => ({
    name,
    amount,
    color: pastelColors[index % pastelColors.length],
    legendFontColor: "#1a1a1a",
    legendFontSize: 12,
  }));
}
