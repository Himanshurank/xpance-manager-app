import { TimeRange } from "../components/analytics/TimeRangeSelector";

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

export function getFilteredExpenses(
  allExpenses: any[],
  selectedRange: TimeRange
) {
  const now = new Date();
  return allExpenses.filter((expense) => {
    const expenseDate = new Date(expense.created_at);
    switch (selectedRange) {
      case "Week":
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return expenseDate >= weekAgo;
      case "Month":
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      case "Year":
        return expenseDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
}

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
