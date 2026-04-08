import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Filter, Edit2 } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
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
import { IncomeTransaction } from "../../domain";

export function Income() {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);
  const [incomeItems, setIncomeItems] = useState<IncomeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const isAdmin = userRole === "Admin";

  const loadIncomes = async () => {
    setLoading(true);
    try {
      const all = await transactionController.getAllTransactions();

      const filtered = (all || []).filter(
        (tx: any) => tx?.type === "income"
      ) as IncomeTransaction[];

      setIncomeItems(filtered);
    } catch (err) {
      console.error("Failed to load incomes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (income: IncomeTransaction) => {
    setEditingIncome(income);
    setEditOpen(true);
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setEditingIncome(null);
    loadIncomes();
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))
                ) : incomeItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No incomes available.
                    </td>
                  </tr>
                ) : (
                  incomeItems.map((income) => {
                    return (
                    <tr key={income.id} className="border-b hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">{income.source}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {income.description || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        +{symbol}
                        {income.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {income.date.toISOString().split("T")[0]}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            income.payment_method === "Recurring"
                              ? "bg-blue-100 text-blue-700"
                              : income.payment_method === "Investment"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {income.payment_method || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!isAdmin}
                          onClick={() => handleEditClick(income)}
                          className={`gap-2 ${
                            isAdmin
                              ? "hover:bg-blue-600 hover:text-white cursor-pointer"
                              : "opacity-50 cursor-not-allowed text-gray-500"
                          }`}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                      </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Income Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <IncomeForm
              initialData={{
                amount: editingIncome.amount.toString(),
                source: editingIncome.source,
                date: editingIncome.date.toISOString().split("T")[0],
                description: editingIncome.description,
                paymentMethod: editingIncome.payment_method || "",
              }}
              isEditMode={true}
              editId={editingIncome.id}
              onSuccess={handleEditSuccess}
            />
          )}
          <DialogClose className="absolute top-2 right-2">
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}