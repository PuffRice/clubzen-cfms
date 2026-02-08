import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Filter } from "lucide-react";

export function Income() {
  const incomeItems = [
    { id: 1, source: "Salary", amount: 5000.00, date: "Feb 5, 2026", type: "Recurring" },
    { id: 2, source: "Freelance Project", amount: 1500.00, date: "Feb 1, 2026", type: "One-time" },
    { id: 3, source: "Dividends", amount: 250.00, date: "Jan 25, 2026", type: "Investment" },
    { id: 4, source: "Bonus", amount: 2000.00, date: "Jan 20, 2026", type: "One-time" },
    { id: 5, source: "Rental Income", amount: 1200.00, date: "Jan 15, 2026", type: "Recurring" },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-500 mt-1">Track your income sources</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>All Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {incomeItems.map((income) => (
                  <tr key={income.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{income.source}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      +${income.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{income.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          income.type === "Recurring"
                            ? "bg-blue-100 text-blue-700"
                            : income.type === "Investment"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {income.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
