import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Download, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { transactionController } from "../services";
import { useCurrency } from "../CurrencyContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function MonthlyReports() {
  const { symbol } = useCurrency();

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

  // ---------------- PDF EXPORT ----------------
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Monthly Financial Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Month: ${formatMonth(selectedMonth)}`, 14, 30);

    // Summary Table
    autoTable(doc, {
      startY: 40,
      head: [["Type", "Amount"]],
      body: [
        ["Total Income", `${symbol}${monthlyData.totalIncome.toFixed(2)}`],
        ["Total Expenses", `${symbol}${monthlyData.totalExpenses.toFixed(2)}`],
        ["Net Savings", `${symbol}${monthlyData.netSavings.toFixed(2)}`],
        ["Savings Rate", `${monthlyData.savingsRate}%`],
      ],
    });

    const finalY1 = (doc as any).lastAutoTable?.finalY || 50;

    // Income Breakdown
    autoTable(doc, {
      startY: finalY1 + 10,
      head: [["Income Category", "Amount"]],
      body: incomeBreakdown.map((i) => [
        i.category,
        `${symbol}${i.amount.toFixed(2)}`,
      ]),
    });

    const finalY2 = (doc as any).lastAutoTable?.finalY || finalY1 + 20;

    // Expense Breakdown
    autoTable(doc, {
      startY: finalY2 + 10,
      head: [["Expense Category", "Amount"]],
      body: expenseBreakdown.map((i) => [
        i.category,
        `${symbol}${i.amount.toFixed(2)}`,
      ]),
    });

    doc.save(`report-${selectedMonth}.pdf`);
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
      .reduce((s, t) => s + t.amount, 0);

    const expense = tx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

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
      if (t.type === "income") {
        incomeMap.set(t.category, (incomeMap.get(t.category) || 0) + t.amount);
      } else {
        expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount);
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

  // ---------------- UI ----------------
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Reports</h1>
          <p className="text-muted-foreground">Financial summary</p>
        </div>

        <Button onClick={exportPDF} className="bg-purple-600 hover:bg-purple-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="mb-6 p-2 border rounded"
      >
        {availableMonths.map((m) => (
          <option key={m} value={m}>
            {formatMonth(m)}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent>
            Income: {symbol}{monthlyData.totalIncome}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            Expense: {symbol}{monthlyData.totalExpenses}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}