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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const nutrition_1 = require("../utils/nutrition");
const router = express_1.default.Router();
// Register
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, budgetLimit, age, height, weight, gender, activityLevel } = req.body;
    try {
        let user = yield User_1.default.findOne({ username });
        if (user)
            return res.status(400).json({ msg: 'User already exists' });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        user = new User_1.default({
            username,
            password: hashedPassword,
            budgetLimit,
            age,
            height,
            weight,
            gender,
            activityLevel
        });
        yield user.save();
        const payload = { user: { id: user._id } };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// Login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log(`Login Attempt: ${username}`);
    try {
        let user = yield User_1.default.findOne({ username });
        console.log(`User Found: ${user ? 'Yes' : 'No'}`);
        if (!user)
            return res.status(400).json({ msg: 'Invalid Credentials' });
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        console.log(`Password Valid: ${isMatch}`);
        if (!isMatch)
            return res.status(400).json({ msg: 'Invalid Credentials' });
        const goals = (0, nutrition_1.calculateNutritionGoals)(user);
        const payload = { user: { id: user._id } };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err)
                throw err;
            res.json({
                token,
                user: {
                    id: user._id,
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
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// Update Profile
router.put('/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, age, height, weight, gender, activityLevel } = req.body;
    try {
        let user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        if (age)
            user.age = age;
        if (height)
            user.height = height;
        if (weight)
            user.weight = weight;
        if (gender)
            user.gender = gender;
        if (activityLevel)
            user.activityLevel = activityLevel;
        yield user.save();
        const goals = (0, nutrition_1.calculateNutritionGoals)(user);
        res.json({
            user: {
                id: user._id,
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
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// Update Water Intake
router.put('/water', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, date, amount } = req.body;
    try {
        let user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
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
        }
        else {
            user.waterLogs.push({ date: targetDate, amount });
        }
        user.waterIntake = amount; // Update the simple field as well
        yield user.save();
        res.json({ waterLogs: user.waterLogs, waterIntake: user.waterIntake });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
exports.default = router;
