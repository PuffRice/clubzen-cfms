import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { ExpenseForm } from "../components/ExpenseForm";
import { transactionController } from "../services";
import { ExpenseTransaction } from "../../domain";

export function Expenses() {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);

  const loadExpenses = async () => {
    try {
      const all = await transactionController.getAllTransactions();
      setExpenses(all.filter((tx) => tx.type === "expense") as ExpenseTransaction[]);
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your expenses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSuccess={() => {
                setOpen(false);
                loadExpenses();
              }}
            />
            <DialogClose className="absolute top-2 right-2">
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment Method</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {expense.description || "-"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {expense.paymentMethod || "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-red-600">
                      Tk.{expense.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {expense.date.toISOString().split("T")[0]}
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
