function isPositiveNumber(val: string): boolean {
  const n = parseFloat(val);
  return !isNaN(n) && n > 0;
}

export const Validators = {
  validateHeight: (v: string) => isPositiveNumber(v),
  validateWeight: (v: string) => isPositiveNumber(v)
};
