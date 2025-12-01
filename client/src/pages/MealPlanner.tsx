import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';

const MealPlanner = () => {
    const auth = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        price: 0,
        date: new Date().toISOString().split('T')[0]
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/meals', formData);
            setMessage('Meal added successfully!');
            setFormData({
                name: '',
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                price: 0,
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            setMessage('Error adding meal');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-green-600" />
                Add New Meal
            </h2>
            {message && <p className={`mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Meal Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Calories</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Price ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Protein (g)</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Carbs (g)</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Fat (g)</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    >
                        Add Meal
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MealPlanner;
