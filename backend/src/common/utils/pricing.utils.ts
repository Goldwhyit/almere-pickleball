/**
 * Calculate pro-rata price for monthly memberships
 * Based on remaining Tuesdays and Thursdays in the month
 * If only 1 or fewer training days remain, no payment needed
 */

export class PricingUtils {
  private static readonly TRAINING_DAYS = [2, 4]; // Tuesday=2, Thursday=4 (0=Monday, 6=Sunday)
  private static readonly PRICE_PER_SESSION = 8.5;
  private static readonly FULL_MONTH_PRICE = 34.0; // 4 weeks * 2 sessions/week * €8.50 (or standard monthly price)

  /**
   * Get remaining training days (Tuesdays/Thursdays) in the current month from given date
   */
  static getRemainingTrainingDaysInMonth(fromDate: Date): number {
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    const today = fromDate.getDate();

    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0).getDate();

    let count = 0;
    for (let day = today; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (this.TRAINING_DAYS.includes(dayOfWeek)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Calculate pro-rata price for monthly membership
   * If 1 or fewer training days remain, return 0 (no payment needed this month)
   * Otherwise return full month price (or calculated based on remaining sessions)
   */
  static calculateMonthlyProRataPrice(signupDate: Date): {
    price: number;
    remainingDays: number;
    shouldCharge: boolean;
    reason: string;
  } {
    const remainingDays = this.getRemainingTrainingDaysInMonth(signupDate);

    if (remainingDays <= 1) {
      return {
        price: 0,
        remainingDays,
        shouldCharge: false,
        reason: remainingDays === 1 
          ? 'Slechts 1 trainingsdag resterend in deze maand - betaalt volgende maand'
          : 'Geen trainingsdagen meer in deze maand - betaalt volgende maand',
      };
    }

    // Calculate pro-rata: (remaining days / approx days in month) * full price
    // Or simply charge full month price regardless
    return {
      price: this.FULL_MONTH_PRICE,
      remainingDays,
      shouldCharge: true,
      reason: `${remainingDays} trainingsdagen resterend - volledige maandprijs: €${this.FULL_MONTH_PRICE.toFixed(2)}`,
    };
  }

  /**
   * Get the month key (YYYY-MM) for tracking payments
   */
  static getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Check if already paid for current month
   */
  static isAlreadyPaidForMonth(lastPaidMonth: string | null): boolean {
    if (!lastPaidMonth) return false;
    const currentMonth = this.getMonthKey(new Date());
    return lastPaidMonth === currentMonth;
  }
}
