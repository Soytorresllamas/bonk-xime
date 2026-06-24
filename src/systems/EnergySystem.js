export const CHAIN_COST = 40;
export const POWER_COST = 80;

export class EnergySystem {
  constructor(max = 100) {
    this.max = max;
    this.current = 0;
  }

  gain(amount) {
    this.current = Math.min(this.max, this.current + amount);
  }

  canAfford(cost) {
    return this.current >= cost;
  }

  // Returns true and deducts if affordable; false and unchanged if not.
  spend(cost) {
    if (!this.canAfford(cost)) return false;
    this.current -= cost;
    return true;
  }

  get fraction() {
    return this.current / this.max;
  }

  reset() {
    this.current = 0;
  }
}
