import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Home,
  Utensils,
  Car,
  Sparkles,
  Receipt,
  FileText,
  Plus,
} from "lucide-react";

export function Dashboard() {
  const transactions = [
    {
      id: 1,
      name: "Grocery Store",
      category: "Food",
      date: "2026-02-08",
      amount: -125.50,
      icon: ShoppingCart,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      id: 2,
      name: "Salary Deposit",
      category: "Salary",
      date: "2026-02-07",
      amount: 5000.00,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: 3,
      name: "Rent Payment",
      category: "Housing",
      date: "2026-02-01",
      amount: -1200.00,
      icon: Home,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      id: 4,
      name: "Gas Station",
      category: "Transport",
      date: "2026-02-07",
      amount: -45.00,
      icon: Car,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      id: 5,
      name: "Restaurant",
      category: "Food",
      date: "2026-02-09",
      amount: -85.00,
      icon: Utensils,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  const expenseBreakdown = [
    { name: "Housing", value: 35, color: "#3B82F6" },
    { name: "Food", value: 24, color: "#10B981" },
    { name: "Transport", value: 13, color: "#F59E0B" },
    { name: "Entertainment", value: 9, color: "#A855F7" },
    { name: "Utilities", value: 7, color: "#EF4444" },
    { name: "Others", value: 12, color: "#6B7280" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, John! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your financial overview for February 2026
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Balance Card - Large Blue Gradient */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-0 text-white">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 mb-2">Current Balance</p>
                  <h2 className="text-5xl font-bold mb-2">$71K</h2>
                  <p className="text-blue-100">Available balance</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Income</p>
                    <p className="font-bold text-gray-900">$125K</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <p className="font-bold text-gray-900">$54K</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Net Savings</p>
                    <p className="font-bold text-gray-900">$71K</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white justify-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Expense
          </Button>
          <Button className="h-14 bg-green-600 hover:bg-green-700 text-white justify-center">
            <Receipt className="h-5 w-5 mr-2" />
            Add Receipt
          </Button>
          <Button className="h-14 bg-purple-600 hover:bg-purple-700 text-white justify-center">
            <FileText className="h-5 w-5 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg ${transaction.iconBg} flex items-center justify-center`}
                    >
                      <transaction.icon
                        className={`h-5 w-5 ${transaction.iconColor}`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {transaction.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {expenseBreakdown.reduce((acc, item, index) => {
                    const total = expenseBreakdown.reduce(
                      (sum, i) => sum + i.value,
                      0
                    );
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const prevAngles = expenseBreakdown
                      .slice(0, index)
                      .reduce((sum, i) => sum + (i.value / total) * 360, 0);

                    const startAngle = prevAngles;
                    const endAngle = prevAngles + angle;

                    const x1 =
                      100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 =
                      100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

                    const largeArc = angle > 180 ? 1 : 0;

                    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    acc.push(
                      <path key={item.name} d={path} fill={item.color} />
                    );
                    return acc;
                  }, [] as JSX.Element[])}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">100%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
