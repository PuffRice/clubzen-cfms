/**
 * Settings — Domain entity representing a user's application settings.
 *
 * Responsibilities:
 *   • Encapsulates user profile and preference data
 *   • Provides domain-level validation (e.g. supported currencies)
 *   • Separates settings concerns from authentication
 */

export type CurrencyCode = "USD" | "BDT";

const SUPPORTED_CURRENCIES: CurrencyCode[] = ["USD", "BDT"];

export class Settings {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly fullName: string,
    readonly role: string,
    readonly currency: CurrencyCode,
    readonly updatedAt: Date,
  ) {}

  static isSupportedCurrency(code: string): code is CurrencyCode {
    return SUPPORTED_CURRENCIES.includes(code as CurrencyCode);
  }

  withName(name: string): Settings {
    return new Settings(this.userId, this.email, name, this.role, this.currency, new Date());
  }

  withCurrency(currency: CurrencyCode): Settings {
    return new Settings(this.userId, this.email, this.fullName, this.role, currency, new Date());
  }
}
