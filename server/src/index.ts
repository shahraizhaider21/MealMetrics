import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import mealRoutes from './routes/meals';
import User from './models/User';
import Meal from './models/Meal';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Allow all origins for now, or specify Vercel URL later
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mealmetrics');
        console.log('MongoDB Connected');

        // Smart Seeding
        let user = await User.findOne({ username: 'Shahraiz' });

        if (!user) {
            console.log('Default user not found. Seeding default user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            user = new User({
                username: 'Shahraiz',
                password: hashedPassword,
                budgetLimit: 100 // Default budget
            });

            await user.save();
            console.log('Default user "Shahraiz" created successfully.');
        }

        // Check if meals exist for this user
        const mealCount = await Meal.countDocuments({ user: user._id });

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

            await Meal.insertMany(meals);
            console.log('Seeded 15 meals with realistic macros successfully.');
        } else {
            console.log('Meals exist for Shahraiz. Skipping seeding to preserve data.');
        }

    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

connectDB();

app.get('/', (req, res) => {
    res.send('MealMetrics API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
