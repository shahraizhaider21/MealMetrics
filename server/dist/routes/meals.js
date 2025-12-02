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
const Meal_1 = __importDefault(require("../models/Meal"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Mock Data removed
// Get all meals
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meals = yield Meal_1.default.find({ user: req.user.user.id }).sort({ date: -1 });
        res.json(meals);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// Add meal
router.post('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, calories, protein, carbs, fat, price, date } = req.body;
    try {
        const newMeal = new Meal_1.default({
            name,
            calories,
            protein,
            carbs,
            fat,
            price,
            date,
            user: req.user.user.id
        });
        const meal = yield newMeal.save();
        res.json(meal);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// Delete meal
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meal = yield Meal_1.default.findById(req.params.id);
        if (!meal)
            return res.status(404).json({ msg: 'Meal not found' });
        // Check user
        if (meal.user.toString() !== req.user.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        yield meal.deleteOne();
        res.json({ msg: 'Meal removed' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
exports.default = router;
