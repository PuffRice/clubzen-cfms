import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";

export function DailyReports() {
  const currentDate = "February 8, 2026";
  
  const dailyTransactions = [
    { id: 1, time: "09:30 AM", type: "expense", category: "Coffee Shop", amount: 5.50, method: "Credit Card" },
    { id: 2, time: "12:15 PM", type: "expense", category: "Lunch", amount: 18.75, method: "Cash" },
    { id: 3, time: "02:45 PM", type: "income", category: "Freelance Payment", amount: 500.00, method: "Bank Transfer" },
    { id: 4, time: "05:20 PM", type: "expense", category: "Gas", amount: 45.00, method: "Debit Card" },
    { id: 5, time: "07:00 PM", type: "expense", category: "Dinner", amount: 32.50, method: "Credit Card" },
  ];

  const dailySummary = {
    totalIncome: 500.00,
    totalExpenses: 101.75,
    netChange: 398.25,
    transactionCount: 5,
  };

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
          <CardTitle>Transaction Timeline - {currentDate}</CardTitle>
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
