"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNutritionGoals = void 0;
const calculateNutritionGoals = (user) => {
    // Mifflin-St Jeor Equation
    let bmr;
    if (user.gender === 'male') {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    }
    else {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }
    // Activity Multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };
    const multiplier = activityMultipliers[user.activityLevel] || 1.2;
    const tdee = Math.round(bmr * multiplier);
    // Macro Split (30% Protein, 40% Carbs, 30% Fat)
    const protein = Math.round((tdee * 0.3) / 4);
    const carbs = Math.round((tdee * 0.4) / 4);
    const fat = Math.round((tdee * 0.3) / 9);
    // BMI Calculation
    const heightInMeters = user.height / 100;
    const bmi = parseFloat((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
    let bmiCategory = '';
    if (bmi < 18.5)
        bmiCategory = 'Underweight';
    else if (bmi < 24.9)
        bmiCategory = 'Healthy';
    else if (bmi < 29.9)
        bmiCategory = 'Overweight';
    else
        bmiCategory = 'Obese';
    return {
        calories: tdee,
        protein,
        carbs,
        fat,
        bmi,
        bmiCategory
    };
};
exports.calculateNutritionGoals = calculateNutritionGoals;
