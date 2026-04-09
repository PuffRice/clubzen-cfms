import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";
import { transactionController } from "../services";
import { useCurrency } from "../CurrencyContext";
import type { Transaction } from "../../domain/Transaction";
import { formatLocalDateKey } from "../../utils/calendarDate";

function toDateKey(d: Date): string {
  return formatLocalDateKey(d);
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTxTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
}

interface DayTx {
  id: string;
  description: string;
  type: string;
  category: string;
  amount: number;
  date: Date;
  /** Clock time for display (DB `created_at` when available; else calendar date at noon). */
  at: Date;
}

export function DailyReports() {
  const { symbol } = useCurrency();

  const amountLabel = (n: number) => `${symbol}${formatMoney(n)}`;

  const todayKey = toDateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = toDateKey(yesterdayDate);

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [allTx, setAllTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    transactionController
      .getAllTransactions()
      .then(setAllTx)
      .finally(() => setLoading(false));
  }, []);

  const filtered = allTx.filter((t) => toDateKey(t.date) === selectedDate);

  const dailyTransactions: DayTx[] = filtered
    .slice()
    .reverse()
    .map((t) => ({
      id: t.id,
      description: t.description,
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date,
      at: t.recordedAt ?? t.date,
    }));

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netChange = totalIncome - totalExpenses;

  const dateLabel =
    selectedDate === todayKey ? "Today" : selectedDate === yesterdayKey ? "Yesterday" : selectedDate;

  const exportReport = useCallback(
    async (format: "pdf" | "xlsx") => {
      setExportOpen(false);
      const lbl = (n: number) => `${symbol}${formatMoney(n)}`;
      const cellAmt = (t: DayTx) =>
        `${t.type === "income" ? "+" : "-"}${symbol}${formatMoney(t.amount)}`;

      const rows = dailyTransactions.map((t) => ({
        Type: t.type === "income" ? "Income" : "Expense",
        Category: t.category,
        Description: t.description,
        Amount: cellAmt(t),
        Time: formatTxTime(t.at),
      }));

      if (format === "xlsx") {
        const XLSX = await import("xlsx");
        const headerRow = ["Type", "Category", "Description", "Amount", "Time"];
        const dataRows = dailyTransactions.map((t) => [
          t.type === "income" ? "Income" : "Expense",
          t.category,
          t.description,
          cellAmt(t),
          formatTxTime(t.at),
        ]);
        const summaryLine = `Income: ${lbl(totalIncome)}  |  Expenses: ${lbl(totalExpenses)}  |  Net: ${lbl(netChange)}`;
        const aoa = [
          [`Daily Report — ${selectedDate}`],
          [summaryLine],
          [],
          headerRow,
          ...(dataRows.length ? dataRows : [["—", "—", "No transactions for this date", "—", "—"]]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
        XLSX.writeFile(wb, `daily-report-${selectedDate}.xlsx`);
      } else {
        const { default: jsPDF } = await import("jspdf");
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Daily Report — ${selectedDate}`, 14, 20);
        doc.setFontSize(10);
        doc.text(
          `Income: ${lbl(totalIncome)}  |  Expenses: ${lbl(totalExpenses)}  |  Net: ${lbl(netChange)}`,
          14,
          30,
        );
        autoTable(doc, {
          startY: 38,
          head: [["Type", "Category", "Description", "Amount", "Time"]],
          body: rows.length ? rows.map((r) => [r.Type, r.Category, r.Description, r.Amount, r.Time]) : [["—", "—", "No transactions for this date", "—", "—"]],
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] },
        });
        doc.save(`daily-report-${selectedDate}.pdf`);
      }
    },
    [dailyTransactions, selectedDate, symbol, totalIncome, totalExpenses, netChange],
  );

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Reports</h1>
          <p className="text-muted-foreground mt-1">Track your daily financial activities</p>
        </div>
        <div className="relative">
          <Button className="bg-primary/90 text-primary-foreground hover:bg-primary h-10 gap-1" onClick={() => setExportOpen(!exportOpen)}>
            <Download className="h-4 w-4" />
            Export Daily Report
          </Button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[180px]">
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-slate-700 transition-colors"
                onClick={() => exportReport("pdf")}
              >
                Export as PDF
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-slate-700 transition-colors border-t border-slate-700"
                onClick={() => exportReport("xlsx")}
              >
                Export as XLSX
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <Card className="bg-card-navy/25 border-card-navy/40 border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary bg-background text-foreground"
                title="Select date"
              />
              <Button
                variant={selectedDate === todayKey ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(todayKey)}
              >
                Today
              </Button>
              <Button
                variant={selectedDate === yesterdayKey ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(yesterdayKey)}
              >
                Yesterday
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card-navy/25 border-card-navy/40 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income {dateLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <p className="text-2xl font-bold text-green-500 truncate">
                +{amountLabel(totalIncome)}
              </p>
              <TrendingUp className="h-6 w-6 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-navy/25 border-card-navy/40 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses {dateLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <p className="text-2xl font-bold text-red-500 truncate">
                -{amountLabel(totalExpenses)}
              </p>
              <TrendingDown className="h-6 w-6 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-navy/25 border-card-navy/40 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-2xl font-bold truncate ${netChange >= 0 ? "text-cyan-500" : "text-red-500"}`}>
                {netChange >= 0 ? "+" : "-"}
                {amountLabel(Math.abs(netChange))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-navy/25 border-card-navy/40 border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <p className="text-2xl font-bold text-foreground">
                {filtered.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Timeline */}
      <Card className="bg-card-navy/25 border-card-navy/40 border">
        <CardHeader>
          <CardTitle>Transaction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : dailyTransactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No transactions for {dateLabel}.</p>
          ) : (
            <div className="space-y-4">
              {dailyTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                    transaction.type === "income"
                      ? "bg-green-600/5 border-green-600/20 hover:bg-green-600/10"
                      : "bg-red-600/5 border-red-600/20 hover:bg-red-600/10"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        transaction.type === "income" ? "bg-green-600/10" : "bg-red-600/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="font-semibold text-foreground truncate">{transaction.category}</h4>
                      <span
                        className={`font-bold text-lg whitespace-nowrap ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {amountLabel(transaction.amount)}
                      </span>
                    </div>
                    {transaction.description && transaction.description !== transaction.category && (
                      <p className="text-sm text-muted-foreground truncate mb-1">{transaction.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatTxTime(transaction.at)}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
