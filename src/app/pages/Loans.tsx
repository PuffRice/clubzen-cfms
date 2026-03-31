import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Wallet, DollarSign, Clock, Check } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { RepaymentForm } from "../components/RepaymentForm";
import { loanController } from "../services";
import { useCurrency } from "../CurrencyContext";
import type { Loan, LoanRepayment } from "../../domain";

export function Loans() {
  const { symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
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
        const reps = await loanController.getRepaymentsByLoanId(loan.id);
        const totalRepaid = await loanController.getTotalRepaid(loan.id);
        const remaining = await loanController.getRemainingAmount(loan.id);

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
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-blue-600" : ""}
        >
          All Loans
        </Button>
        <Button
          variant={filter === "taken" ? "default" : "outline"}
          onClick={() => setFilter("taken")}
          className={filter === "taken" ? "bg-blue-600" : ""}
        >
          Loans Taken
        </Button>
        <Button
          variant={filter === "given" ? "default" : "outline"}
          onClick={() => setFilter("given")}
          className={filter === "given" ? "bg-blue-600" : ""}
        >
          Loans Given
        </Button>
      </div>

      {/* Summary Cards */}
      {filter !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
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
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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
      <Card>
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
            <div className="text-center py-8 text-muted-foreground">
              Loading loans...
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
                    className="border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-colors"
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
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Total Amount
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                              {symbol}{loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          {loan.direction === "taken" ? (
                            <p className="text-sm text-green-600 font-medium">
                              (Received)
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 font-medium">
                              (Lent)
                            </p>
                          )}
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
                            Remaining: {symbol}{balance.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                              <span className="font-medium">
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
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleOpenRepaymentDialog(loan.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
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
    </div>
  );
}
