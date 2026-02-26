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
  const [incomeBreakdown, setIncomeBreakdown] = useState<
    { category: string; amount: number }[]
  >([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<
    { category: string; amount: number }[]
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

        // Build income breakdown from live income data
        const incomes = allTx.filter((t) => t.type === "income");
        const incomeMap = new Map<string, number>();
        for (const t of incomes) {
          incomeMap.set(t.category, (incomeMap.get(t.category) ?? 0) + t.amount);
        }
        const incomeBreakdownData = [...incomeMap.entries()]
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount);
        setIncomeBreakdown(incomeBreakdownData);

        // Build expense breakdown from live expense data
        const expenses = allTx.filter((t) => t.type === "expense");
        const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
        const expenseMap = new Map<string, number>();
        for (const t of expenses) {
          expenseMap.set(t.category, (expenseMap.get(t.category) ?? 0) + t.amount);
        }
        const expenseBreakdownData = [...expenseMap.entries()]
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount);
        setExpenseBreakdown(expenseBreakdownData);

        // Build category breakdown with percentages (for bar chart)
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
          <h1 className="text-3xl font-bold text-foreground">Monthly Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive monthly financial analysis</p>
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
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <select className="px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-600">
                Tk.{monthlyData.totalIncome.toLocaleString()}
              </p>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">
                Tk.{monthlyData.totalExpenses.toLocaleString()}
              </p>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-blue-600">
                Tk.{monthlyData.netSavings.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
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
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Income Section */}
              <div>
                <h3 className="font-semibold text-green-600 mb-3">Income</h3>
                <div className="space-y-2 ml-2">
                  {incomeBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No income yet</p>
                  ) : (
                    <>
                      {incomeBreakdown.map((item) => (
                        <div key={item.category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.category}</span>
                          <span className="font-medium text-green-600">
                            +Tk.{item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold text-green-600">
                          +Tk.{incomeBreakdown.reduce((s, i) => s + i.amount, 0).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Expense Section */}
              <div>
                <h3 className="font-semibold text-red-600 mb-3">Expense</h3>
                <div className="space-y-2 ml-2">
                  {expenseBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No expenses yet</p>
                  ) : (
                    <>
                      {expenseBreakdown.map((item) => (
                        <div key={item.category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.category}</span>
                          <span className="font-medium text-red-600">
                            -Tk.{item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold text-red-600">
                          -Tk.{expenseBreakdown.reduce((s, i) => s + i.amount, 0).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Net Profit/Loss */}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Net Profit/Loss</span>
                  <span
                    className={`font-bold text-lg ${
                      monthlyData.netSavings >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {monthlyData.netSavings >= 0 ? "+" : ""}
                    Tk.{monthlyData.netSavings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-800/20 border border-green-600 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-2">Great Progress! 🎉</h4>
                <p className="text-sm text-green-300">
                  You saved 53.7% of your income this month. That's above your target of 50%.
                </p>
              </div>
              <div className="p-4 bg-blue-800/20 border border-blue-600 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">Top Spending Category</h4>
                <p className="text-sm text-blue-300">
                  Groceries accounted for 28% of your total expenses. Consider meal planning to reduce costs.
                </p>
              </div>
              <div className="p-4 bg-purple-800/20 border border-purple-600 rounded-lg">
                <h4 className="font-semibold text-purple-300 mb-2">Budget Status</h4>
                <p className="text-sm text-purple-300">
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
