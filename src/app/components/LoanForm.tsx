import { useState, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import { loanController } from "../services";
import { useCurrency } from "../CurrencyContext";

interface LoanFormProps {
  onSuccess?: () => void;
  defaultDirection?: "taken" | "given";
}

export function LoanForm({ onSuccess, defaultDirection = "taken" }: LoanFormProps) {
  const { symbol } = useCurrency();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    direction: defaultDirection,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setIsLoading(true);

    try {
      if (!formData.amount || !formData.direction) {
        setFormError("Amount and direction are required.");
        setIsLoading(false);
        return;
      }

      await loanController.createLoan(
        formData.direction as "taken" | "given",
        Number(formData.amount),
        new Date(formData.date),
        formData.description || undefined
      );

      setFormSuccess(true);
      setFormData({
        direction: defaultDirection,
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direction */}
        <div>
          <Label htmlFor="direction">Type *</Label>
          <select
            id="direction"
            title="Loan direction"
            aria-label="Loan direction"
            className="w-full mt-1 px-3 py-2 border border-gray-700 rounded-md bg-input-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.direction}
            onChange={(e) =>
              setFormData({ ...formData, direction: e.target.value as "taken" | "given" })
            }
          >
            <option value="taken">Loan Taken (Borrowed)</option>
            <option value="given">Loan Given (Lent)</option>
          </select>
        </div>

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
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date">Date *</Label>
          <input
            id="date"
            type="date"
            title="Loan date"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>
      </div>

      {/* Description/Note */}
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea
          id="description"
          rows={4}
          placeholder="Add notes about this loan..."
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          Loan created successfully!
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? "Creating..." : "Add Loan"}
      </Button>
    </form>
  );
}
