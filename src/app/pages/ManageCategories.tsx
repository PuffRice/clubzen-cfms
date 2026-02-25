import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Plus, Pencil, Trash2, FolderTree, X } from "lucide-react";
import { useEffect, useState } from "react";
import { categoryController } from "../services";

interface Category {
  id: number;
  name: string;
  count: number;
  color: string;
}

export function ManageCategories() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);

  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);

  const [editingCategory, setEditingCategory] = useState<{
    category: Category;
    type: "expense" | "income";
  } | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    color: "",
  });

  const [addingCategory, setAddingCategory] = useState<"expense" | "income" | null>(
    null
  );

  const [addForm, setAddForm] = useState({
    name: "",
    color: "#3B82F6",
  });

  const colorOptions = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#059669",
    "#0EA5E9",
    "#F97316",
    "#14B8A6",
  ];

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryController.getCategories();
        if (res.statusCode === 200 && Array.isArray(res.body)) {
          const expenses = (res.body as any[]).filter((c) => c.type === "Expense");
          const incomes = (res.body as any[]).filter((c) => c.type === "Income");

          setExpenseCategories(
            expenses.map((c) => ({
              id: Number(c.id),
              name: c.name as string,
              color: (c.color as string) || "#3B82F6",
              count: 0,
            }))
          );

          setIncomeCategories(
            incomes.map((c) => ({
              id: Number(c.id),
              name: c.name as string,
              color: (c.color as string) || "#059669",
              count: 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }

    loadCategories();
  }, []);

  const handleEdit = (category: Category, type: "expense" | "income") => {
    setEditingCategory({ category, type });
    setEditForm({
      name: category.name,
      color: category.color,
    });
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    try {
      const res = await categoryController.updateCategory({
        params: { id: String(editingCategory.category.id) },
        body: {
          name: editForm.name,
          color: editForm.color,
        },
      });

      if (res.statusCode === 200) {
        if (editingCategory.type === "expense") {
          setExpenseCategories(
            expenseCategories.map((cat) =>
              cat.id === editingCategory.category.id
                ? { ...cat, name: editForm.name, color: editForm.color }
                : cat
            )
          );
        } else {
          setIncomeCategories(
            incomeCategories.map((cat) =>
              cat.id === editingCategory.category.id
                ? { ...cat, name: editForm.name, color: editForm.color }
                : cat
            )
          );
        }

        setEditingCategory(null);
      }
    } catch (err) {
      console.error("Failed to update category", err);
    }
  };

  const handleAdd = async () => {
    if (!addingCategory || !addForm.name.trim()) return;

    try {
      const type = addingCategory === "expense" ? "Expense" : "Income";
      const res = await categoryController.createCategory({
        body: {
          name: addForm.name.trim(),
          type,
          color: addForm.color,
        },
      });

      if (res.statusCode === 201 && res.body) {
        const created = res.body as any;
        const newCategory: Category = {
          id: Number(created.id),
          name: created.name as string,
          color: (created.color as string) || addForm.color,
          count: 0,
        };

        if (addingCategory === "expense") {
          setExpenseCategories([...expenseCategories, newCategory]);
        } else {
          setIncomeCategories([...incomeCategories, newCategory]);
        }

        setAddingCategory(null);
        setAddForm({ name: "", color: "#3B82F6" });
      }
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  const handleDelete = async (id: number, type: "expense" | "income") => {
    try {
      const res = await categoryController.deleteCategory({
        params: { id: String(id) },
      });

      if (res.statusCode === 200) {
        if (type === "expense") {
          setExpenseCategories(expenseCategories.filter((cat) => cat.id !== id));
        } else {
          setIncomeCategories(incomeCategories.filter((cat) => cat.id !== id));
        }
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  return (
    <div className="p-8 bg-background text-foreground">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <p className="text-muted-foreground mt-1">
          Organize and customize your transaction categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Categories */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-secondary-foreground" />
                  Expense Categories
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => setAddingCategory("expense")}
                >
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
                        className="h-10 w-10 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {category.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {category.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category, "expense")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
                        onClick={() => handleDelete(category.id, "expense")}
                      >
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
                  <FolderTree className="h-5 w-5 text-secondary-foreground" />
                  Income Categories
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => setAddingCategory("income")}
                >
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
                        className="h-10 w-10 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {category.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {category.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category, "income")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(category.id, "income")}
                      >
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

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* match add modal background/card styles for consistency */}
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                Edit Category
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingCategory(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <Label htmlFor="editCategoryName">Category Name</Label>
                <input
                  id="editCategoryName"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>

              {/* Color Selection */}
              <div>
                <Label>Category Color</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-12 w-12 rounded-lg transition-all ${
                        editForm.color === color
                          ? "ring-2 ring-offset-2 ring-primary scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditForm({ ...editForm, color })}
                    />
                  ))}
                </div>
              </div>

              {/* Transaction Count (Read-only) */}
              <div>
                <Label>Transactions</Label>
                <div className="mt-1 px-3 py-2 bg-card border border-border rounded-md text-muted-foreground">
                  {editingCategory.category.count} transactions
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                Add Category
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddingCategory(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <Label htmlFor="addCategoryName">Category Name</Label>
                <input
                  id="addCategoryName"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                />
              </div>

              {/* Color Selection */}
              <div>
                <Label>Category Color</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-12 w-12 rounded-lg transition-all ${
                        addForm.color === color
                          ? "ring-2 ring-offset-2 ring-primary scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setAddForm({ ...addForm, color })}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAdd}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAddingCategory(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
