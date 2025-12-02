import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { calculateNutritionGoals } from '../utils/nutrition';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password, budgetLimit, age, height, weight, gender, activityLevel } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
            budgetLimit,
            age,
            height,
            weight,
            gender,
            activityLevel
        });

        await user.save();

        const payload = { user: { id: (user as any)._id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login Attempt: ${username}`);
    try {
        let user = await User.findOne({ username });
        console.log(`User Found: ${user ? 'Yes' : 'No'}`);

        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password as string);
        console.log(`Password Valid: ${isMatch}`);

        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const goals = calculateNutritionGoals(user);

        const payload = { user: { id: (user as any)._id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: (user as any)._id,
                    username: user.username,
                    budgetLimit: user.budgetLimit,
                    age: user.age,
                    height: user.height,
                    weight: user.weight,
                    gender: user.gender,
                    activityLevel: user.activityLevel,
                    waterLogs: user.waterLogs,
                    waterIntake: user.waterIntake,
                    goals
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Profile
router.put('/profile', async (req, res) => {
    const { userId, age, height, weight, gender, activityLevel } = req.body;
    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (age) user.age = age;
        if (height) user.height = height;
        if (weight) user.weight = weight;
        if (gender) user.gender = gender;
        if (activityLevel) user.activityLevel = activityLevel;

        await user.save();

        const goals = calculateNutritionGoals(user);

        res.json({
            user: {
                id: (user as any)._id,
                username: user.username,
                budgetLimit: user.budgetLimit,
                age: user.age,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                activityLevel: user.activityLevel,
                waterLogs: user.waterLogs,
                waterIntake: user.waterIntake,
                goals
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Water Intake
router.put('/water', async (req, res) => {
    const { userId, date, amount } = req.body;
    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Ensure waterLogs is initialized
        if (!user.waterLogs) {
            user.waterLogs = [];
        }

        const existingLogIndex = user.waterLogs.findIndex(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === targetDate.getTime();
        });

        if (existingLogIndex > -1) {
            user.waterLogs[existingLogIndex].amount = amount;
        } else {
            user.waterLogs.push({ date: targetDate, amount });
        }

        user.waterIntake = amount; // Update the simple field as well

        await user.save();
        res.json({ waterLogs: user.waterLogs, waterIntake: user.waterIntake });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
