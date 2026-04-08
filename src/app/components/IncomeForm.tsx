import { useState, useEffect, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { TrendingUp, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { transactionController, categoryController } from "../services";
import { useCurrency } from "../CurrencyContext";

interface IncomeFormProps {
  onSuccess?: () => void;
  initialData?: {
    amount: string;
    source: string;
    date: string;
    description: string;
    paymentMethod: string;
  };
  isEditMode?: boolean;
  editId?: string;
}

export function IncomeForm({ onSuccess, initialData, isEditMode = false, editId }: IncomeFormProps) {
  const { symbol } = useCurrency();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    amount: initialData?.amount || "",
    source: initialData?.source || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    description: initialData?.description || "",
    paymentMethod: initialData?.paymentMethod || "",
  });

  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await categoryController.createCategories();
        if (res.statusCode === 200 && Array.isArray(res.body)) {
          const cats = (res.body as any[])
            .filter((c) => c.type === "Income")
            .map((c) => c.name as string);

          // Always include loan-related options in income sources as well
          const withLoanSources = Array.from(
            new Set([...cats, "Loan Taken", "Loan Given"]),
          );

          setSources(withLoanSources);
        }
      } catch (err) {
        console.error("Failed to load income sources", err);
      }
    }
    loadSources();
  }, []);

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "bKash",
    "Nagad"
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    try {
      if (isEditMode && editId) {
        await transactionController.updateTransaction(
          editId,
          Number(formData.amount),
          new Date(formData.date),
          formData.source,
          formData.description || formData.source,
          "income",
          formData.paymentMethod || undefined
        );
      } else {
        await transactionController.addIncome(
          Number(formData.amount),
          new Date(formData.date),
          formData.source,
          formData.description || formData.source,
          formData.paymentMethod || undefined
        );
      }
      setFormSuccess(true);
      if (!isEditMode) {
        setFormData({
          amount: "",
          source: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          paymentMethod: "",
        });
      }
      if (onSuccess) {
        onSuccess();
      }
      window.dispatchEvent(new Event("transactions-updated"));
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  }

  async function handleDelete() {
    if (!editId) return;
    setIsDeleting(true);
    try {
      await transactionController.deleteTransaction(editId, "income");
      setShowDeleteConfirm(false);
      if (onSuccess) {
        onSuccess();
      }
      window.dispatchEvent(new Event("transactions-updated"));
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {symbol}
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </div>

        {/* Source */}
        <div>
          <Label htmlFor="source">Income Source *</Label>
          <select
            id="source"
            title="Income source"
            aria-label="Income source"
            className="w-full mt-1 px-3 py-2 border border-gray-700 rounded-md bg-input-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
          >
            <option value="">Select a source</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date">Date *</Label>
          <input
            id="date"
            type="date"
            title="Transaction date"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>

        {/* Payment Method */}
        <div>
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <select
            id="paymentMethod"
            title="Payment method"
            aria-label="Payment method"
            className="w-full mt-1 px-3 py-2 border border-gray-700 rounded-md bg-input-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={4}
          placeholder="Add notes about this income..."
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      {formError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{formError}</p>
      )}
      {formSuccess && (
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          Income saved successfully!
        </p>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Save Income
        </Button>
        {isEditMode && (
          <Button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}