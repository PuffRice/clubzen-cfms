import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { useState } from "react";

export function ManageCategories() {
  const [expenseCategories, setExpenseCategories] = useState([
    { id: 1, name: "Groceries", count: 24, color: "#3B82F6" },
    { id: 2, name: "Transportation", count: 18, color: "#10B981" },
    { id: 3, name: "Utilities", count: 12, color: "#F59E0B" },
    { id: 4, name: "Entertainment", count: 15, color: "#EF4444" },
    { id: 5, name: "Healthcare", count: 8, color: "#8B5CF6" },
    { id: 6, name: "Dining", count: 22, color: "#EC4899" },
  ]);

  const [incomeCategories, setIncomeCategories] = useState([
    { id: 1, name: "Salary", count: 12, color: "#059669" },
    { id: 2, name: "Freelance", count: 8, color: "#0EA5E9" },
    { id: 3, name: "Investment", count: 5, color: "#8B5CF6" },
    { id: 4, name: "Business", count: 3, color: "#F59E0B" },
  ]);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
        <p className="text-gray-500 mt-1">Organize and customize your transaction categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Categories */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-red-600" />
                  Expense Categories
                </CardTitle>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {category.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Categories */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-green-600" />
                  Income Categories
                </CardTitle>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {category.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Usage Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Category Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Total Categories</p>
              <p className="text-3xl font-bold text-blue-700">
                {expenseCategories.length + incomeCategories.length}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 mb-1">Expense Categories</p>
              <p className="text-3xl font-bold text-red-700">
                {expenseCategories.length}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Income Categories</p>
              <p className="text-3xl font-bold text-green-700">
                {incomeCategories.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
