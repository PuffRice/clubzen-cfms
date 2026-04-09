import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, ArrowDown10, ArrowUp10, ArrowDownNarrowWide, ArrowUpNarrowWide, Edit2, ChevronDown } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { IncomeForm } from "../components/IncomeForm";
import { transactionController } from "../services";
import { useCurrency } from "../CurrencyContext";
import { IncomeTransaction } from "../../domain";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export function Income() {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);
  const [incomeItems, setIncomeItems] = useState<IncomeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
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

  const sortedIncomes = useMemo(() => {
    const copy = [...incomeItems];
    switch (sortBy) {
      case "date-asc":
        return copy.sort((a, b) => a.date.getTime() - b.date.getTime());
      case "date-desc":
        return copy.sort((a, b) => b.date.getTime() - a.date.getTime());
      case "amount-asc":
        return copy.sort((a, b) => a.amount - b.amount);
      case "amount-desc":
        return copy.sort((a, b) => b.amount - a.amount);
      default:
        return copy;
    }
  }, [incomeItems, sortBy]);

  const sortLabel: Record<SortOption, string> = {
    "date-desc": "Date: New to Old",
    "date-asc": "Date: Old to New",
    "amount-desc": "Amount: High to Low",
    "amount-asc": "Amount: Low to High",
  };

  const sortIcon: Record<SortOption, React.ReactNode> = {
    "date-desc": <ArrowDown10 className="h-3.5 w-3.5 shrink-0" />,
    "date-asc": <ArrowUp10 className="h-3.5 w-3.5 shrink-0" />,
    "amount-desc": <ArrowDownNarrowWide className="h-3.5 w-3.5 shrink-0" />,
    "amount-asc": <ArrowUpNarrowWide className="h-3.5 w-3.5 shrink-0" />,
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
            <Button className="bg-green-600 hover:bg-green-700 h-10">
              <Plus className="h-4 w-4" />
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

      {/* Sort */}
      <div className="mb-6 flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 w-56 px-4 py-2 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 outline-none" title="Sort income">
            {sortIcon[sortBy]}
            {sortLabel[sortBy]}
            <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={`whitespace-nowrap cursor-pointer ${sortBy === "date-desc" ? "bg-accent text-accent-foreground" : ""}`} onSelect={() => setSortBy("date-desc")}>
              <ArrowDown10 className="h-3.5 w-3.5 shrink-0" /> Date: New to Old
            </DropdownMenuItem>
            <DropdownMenuItem className={`whitespace-nowrap cursor-pointer ${sortBy === "date-asc" ? "bg-accent text-accent-foreground" : ""}`} onSelect={() => setSortBy("date-asc")}>
              <ArrowUp10 className="h-3.5 w-3.5 shrink-0" /> Date: Old to New
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={`whitespace-nowrap cursor-pointer ${sortBy === "amount-desc" ? "bg-accent text-accent-foreground" : ""}`} onSelect={() => setSortBy("amount-desc")}>
              <ArrowDownNarrowWide className="h-3.5 w-3.5 shrink-0" /> Amount: High to Low
            </DropdownMenuItem>
            <DropdownMenuItem className={`whitespace-nowrap cursor-pointer ${sortBy === "amount-asc" ? "bg-accent text-accent-foreground" : ""}`} onSelect={() => setSortBy("amount-asc")}>
              <ArrowUpNarrowWide className="h-3.5 w-3.5 shrink-0" /> Amount: Low to High
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                ) : sortedIncomes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No incomes available.
                    </td>
                  </tr>
                ) : (
                  sortedIncomes.map((income) => {
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