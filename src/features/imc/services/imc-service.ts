import { ImcCategory } from '../../../enums/imc-category';

export const ImcService = {
  calculate(weightKg: number, heightCm: number): number {
    const h = heightCm / 100;
    return weightKg / (h * h);
  },

  getCategory(imc: number): ImcCategory {
    if (imc < 18.5) return ImcCategory.UNDERWEIGHT;
    if (imc < 25)   return ImcCategory.NORMAL;
    if (imc < 30)   return ImcCategory.OVERWEIGHT;
    return ImcCategory.OBESE;
  }
};
