import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { transactionController } from "../services";
import { useCurrency } from "../CurrencyContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function MonthlyReports() {

  const { symbol } = useCurrency();

  // ✅ Currency Fix
  const displayCurrency = symbol === "৳" ? "BDT" : symbol;

  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    savingsRate: 0,
  });

  const [incomeBreakdown, setIncomeBreakdown] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // ✅ Format Function (GLOBAL FIX)
  const parseAmount = (value: unknown): number => {
    const amount = typeof value === "string" ? Number(value) : Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  };

  const formatWithCurrency = (amount: number) => {
    return `${displayCurrency} ${parseAmount(amount).toFixed(2)}`;
  };

  // ---------------- PDF EXPORT ----------------
  const exportPDF = () => {
    if (!selectedMonth) {
      alert("Please select a month first");
      return;
    }

    const filteredTx = filterByMonth(allTransactions, selectedMonth);
    const summary = calculateSummary(filteredTx);
    const breakdowns = calculateBreakdowns(filteredTx);

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    doc.setFontSize(18);
    doc.text("Monthly Financial Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Month: ${formatMonth(selectedMonth)}`, 14, 30);

    // Summary Table
    autoTable(doc, {
      startY: 40,
      head: [["Type", "Amount"]],
      body: [
        ["Total Income", formatWithCurrency(summary.totalIncome)],
        ["Total Expenses", formatWithCurrency(summary.totalExpenses)],
        ["Net Savings", formatWithCurrency(summary.netSavings)],
        ["Savings Rate", `${summary.savingsRate}%`],
      ],
    });

    const finalY1 = (doc as any).lastAutoTable?.finalY || 50;

    // Income Breakdown
    autoTable(doc, {
      startY: finalY1 + 10,
      head: [["Income Category", "Amount"]],
      body: breakdowns.income.map((i) => [
        i.category,
        formatWithCurrency(i.amount),
      ]),
    });

    const finalY2 = (doc as any).lastAutoTable?.finalY || finalY1 + 20;

    // Expense Breakdown
    autoTable(doc, {
      startY: finalY2 + 10,
      head: [["Expense Category", "Amount"]],
      body: breakdowns.expense.map((i) => [
        i.category,
        formatWithCurrency(i.amount),
      ]),
    });

    doc.save(`monthly-report-${selectedMonth}.pdf`);
  };

  // ---------------- HELPERS ----------------
  const getAvailableMonths = (transactions: any[]) => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      set.add(key);
    });
    return Array.from(set).sort().reverse();
  };

  const filterByMonth = (transactions: any[], monthKey: string) => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === monthKey;
    });
  };

  const formatMonth = (monthKey: string) => {
    if (!monthKey) return "";
    const [y, m] = monthKey.split("-");
    return new Date(+y, +m - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const calculateSummary = (tx: any[]) => {
    const income = tx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + parseAmount(t.amount), 0);

    const expense = tx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + parseAmount(t.amount), 0);

    return {
      totalIncome: income,
      totalExpenses: expense,
      netSavings: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
    };
  };

  const calculateBreakdowns = (tx: any[]) => {
    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    tx.forEach((t) => {
      const amount = parseAmount(t.amount);
      if (t.type === "income") {
        incomeMap.set(t.category, (incomeMap.get(t.category) || 0) + amount);
      } else if (t.type === "expense") {
        expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + amount);
      }
    });

    return {
      income: [...incomeMap.entries()].map(([category, amount]) => ({
        category,
        amount,
      })),
      expense: [...expenseMap.entries()].map(([category, amount]) => ({
        category,
        amount,
      })),
    };
  };

  // ---------------- LOAD ----------------
  useEffect(() => {
    async function load() {
      try {
        const tx = await transactionController.getAllTransactions();
        setAllTransactions(tx);

        const months = getAvailableMonths(tx);
        setAvailableMonths(months);

        if (months.length > 0) {
          setSelectedMonth(months[0]);
        }
      } catch (err) {
        console.error("Load error:", err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    const filtered = filterByMonth(allTransactions, selectedMonth);
    setMonthlyData(calculateSummary(filtered));

    const b = calculateBreakdowns(filtered);
    setIncomeBreakdown(b.income);
    setExpenseBreakdown(b.expense);
  }, [selectedMonth, allTransactions]);

  const filteredTransactions = selectedMonth ? filterByMonth(allTransactions, selectedMonth) : [];
  const incomeCount = filteredTransactions.filter((t) => t.type === "income").length;
  const expenseCount = filteredTransactions.filter((t) => t.type === "expense").length;

  // ---------------- UI ----------------
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Monthly Reports</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Financial summary</p>
        </div>

        <Button onClick={exportPDF} className="bg-primary/90 text-primary-foreground hover:bg-primary h-10 gap-1 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          <span>Export Monthly Report</span>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div>{incomeCount} income entries</div>
          <div>{expenseCount} expense entries</div>
          <div>{filteredTransactions.length} total transactions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {formatWithCurrency(monthlyData.totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatWithCurrency(monthlyData.totalExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Net Savings</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatWithCurrency(monthlyData.netSavings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Savings Rate</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthlyData.savingsRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Income Breakdown</CardTitle></CardHeader>
          <CardContent>
            {incomeBreakdown.length ? incomeBreakdown.map((item) => (
              <div key={item.category} className="flex justify-between">
                <span>{item.category}</span>
                <strong>{formatWithCurrency(item.amount)}</strong>
              </div>
            )) : <p>No data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            {expenseBreakdown.length ? expenseBreakdown.map((item) => (
              <div key={item.category} className="flex justify-between">
                <span>{item.category}</span>
                <strong>{formatWithCurrency(item.amount)}</strong>
              </div>
            )) : <p>No data</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}