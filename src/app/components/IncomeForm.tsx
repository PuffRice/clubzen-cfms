import { useState, useEffect, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { TrendingUp } from "lucide-react";
import { transactionController, categoryController } from "../services";

interface IncomeFormProps {
  onSuccess?: () => void;
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "",
  });

  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await categoryController.getCategories();
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
    "Digital Wallet",
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    try {
      await transactionController.addIncome(
        Number(formData.amount),
        new Date(formData.date),
        formData.source,
        formData.description || formData.source,
        formData.paymentMethod || undefined
      );
      setFormSuccess(true);
      setFormData({
        amount: "",
        source: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        paymentMethod: "",
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setFormError((err as Error).message);
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
              Tk.
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
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
            style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
            className="w-full mt-1 px-3 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
            className="w-full mt-1 px-3 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
      </div>
    </form>
  );
}
