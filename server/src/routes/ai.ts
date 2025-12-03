import express, { Request, Response, Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const router: Router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// POST /api/ai/analyze
router.post('/analyze', async (req: Request, res: Response): Promise<any> => {
    try {
        const { mealName } = req.body;
        const prompt = `Estimate the nutrition for ${mealName}. Return ONLY a JSON object with keys: calories (number), protein (number), carbs (number), fat (number), price (estimated USD number). Ensure all fields are filled. No markdown.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean up markdown if present to ensure JSON.parse works
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(text));
    } catch (error) {
        console.error('AI Analyze Error:', error);
        res.status(500).json({ error: 'Failed to analyze meal' });
    }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response): Promise<any> => {
    try {
        const { message, context } = req.body;
        const prompt = `You are a Nutritionist. User context: ${JSON.stringify(context)}. User asks: ${message}. Keep it short.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to chat' });
    }
});

// POST /api/ai/ingredients
router.post('/ingredients', async (req: Request, res: Response): Promise<any> => {
    try {
        const { meals } = req.body;
        const prompt = `Generate a grocery shopping list for these meals: ${meals}. Return ONLY a JSON object where keys are meal names and values are arrays of ingredients. No markdown.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean up markdown
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(text));
    } catch (error) {
        console.error('AI Ingredients Error:', error);
        res.status(500).json({ error: 'Failed to get ingredients' });
    }
});

export default router;
