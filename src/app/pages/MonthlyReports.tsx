import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Download, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { reportController, transactionController } from "../services";

export function MonthlyReports() {
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    savingsRate: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    { category: string; amount: number; percentage: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summary, allTx] = await Promise.all([
          reportController.getDashboardSummary(),
          transactionController.getAllTransactions(),
        ]);

        const totalIncome = summary.totalIncome;
        const totalExpenses = summary.totalExpense;
        const netSavings = summary.netProfitLoss;
        const savingsRate =
          totalIncome > 0
            ? Math.round((netSavings / totalIncome) * 100 * 10) / 10
            : 0;

        setMonthlyData({ totalIncome, totalExpenses, netSavings, savingsRate });

        // Build category breakdown from live expense data
        const expenses = allTx.filter((t) => t.type === "expense");
        const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
        const catMap = new Map<string, number>();
        for (const t of expenses) {
          catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
        }
        setCategoryBreakdown(
          [...catMap.entries()].map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
          })),
        );
      } catch (err) {
        console.error("MonthlyReports load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-gray-500 mt-1">Comprehensive monthly financial analysis</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                <option>February 2026</option>
                <option>January 2026</option>
                <option>December 2025</option>
                <option>November 2025</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-600">
                ${monthlyData.totalIncome.toLocaleString()}
              </p>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">
                ${monthlyData.totalExpenses.toLocaleString()}
              </p>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Net Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-blue-600">
                ${monthlyData.netSavings.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-purple-600">
                {monthlyData.savingsRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${item.amount.toFixed(2)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Great Progress! 🎉</h4>
                <p className="text-sm text-green-700">
                  You saved 53.7% of your income this month. That's above your target of 50%.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Top Spending Category</h4>
                <p className="text-sm text-blue-700">
                  Groceries accounted for 28% of your total expenses. Consider meal planning to reduce costs.
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Budget Status</h4>
                <p className="text-sm text-purple-700">
                  You're on track with your monthly budget. Keep up the good work!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
