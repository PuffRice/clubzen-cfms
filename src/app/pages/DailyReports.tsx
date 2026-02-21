import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";
import { reportController, transactionController } from "../services";

export function DailyReports() {
  const [dailySummary, setDailySummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netChange: 0,
    transactionCount: 0,
  });
  const [dailyTransactions, setDailyTransactions] = useState<
    { id: string; time: string; type: string; category: string; amount: number; method: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allTransactions = await transactionController.getAllTransactions();

        const txList = allTransactions
          .slice()
          .reverse()
          .map((t) => ({
            id: t.id,
            time: t.date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
            type: t.type,
            category: t.category,
            amount: t.amount,
            method: "Supabase",
          }));
        setDailyTransactions(txList);

        const totalIncome = allTransactions
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + t.amount, 0);
        const totalExpenses = allTransactions
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0);

        setDailySummary({
          totalIncome,
          totalExpenses,
          netChange: totalIncome - totalExpenses,
          transactionCount: allTransactions.length,
        });
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
          <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
          <p className="text-gray-500 mt-1">Track your daily financial activities</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Download className="h-4 w-4 mr-2" />
          Export Daily Report
        </Button>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="sm">Yesterday</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Income Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-600">
                +${dailySummary.totalIncome.toFixed(2)}
              </p>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Expenses Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">
                -${dailySummary.totalExpenses.toFixed(2)}
              </p>
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Net Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-blue-600">
                +${dailySummary.netChange.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-900">
                {dailySummary.transactionCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    {transaction.type === "income" ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{transaction.category}</h4>
                    <span
                      className={`font-bold text-lg ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{transaction.time}</span>
                    <span>•</span>
                    <span>{transaction.method}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
