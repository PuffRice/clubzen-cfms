import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileText,
  Plus,
  Zap,
  PieChart as PieChartIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "../components/ui/chart";
import { reportController, transactionController } from "../services";
import type { DashboardSummary } from "@core/service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { ExpenseForm } from "../components/ExpenseForm";
import { IncomeForm } from "../components/IncomeForm";

export function Dashboard() {
  // not navigating here any more; modals used instead
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netProfitLoss: 0,
  });
  const [transactions, setTransactions] = useState<
    { id: string; name: string; category: string; date: string; amount: number }[]
  >([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [monthlyIncome, setMonthlyIncome] = useState<
    { month: string; total: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#A855F7", "#EF4444", "#6B7280"];

  async function loadData() {
    try {
      const [dashSummary, allTx] = await Promise.all([
        reportController.getDashboardSummary(),
        transactionController.getAllTransactions(),
      ]);

      setSummary(dashSummary);

      // Build recent transactions list
      const recent = allTx
        .slice()
        .reverse()
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          name: t.description,
          category: t.category,
          date: t.date.toISOString().slice(0, 10),
          amount: t.type === "income" ? t.amount : -t.amount,
        }));
      setTransactions(recent);

      // Build expense breakdown
      const expenses = allTx.filter((t) => t.type === "expense");
      const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
      const categoryMap = new Map<string, number>();
      for (const t of expenses) {
        categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + t.amount);
      }
      const breakdown = [...categoryMap.entries()].map(([name, val], i) => ({
        name,
        value: totalExp > 0 ? Math.round((val / totalExp) * 100) : 0,
        color: colors[i % colors.length],
      }));
      setExpenseBreakdown(breakdown);

      // Build income breakdown
      const incomes = allTx.filter((t) => t.type === "income");
      const totalInc = incomes.reduce((s, t) => s + t.amount, 0);
      const incomeCategoryMap = new Map<string, number>();
      for (const t of incomes) {
        incomeCategoryMap.set(t.category, (incomeCategoryMap.get(t.category) ?? 0) + t.amount);
      }
      const incomeBreakdownData = [...incomeCategoryMap.entries()].map(([name, val], i) => ({
        name,
        value: totalInc > 0 ? Math.round((val / totalInc) * 100) : 0,
        color: colors[i % colors.length],
      }));
      setIncomeBreakdown(incomeBreakdownData);

      // Build monthly income data
      const monthlyMap = new Map<string, number>();
      const monthDateMap = new Map<string, Date>();
      for (const t of incomes) {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + t.amount);
        monthDateMap.set(monthKey, date);
      }
      
      // Get last 12 months
      const now = new Date();
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months.push({
          month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          total: monthlyMap.get(monthKey) ?? 0
        });
      }
      setMonthlyIncome(months);
    } catch (err) {
      console.error("Dashboard loadData error:", err);
      // optionally you could show a toast or set an error state here
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const gmt6Time = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
      const timeString = gmt6Time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateString = gmt6Time.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      setCurrentTime(`${dateString} • ${timeString}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const userName = sessionStorage.getItem("userEmail")?.split("@")[0] ?? "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Here's your financial snapshot
            </p>
          </div>
          <div className=" border-slate-700 rounded-2xl p-6 text-right">
            {/* <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Current Time</p> */}
            <p className="text-2xl font-bold text-white font-mono">{currentTime.split(' • ')[1]}</p>
            <p className="text-xs text-gray-500 mt-2">{currentTime.split(' • ')[0]}</p>
            {/* <p className="text-xs text-blue-400 font-semibold mt-3">GMT+6</p> */}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="lg:col-span-2 group">
            <div className="relative h-full">
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 border border-blue-500/20 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute w-40 h-40 bg-white rounded-full mix-blend-screen filter -top-20 -right-20"></div>
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-3">Current Balance</p>
                  <h2 className="text-5xl font-bold text-white mb-4">
                    Tk.{summary.netProfitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-blue-100 text-sm">Available balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Income Card */}
          <div className="group">
            <div className="relative h-full">
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-emerald-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <ArrowDownLeft className="h-6 w-6 text-emerald-400" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-400 opacity-50" />
                </div>
                <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Total Income</p>
                <h3 className="text-2xl font-bold text-white">
                  Tk.{summary.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h3>
              </div>
            </div>
          </div>

          {/* Expense Card */}
          <div className="group">
            <div className="relative h-full">
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-red-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <ArrowUpRight className="h-6 w-6 text-red-400" />
                  </div>
                  <TrendingDown className="h-5 w-5 text-red-400 opacity-50" />
                </div>
                <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Total Expenses</p>
                <h3 className="text-2xl font-bold text-white">
                  Tk.{summary.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              onClick={() => setExpenseModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
            <Button
              className="h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/50"
              onClick={() => setIncomeModalOpen(true)}
            >
              <Receipt className="h-5 w-5 mr-2" />
              Add Income
            </Button>
            <Button
              className="h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
              onClick={() => navigate("/dashboard/monthly-reports")}
            >
              <FileText className="h-5 w-5 mr-2" />
              Reports
            </Button>
          </div>
        </div>

        {/* Main Content Grid - Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions - Large Left Section */}
          <div className="lg:col-span-2 lg:row-span-2">
            <div className="relative group h-full">
              <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 h-full flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Receipt className="h-5 w-5 text-blue-400" />
                  </div>
                  Recent Transactions
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No transactions yet</p>
                      <p className="text-gray-500 text-sm mt-1">Add an income or expense to get started</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50 transition-all duration-200 group/item"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                              transaction.amount > 0
                                ? "bg-emerald-500/20 border-emerald-500/30"
                                : "bg-red-500/20 border-red-500/30"
                            }`}
                          >
                            {transaction.amount > 0 ? (
                              <ArrowDownLeft className="h-6 w-6 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="h-6 w-6 text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {transaction.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {transaction.category} • {transaction.date}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-bold whitespace-nowrap ml-4 ${
                            transaction.amount > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Income Over Time - Top Right */}
          <div className="relative group">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 h-full">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm">Inflow Trend</span>
              </h3>
              <div className="space-y-6">
                {monthlyIncome.length === 0 || monthlyIncome.every(m => m.total === 0) ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">No income data</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <svg viewBox="0 0 500 200" className="w-full h-auto max-h-48">
                        {(() => {
                          const padding = 30;
                          const width = 500 - 2 * padding;
                          const height = 200 - 2 * padding;
                          const dataPoints = monthlyIncome;
                          const maxValue = Math.max(...dataPoints.map(d => d.total), 1);
                          const minValue = 0;
                          const range = maxValue - minValue;
                          
                          // Calculate points for line
                          const points = dataPoints.map((d, i) => {
                            const x = padding + (i / (dataPoints.length - 1)) * width;
                            const y = padding + height - ((d.total - minValue) / range) * height;
                            return { x, y, value: d.total };
                          });
                          
                          // Create path
                          const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          
                          // Create area
                          const areaData = `${pathData} L ${points[points.length - 1].x} ${padding + height} L ${padding} ${padding + height} Z`;
                          
                          return (
                            <>
                              {/* Grid lines */}
                              {[0, 1, 2, 3, 4].map((i) => (
                                <line
                                  key={`grid-${i}`}
                                  x1={padding}
                                  y1={padding + (i / 4) * height}
                                  x2={500 - padding}
                                  y2={padding + (i / 4) * height}
                                  stroke="#334155"
                                  strokeWidth="0.5"
                                  opacity="0.3"
                                />
                              ))}
                              
                              {/* Area under line */}
                              <path
                                d={areaData}
                                fill="#10B981"
                                opacity="0.1"
                              />
                              
                              {/* Line */}
                              <path
                                d={pathData}
                                stroke="#10B981"
                                strokeWidth="2.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              
                              {/* Data points */}
                              {points.map((p, i) => (
                                <circle
                                  key={`point-${i}`}
                                  cx={p.x}
                                  cy={p.y}
                                  r="4"
                                  fill="#10B981"
                                  opacity="0.8"
                                />
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Min</p>
                        <p className="text-sm font-bold text-white">
                          Tk.{Math.min(...monthlyIncome.map(m => m.total)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Avg</p>
                        <p className="text-sm font-bold text-white">
                          Tk.{Math.round(monthlyIncome.reduce((s, m) => s + m.total, 0) / monthlyIncome.length).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Max</p>
                        <p className="text-sm font-bold text-white">
                          Tk.{Math.max(...monthlyIncome.map(m => m.total)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expense Breakdown - Bottom Right */}
          <div className="relative group">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 h-full">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <PieChartIcon className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm">Expenses</span>
              </h3>
              <div className="space-y-6">
                {expenseBreakdown.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">No expense data</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center h-48">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={expenseBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#fff" }}
                            itemStyle={{ color: "#fff" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                      {expenseBreakdown.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-bold text-white">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSuccess={() => {
                setExpenseModalOpen(false);
                loadData();
              }}
            />
            <DialogClose className="absolute top-2 right-2">
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>

        <Dialog open={incomeModalOpen} onOpenChange={setIncomeModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add Income</DialogTitle>
            </DialogHeader>
            <IncomeForm
              onSuccess={() => {
                setIncomeModalOpen(false);
                loadData();
              }}
            />
            <DialogClose className="absolute top-2 right-2">
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
