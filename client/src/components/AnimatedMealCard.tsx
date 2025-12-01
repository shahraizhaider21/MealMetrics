import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Meal {
    _id: string;
    name: string;
    price: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
}

interface AnimatedMealCardProps {
    meal: Meal;
    goals?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    onDelete?: (id: string) => void;
}

const AnimatedMealCard: React.FC<AnimatedMealCardProps> = ({ meal, goals, onDelete }) => {
    // Default goals if not provided to avoid division by zero or undefined errors
    const safeGoals = goals || { protein: 150, carbs: 200, fat: 70 };

    // Calculate percentages based on dynamic goals
    const proteinPct = Math.min((meal.protein / safeGoals.protein) * 100, 100);
    const carbsPct = Math.min((meal.carbs / safeGoals.carbs) * 100, 100);
    const fatPct = Math.min((meal.fat / safeGoals.fat) * 100, 100);

    const handleDelete = () => {
        if (onDelete && window.confirm('Are you sure you want to delete this meal?')) {
            onDelete(meal._id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 relative group"
        >
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title="Delete Meal"
                >
                    <Trash2 size={18} />
                </button>
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 pr-6">{meal.name}</h3>
                    <p className="text-sm text-gray-500">{new Date(meal.date).toLocaleDateString()}</p>
                </div>
                <span className="text-lg font-bold text-green-600">${meal.price.toFixed(2)}</span>
            </div>

            <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">{meal.calories}</span>
                <span className="text-sm text-gray-500 ml-1">kcal</span>
            </div>

            <div className="space-y-3">
                {/* Protein */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">Protein</span>
                        <span className="text-gray-500">{meal.protein}g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${proteinPct}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-blue-500 h-2 rounded-full"
                        />
                    </div>
                </div>

                {/* Carbs */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">Carbs</span>
                        <span className="text-gray-500">{meal.carbs}g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${carbsPct}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="bg-orange-500 h-2 rounded-full"
                        />
                    </div>
                </div>

                {/* Fat */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">Fat</span>
                        <span className="text-gray-500">{meal.fat}g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${fatPct}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="bg-yellow-500 h-2 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnimatedMealCard;
