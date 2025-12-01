import express from 'express';
import Meal from '../models/Meal';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Mock Data removed
// Get all meals
router.get('/', auth, async (req: AuthRequest, res) => {
    try {
        const meals = await Meal.find({ user: req.user.user.id }).sort({ date: -1 });
        res.json(meals);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add meal
router.post('/', auth, async (req: AuthRequest, res) => {
    const { name, calories, protein, carbs, fat, price, date } = req.body;
    try {
        const newMeal = new Meal({
            name,
            calories,
            protein,
            carbs,
            fat,
            price,
            date,
            user: req.user.user.id
        });

        const meal = await newMeal.save();
        res.json(meal);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete meal
router.delete('/:id', auth, async (req: AuthRequest, res) => {
    try {
        const meal = await Meal.findById(req.params.id);

        if (!meal) return res.status(404).json({ msg: 'Meal not found' });

        // Check user
        if (meal.user.toString() !== req.user.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await meal.deleteOne();
        res.json({ msg: 'Meal removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
