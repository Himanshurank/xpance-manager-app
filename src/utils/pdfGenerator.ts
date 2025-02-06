import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Expense } from "../types/types";
import { formatDate } from "./dateUtils";

export const generateAnalyticsReport = async (
  timeRange: string,
  totalSpending: number,
  averageSpending: number,
  categoryData: any[],
  expenses: Expense[],
  userName: string,
  userEmail: string
) => {
  // Generate chart data
  const chartData = categoryData.map((cat) => ({
    label: cat.name,
    value: ((cat.amount / totalSpending) * 100).toFixed(1),
    color: cat.color,
  }));

  const pieChartSVG = `
    <svg width="300" height="300" viewBox="0 0 300 300">
      <g transform="translate(150,150)">
        ${generatePieChartPaths(chartData)}
      </g>
    </svg>
  `;

  const categoryRows = categoryData
    .map(
      (cat) => `
      <tr style="background-color: ${cat.color}15;">
        <td>
          <div style="display: flex; align-items: center;">
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 2px;
              background-color: ${cat.color};
              margin-right: 8px;
            "></div>
            ${cat.name}
          </div>
        </td>
        <td class="amount-cell">₹${cat.amount.toFixed(2)}</td>
        <td class="amount-cell">${((cat.amount / totalSpending) * 100).toFixed(
          1
        )}%</td>
      </tr>
    `
    )
    .join("");

  const expenseRows = expenses
    .map(
      (expense) => `
      <tr style="background-color: ${expense.category.color}15;">
        <td class="date-cell">${formatDate(expense.created_at)}</td>
        <td>${expense.description}</td>
        <td>
          <div style="display: flex; align-items: center;">
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 2px;
              background-color: ${expense.category.color};
              margin-right: 8px;
            "></div>
            ${expense.category.name}
          </div>
        </td>
        <td class="amount-cell">₹${expense.amount.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
            color: #1a1a1a;
          }
          h1 { 
            color: #1a73e8; 
            font-size: 28px;
            margin-bottom: 30px;
            text-align: center;
          }
          h2 { 
            color: #1a1a1a; 
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
          }
          .summary { 
            margin: 25px 0; 
            padding: 25px;
            background: #f8f9fa; 
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .summary p {
            margin: 12px 0;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            max-width: 300px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          th { 
            background: #1a73e8; 
            color: white; 
            padding: 12px 15px; 
            text-align: left;
            font-weight: 500;
          }
          td {
            padding: 12px 15px;
            border: 1px solid #eee;
          }
          tr:nth-child(even) { background: #f8f9fa; }
          .user-info { 
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #eee;
            margin-bottom: 30px;
          }
          .user-info p {
            margin: 8px 0;
            color: #666;
            font-size: 15px;
          }
          .chart-container { 
            text-align: center; 
            margin: 30px 0;
            padding: 20px;
            background: #fff;
            border-radius: 12px;
            border: 1px solid #eee;
          }
          .legend { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 15px; 
            margin: 20px 0;
            justify-content: center;
          }
          .legend-item { 
            display: flex; 
            align-items: center;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 20px;
          }
          .legend-color { 
            width: 12px; 
            height: 12px; 
            margin-right: 8px; 
            border-radius: 2px;
          }
          .amount-cell {
            text-align: right;
            font-family: monospace;
            font-size: 14px;
          }
          .date-cell {
            white-space: nowrap;
            color: #666;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .report-meta {
            text-align: right;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header-row">
          <h1>Expense Analytics Report</h1>
          <div class="report-meta">
            Generated on: ${formatDate(new Date())}
          </div>
        </div>

        <div class="user-info">
          <p><strong>Generated for:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Time Range:</strong> ${timeRange}</p>
        </div>
        
        <div class="summary">
          <h2 style="margin-top: 0;">Summary</h2>
          <p><span>Total Spending:</span> <strong>₹${totalSpending.toFixed(
            2
          )}</strong></p>
          <p><span>Average Spending:</span> <strong>₹${averageSpending.toFixed(
            2
          )}</strong></p>
        </div>

        <h2>Spending Distribution</h2>
        <div class="chart-container">
          ${pieChartSVG}
          
        </div>

        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right">Amount</th>
              <th style="text-align: right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>

        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th style="text-align: right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    await Sharing.shareAsync(uri);
    return uri;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Helper function to generate pie chart SVG paths
function generatePieChartPaths(data: { value: string; color: string }[]) {
  let total = data.reduce((sum, item) => sum + parseFloat(item.value), 0);
  let currentAngle = 0;

  return data
    .map((item) => {
      const percentage = parseFloat(item.value);
      const angle = (percentage / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const x1 = Math.cos((startAngle * Math.PI) / 180) * 100;
      const y1 = Math.sin((startAngle * Math.PI) / 180) * 100;
      const x2 = Math.cos((currentAngle * Math.PI) / 180) * 100;
      const y2 = Math.sin((currentAngle * Math.PI) / 180) * 100;

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "L 0 0",
        "Z",
      ].join(" ");

      return `<path d="${pathData}" fill="${item.color}" />`;
    })
    .join("");
}
