import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import API_URL from '../api';

interface AddMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMealAdded: () => void;
    defaultDate?: Date;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onMealAdded, defaultDate }) => {
    const [formData, setFormData] = useState({
        name: '',
        calories: 0,
        price: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    });
    const [error, setError] = useState('');

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });
    };

    const handleAutoFill = async () => {
        if (!formData.name) return;
        setIsAnalyzing(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ai/analyze', { mealName: formData.name });
            const { calories, price, protein, carbs, fat } = res.data;
            setFormData(prev => ({
                ...prev,
                calories: calories || 0,
                price: price || 0,
                protein: protein || 0,
                carbs: carbs || 0,
                fat: fat || 0
            }));
        } catch (err) {
            console.error("AI Analyze Failed", err);
            setError("Failed to analyze meal. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const mealDate = defaultDate ? new Date(defaultDate) : new Date();

            await axios.post(`${API_URL}/api/meals`, {
                ...formData,
                date: mealDate.toISOString()
            });
            onMealAdded();
            onClose();
            setFormData({ name: '', calories: 0, price: 0, protein: 0, carbs: 0, fat: 0 }); // Reset form
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Failed to add meal');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Meal</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Meal Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="name"
                                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Chicken Salad"
                            />
                            <button
                                type="button"
                                onClick={handleAutoFill}
                                disabled={!formData.name || isAnalyzing}
                                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
                            >
                                {isAnalyzing ? 'Thinking...' : '✨ Auto-Fill'}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Calories</label>
                            <input
                                type="number"
                                name="calories"
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.calories}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Protein (g)</label>
                            <input
                                type="number"
                                name="protein"
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.protein}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Carbs (g)</label>
                            <input
                                type="number"
                                name="carbs"
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.carbs}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Fat (g)</label>
                            <input
                                type="number"
                                name="fat"
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.fat}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                    >
                        Add Meal
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMealModal;
