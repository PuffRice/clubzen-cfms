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
import { IncomeForm } from "../components/IncomeForm";
import { transactionController } from "../services";
import { useCurrency } from "../CurrencyContext";

export function Income() {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [incomeItems, setIncomeItems] = useState<any[]>([]);

  const loadIncomes = async () => {
    try {
      const all = await transactionController.getAllTransactions();

      const filtered = (all || []).filter(
        (tx: any) => tx?.type === "income"
      );

      setIncomeItems(filtered);
    } catch (err) {
      console.error("Failed to load incomes", err);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income</h1>
          <p className="text-muted-foreground mt-1">
            Track your income sources
          </p>
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
          <CardTitle>All Income</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Source</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Type</th>
                </tr>
              </thead>

              <tbody>
                {incomeItems.map((income, index) => {
                  let formattedDate = "-";

                  try {
                    if (income?.date) {
                      formattedDate = new Date(income.date)
                        .toISOString()
                        .split("T")[0];
                    }
                  } catch {
                    formattedDate = "-";
                  }

                  return (
                    <tr
                      key={income?.id || index}
                      className="border-b hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {income?.source || "-"}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {income?.description || "-"}
                      </td>

                      <td className="py-3 px-4 font-semibold text-green-600">
                        +{symbol}
                        {(income?.amount ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {formattedDate}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            income?.payment_method === "Recurring"
                              ? "bg-blue-100 text-blue-700"
                              : income?.payment_method === "Investment"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {income?.payment_method || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {incomeItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No income found
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