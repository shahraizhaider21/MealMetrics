"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const meals_1 = __importDefault(require("./routes/meals"));
const User_1 = __importDefault(require("./models/User"));
const Meal_1 = __importDefault(require("./models/Meal"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for now, or specify Vercel URL later
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/meals', meals_1.default);
// MongoDB Connection
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mealmetrics');
        console.log('MongoDB Connected');
        // Smart Seeding
        let user = yield User_1.default.findOne({ username: 'Shahraiz' });
        if (!user) {
            console.log('Default user not found. Seeding default user...');
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash('123456', salt);
            user = new User_1.default({
                username: 'Shahraiz',
                password: hashedPassword,
                budgetLimit: 100 // Default budget
            });
            yield user.save();
            console.log('Default user "Shahraiz" created successfully.');
        }
        // Check if meals exist for this user
        const mealCount = yield Meal_1.default.countDocuments({ user: user._id });
        if (mealCount === 0) {
            console.log('No meals found for Shahraiz. Seeding initial data...');
            const mealData = [
                { name: 'Grilled Chicken Salad', calories: 450, protein: 45, carbs: 12, fat: 20 },
                { name: 'Avocado Toast', calories: 350, protein: 12, carbs: 40, fat: 18 },
                { name: 'Protein Smoothie', calories: 280, protein: 30, carbs: 25, fat: 5 },
                { name: 'Salmon with Asparagus', calories: 500, protein: 40, carbs: 10, fat: 28 },
                { name: 'Oatmeal with Berries', calories: 300, protein: 8, carbs: 55, fat: 6 },
                { name: 'Turkey Sandwich', calories: 400, protein: 25, carbs: 45, fat: 12 },
                { name: 'Greek Yogurt Parfait', calories: 250, protein: 20, carbs: 30, fat: 4 },
                { name: 'Quinoa Bowl', calories: 420, protein: 15, carbs: 60, fat: 14 },
                { name: 'Steak and Potatoes', calories: 700, protein: 50, carbs: 45, fat: 35 },
                { name: 'Veggie Stir Fry', calories: 320, protein: 10, carbs: 40, fat: 15 },
                { name: 'Pasta Primavera', calories: 550, protein: 18, carbs: 80, fat: 18 },
                { name: 'Chicken Wrap', calories: 480, protein: 35, carbs: 40, fat: 20 },
                { name: 'Fruit Salad', calories: 180, protein: 2, carbs: 45, fat: 0 },
                { name: 'Egg White Omelet', calories: 220, protein: 25, carbs: 5, fat: 10 },
                { name: 'Tuna Salad', calories: 380, protein: 30, carbs: 10, fat: 22 }
            ];
            const meals = [];
            for (let i = 0; i < 15; i++) {
                const price = Math.floor(Math.random() * (25 - 5 + 1)) + 5; // $5 - $25
                const daysAgo = Math.floor(Math.random() * 10);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                meals.push({
                    user: user._id,
                    name: mealData[i].name,
                    calories: mealData[i].calories,
                    protein: mealData[i].protein,
                    carbs: mealData[i].carbs,
                    fat: mealData[i].fat,
                    price: price,
                    date: date
                });
            }
            yield Meal_1.default.insertMany(meals);
            console.log('Seeded 15 meals with realistic macros successfully.');
        }
        else {
            console.log('Meals exist for Shahraiz. Skipping seeding to preserve data.');
        }
    }
    catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
});
connectDB();
app.get('/', (req, res) => {
    res.send('MealMetrics API is running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
