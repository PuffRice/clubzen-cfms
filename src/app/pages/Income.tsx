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
import { IncomeForm } from "../components/IncomeForm";
import { transactionController } from "../services";
import { IncomeTransaction } from "../../domain";

export function Income() {
  const [open, setOpen] = useState(false);
  const [incomeItems, setIncomeItems] = useState<IncomeTransaction[]>([]);

  const loadIncomes = async () => {
    try {
      const all = await transactionController.getAllTransactions();
      setIncomeItems(all.filter((tx) => tx.type === "income") as IncomeTransaction[]);
    } catch (err) {
      console.error("Failed to load incomes", err);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income</h1>
          <p className="text-muted-foreground mt-1">Track your income sources</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Income</DialogTitle>
            </DialogHeader>
            <IncomeForm
              onSuccess={() => {
                setOpen(false);
                loadIncomes();
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {incomeItems.map((income) => (
                  <tr key={income.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{income.source}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      +${income.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {income.date.toISOString().split("T")[0]}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          income.incomeType === "Recurring"
                            ? "bg-blue-100 text-blue-700"
                            : income.incomeType === "Investment"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {income.incomeType || "-"}
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
