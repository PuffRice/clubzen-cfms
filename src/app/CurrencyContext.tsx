import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { settingsController } from "./services";

type CurrencyCode = "USD" | "BDT";

interface CurrencyContextValue {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amount: number) => string;
}

const SYMBOLS: Record<CurrencyCode, string> = { USD: "$", BDT: "৳" };

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "BDT",
  symbol: "৳",
  setCurrency: () => {},
  formatAmount: (n) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("BDT");

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;
    settingsController.getSettings(userId).then((res) => {
      if (res.success && res.settings?.currency) {
        setCurrencyState(res.settings.currency as CurrencyCode);
      }
    });
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      settingsController.updateCurrency(userId, code);
    }
  }, []);

  const symbol = SYMBOLS[currency];

  const formatAmount = useCallback(
    (amount: number) => `${SYMBOLS[currency]}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
