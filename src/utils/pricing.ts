
/**
 * Calculates the final rounded price based on business rules.
 * Rule:
 * 1. Base = weight * price
 * 2. Threshold = 300 (30% of 1000)
 * 3. If remainder <= 300 -> Round Down
 * 4. If remainder > 300 -> Round Up
 * 5. Minimum charge 1000 if raw > 0
 *
 * @param price Unit price (e.g. 7000)
 * @param quantity Weight or Qty (e.g. 1.12)
 * @returns Rounded integer amount
 */
export function calculateRoundedPrice(price: number, quantity: number): number {
    if (!price || !quantity) return 0;

    // Use integer math for precision where possible, but input is float(weight).
    // First, get the raw value. Round to nearest integer to avoid 7000.0000001 issues.
    const rawPrice = Math.round(price * quantity);

    if (rawPrice === 0) return 0;

    const remainder = rawPrice % 1000;
    let finalPrice = rawPrice;

    // Logic: <= 300 Round DOWN, > 300 Round UP
    if (remainder <= 300) {
        finalPrice = Math.floor(rawPrice / 1000) * 1000;
    } else {
        finalPrice = Math.ceil(rawPrice / 1000) * 1000;
    }

    // Safety Net: Minimum charge 1000
    if (finalPrice === 0 && rawPrice > 0) {
        return 1000;
    }

    return finalPrice;
}
