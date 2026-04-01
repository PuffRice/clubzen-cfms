import { useState, useEffect } from "react";
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
import { useCurrency } from "../CurrencyContext";

export function Expenses() {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);

  const loadExpenses = async () => {
    try {
      const all = await transactionController.getAllTransactions();

      const filtered = (all || []).filter(
        (tx: any) => tx?.type === "expense"
      );

      setExpenses(filtered);
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your expenses
          </p>
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

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-card-navy/25 border-card-navy/40 border">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Payment Method</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense, index) => {
                  let formattedDate = "-";

                  try {
                    if (expense?.date) {
                      formattedDate = new Date(expense.date)
                        .toISOString()
                        .split("T")[0];
                    }
                  } catch {
                    formattedDate = "-";
                  }

                  return (
                    <tr
                      key={expense?.id || index}
                      className="border-b hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {expense?.category || "-"}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {expense?.description || "-"}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {expense?.payment_method || "-"}
                      </td>

                      <td className="py-3 px-4 font-semibold text-red-600">
                        {symbol}
                        {(expense?.amount ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}

                {expenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}