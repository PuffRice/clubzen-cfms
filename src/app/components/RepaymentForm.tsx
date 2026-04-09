import { useState, useEffect, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { loanRepaymentController } from "../services";
import { useCurrency } from "../CurrencyContext";

interface RepaymentFormProps {
  loanId: string;
  onSuccess?: () => void; // called after a successful save
  onError?: (error: string) => void;
}

export function RepaymentForm({ loanId, onSuccess, onError }: RepaymentFormProps) {
  const { symbol } = useCurrency();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    async function loadRemainingAmount() {
      try {
        const remaining = await loanRepaymentController.getRemainingAmount(loanId);
        setRemainingAmount(remaining);
      } catch (err) {
        console.error("Failed to load remaining amount", err);
      }
    }
    loadRemainingAmount();
  }, [loanId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setLoading(true);

    try {
      const amount = Number(formData.amount);

      if (amount <= 0) {
        throw new Error("Amount must be greater than zero");
      }

      if (amount > remainingAmount) {
        throw new Error(
          `Repayment amount cannot exceed remaining loan (${symbol}${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
        );
      }

      await loanRepaymentController.makeRepayment(
        loanId,
        amount,
        new Date(formData.date),
        formData.description || undefined,
      );

      setFormSuccess(true);
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message;
      setFormError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Remaining Amount Info */}
      <div className="p-4 bg-blue-100 border border-blue-300 rounded-md">
        <p className="text-sm font-medium text-blue-900">
          Remaining Amount: <span className="font-bold">{symbol}{remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <div>
          <Label htmlFor="amount">Repayment Amount *</Label>
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
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              disabled={loading}
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date">Repayment Date *</Label>
          <input
            id="date"
            type="date"
            title="Repayment date"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            disabled={loading}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea
          id="description"
          placeholder="Add any notes about this repayment..."
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
        />
      </div>

      {/* Error Message */}
      {formError && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {formError}
        </div>
      )}

      {/* Success Message */}
      {formSuccess && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
          Repayment recorded successfully!
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary/90 text-primary-foreground hover:bg-primary h-10"
        >
          {loading ? "Processing..." : "Record Repayment"}
        </Button>
      </div>
    </form>
  );
}
