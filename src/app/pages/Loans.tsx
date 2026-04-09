import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Plus, Wallet, Clock, Check, Edit2 } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { RepaymentForm } from "../components/RepaymentForm";
import { LoanForm } from "../components/LoanForm";
import { loanController, loanRepaymentController } from "../services";
import { useCurrency } from "../CurrencyContext";
import type { Loan, LoanRepayment } from "../../domain";

export function Loans() {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [addLoanOpen, setAddLoanOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const isAdmin = userRole === "Admin";
  const [loanRepayments, setLoanRepayments] = useState<{
    [key: string]: LoanRepayment[];
  }>({});
  const [loanBalances, setLoanBalances] = useState<{
    [key: string]: { totalRepaid: number; remaining: number };
  }>({});
  const [filter, setFilter] = useState<"all" | "taken" | "given">("all");
  const [loading, setLoading] = useState(true);

  const loadLoans = async () => {
    try {
      setLoading(true);
      let allLoans: Loan[] = [];

      if (filter === "all") {
        allLoans = await loanController.getAllLoans();
      } else {
        allLoans = await loanController.getLoansByDirection(filter);
      }

      setLoans(allLoans);

      // Load repayments and balances for each loan
      const repayments: { [key: string]: LoanRepayment[] } = {};
      const balances: {
        [key: string]: { totalRepaid: number; remaining: number };
      } = {};

      for (const loan of allLoans) {
        const reps = await loanRepaymentController.getRepaymentsByLoanId(loan.id);
        const totalRepaid = await loanRepaymentController.getTotalRepaid(loan.id);
        const remaining = await loanRepaymentController.getRemainingAmount(loan.id);

        repayments[loan.id] = reps;
        balances[loan.id] = { totalRepaid, remaining };
      }

      setLoanRepayments(repayments);
      setLoanBalances(balances);
    } catch (err) {
      console.error("Failed to load loans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [filter]);

  const handleRepaymentSuccess = () => {
    setOpen(false);
    setSelectedLoanId(null);
    loadLoans();
  };

  const handleEditClick = (loan: Loan) => {
    setEditingLoan(loan);
    setEditOpen(true);
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setEditingLoan(null);
    loadLoans();
  };

  const handleAddLoanSuccess = () => {
    setAddLoanOpen(false);
    loadLoans();
  };

  const handleOpenRepaymentDialog = (loanId: string) => {
    setSelectedLoanId(loanId);
    setOpen(true);
  };

  const filteredLoans = loans;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loans</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your loans and repayments
          </p>
        </div>
        <Dialog open={addLoanOpen} onOpenChange={setAddLoanOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/90 text-primary-foreground hover:bg-primary h-10">
              <Plus className="h-4 w-4" />
              Add Loan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Loan</DialogTitle>
            </DialogHeader>
            <LoanForm onSuccess={handleAddLoanSuccess} />
            <DialogClose className="absolute top-2 right-2">
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-primary/90 text-primary-foreground hover:bg-primary" : ""}
        >
          All Loans
        </Button>
        <Button
          variant={filter === "taken" ? "default" : "outline"}
          onClick={() => setFilter("taken")}
          className={filter === "taken" ? "bg-primary/90 text-primary-foreground hover:bg-primary" : ""}
        >
          Loans Taken
        </Button>
        <Button
          variant={filter === "given" ? "default" : "outline"}
          onClick={() => setFilter("given")}
          className={filter === "given" ? "bg-primary/90 text-primary-foreground hover:bg-primary" : ""}
        >
          Loans Given
        </Button>
      </div>

      {/* Summary Cards */}
      {filter !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card-navy/25 border-card-navy/40 border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {filter === "taken" ? "Total Taken" : "Total Given"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {symbol}
                    {filteredLoans
                      .reduce((sum, l) => sum + l.amount, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="text-4xl font-extrabold text-blue-500">{symbol}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-navy/25 border-card-navy/40 border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Repaid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {symbol}
                    {Object.values(loanBalances)
                      .reduce((sum, b) => sum + b.totalRepaid, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-navy/25 border-card-navy/40 border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Remaining Balance
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {symbol}
                    {Object.values(loanBalances)
                      .reduce((sum, b) => sum + b.remaining, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loans List */}
      <Card className="bg-card-navy/25 border-card-navy/40 border">
        <CardHeader>
          <CardTitle>
            {filter === "all"
              ? "All Loans"
              : filter === "taken"
                ? "Loans Taken"
                : "Loans Given"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-white/10 rounded-lg p-6 shadow-sm shadow-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-8 w-36" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No loans found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => {
                const balance = loanBalances[loan.id] || {
                  totalRepaid: 0,
                  remaining: 0,
                };
                const repayments = loanRepayments[loan.id] || [];
                const pctRaw =
                  loan.amount > 0 ? (balance.totalRepaid / loan.amount) * 100 : 0;
                const repaymentPercentage = (Number.isFinite(pctRaw) ? pctRaw : 0).toFixed(1);
                const progressFillWidth = Math.min(
                  100,
                  Math.max(0, Number.isFinite(pctRaw) ? pctRaw : 0),
                );

                return (
                  <div
                    key={loan.id}
                    className="border border-white/10 rounded-lg p-6 shadow-sm shadow-white/5 hover:bg-gray-800 hover:shadow-md hover:shadow-white/10 transition-colors transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Left Side */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {loan.description}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium">Type:</span>{" "}
                            {loan.direction === "taken" ? "Loan Taken" : "Loan Given"}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">Date:</span>{" "}
                            {loan.date.toISOString().split("T")[0]}
                          </p>
                        </div>
                      </div>

                      {/* Right Side - Amount and Balance */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Total Amount
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                              {symbol}{loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">
                              Remaining
                            </p>
                            <p className="text-2xl font-bold text-orange-500">
                              {symbol}{balance.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar — SVG width avoids inline CSS (lint) */}
                        <div
                          className="w-full bg-gray-700 rounded-full h-2 overflow-hidden"
                          aria-label={`Repayment progress ${repaymentPercentage}%`}
                        >
                          <svg
                            className="block h-2 w-full"
                            viewBox="0 0 100 2"
                            preserveAspectRatio="none"
                            aria-hidden
                          >
                            <rect
                              x={0}
                              y={0}
                              height={2}
                              rx={1}
                              width={progressFillWidth}
                              className={
                                loan.direction === "taken" ? "fill-green-600" : "fill-blue-600"
                              }
                            />
                          </svg>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Repaid: {symbol}{balance.totalRepaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="font-medium">
                            {repaymentPercentage}%
                          </span>
                          <span>
                            {loan.direction === "taken" ? "Received" : "Lent"}: {symbol}{balance.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Repayments History */}
                    {repayments.length > 0 && (
                      <div className="mb-4 pb-4 border-t border-gray-700 pt-4">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Repayment History
                        </p>
                        <div className="space-y-1">
                          {repayments.map((rep, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs text-muted-foreground"
                            >
                              <span>
                                {rep.date.toISOString().split("T")[0]}
                                {rep.description && ` - ${rep.description}`}
                              </span>
                              <span className={`font-semibold text-sm ${loan.direction === "taken" ? "text-green-500" : "text-blue-500"}`}>
                                {symbol}{rep.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {balance.remaining > 0 ? (
                      <div className="flex gap-2">
                        <Dialog open={open && selectedLoanId === loan.id} onOpenChange={setOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-green-600 hover:bg-green-700 h-10"
                              onClick={() => handleOpenRepaymentDialog(loan.id)}
                            >
                              <Plus className="h-4 w-4" />
                              Add Repayment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Record Repayment for "{loan.description}"
                              </DialogTitle>
                            </DialogHeader>
                            {selectedLoanId && (
                              <RepaymentForm
                                loanId={selectedLoanId}
                                onSuccess={handleRepaymentSuccess}
                              />
                            )}
                            <DialogClose className="absolute top-2 right-2">
                              <span className="sr-only">Close</span>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          disabled={!isAdmin}
                          onClick={() => handleEditClick(loan)}
                          className={`h-10 border-blue-600 ${
                            isAdmin
                              ? "hover:bg-blue-600 hover:text-white cursor-pointer"
                              : "opacity-50 cursor-not-allowed text-gray-500"
                          }`}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
                        <Check className="h-4 w-4" />
                        Repayment Completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Loan Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
          </DialogHeader>
          {editingLoan && (
            <div className="space-y-4">
              <div>
                <Label>Direction</Label>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {editingLoan.direction === "taken" ? "Loan Taken" : "Loan Given"}
                </p>
              </div>
              <div>
                <Label htmlFor="editAmount">Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {symbol}
                  </span>
                  <input
                    id="editAmount"
                    type="number"
                    step="0.01"
                    defaultValue={editingLoan.amount}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editDate">Date</Label>
                <input
                  id="editDate"
                  type="date"
                  defaultValue={editingLoan.date.toISOString().split("T")[0]}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <input
                  id="editDescription"
                  type="text"
                  defaultValue={editingLoan.description}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={async () => {
                  const amount = Number((document.getElementById("editAmount") as HTMLInputElement)?.value);
                  const date = (document.getElementById("editDate") as HTMLInputElement)?.value;
                  const description = (document.getElementById("editDescription") as HTMLInputElement)?.value;

                  if (amount && date) {
                    try {
                      await loanController.updateLoan(
                        editingLoan.id,
                        editingLoan.direction,
                        amount,
                        new Date(date),
                        description
                      );
                      handleEditSuccess();
                    } catch (err) {
                      console.error("Failed to update loan", err);
                    }
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Update Loan
              </Button>
            </div>
          )}
          <DialogClose className="absolute top-2 right-2">
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
