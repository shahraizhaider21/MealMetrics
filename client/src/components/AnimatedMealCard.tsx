import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Flame, DollarSign, Clock } from 'lucide-react';

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
    // const proteinPct = Math.min((meal.protein / safeGoals.protein) * 100, 100); // Unused
    // const carbsPct = Math.min((meal.carbs / safeGoals.carbs) * 100, 100); // Unused
    // const fatPct = Math.min((meal.fat / safeGoals.fat) * 100, 100); // Unused

    const handleDelete = () => {
        if (onDelete && window.confirm('Are you sure you want to delete this meal?')) {
            onDelete(meal._id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="glass rounded-2xl overflow-hidden group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out"
        >
            {/* Delete Button (Visible on Hover) */}
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-3 right-3 p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 border border-slate-200 shadow-sm"
                    title="Delete Meal"
                >
                    <Trash2 size={16} />
                </button>
            )}

            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{meal.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{new Date(meal.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-900 font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <DollarSign size={14} className="text-slate-500" />
                        {meal.price.toFixed(2)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Flame size={14} className="text-orange-500" />
                            <span className="text-xs font-medium text-slate-600">Calories</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{meal.calories}</p>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Protein</span>
                            <span className="font-medium text-slate-700">{meal.protein}g</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <motion.div
                                className="bg-blue-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.min((meal.protein / (safeGoals.protein / 3)) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            ></motion.div>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Carbs</span>
                            <span className="font-medium text-slate-700">{meal.carbs}g</span>
                        </div>
                        <div className="w-full bg-slate-100/50 rounded-full h-1.5">
                            <motion.div
                                className="bg-orange-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.min((meal.carbs / (safeGoals.carbs / 3)) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            ></motion.div>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Fat</span>
                            <span className="font-medium text-slate-700">{meal.fat}g</span>
                        </div>
                        <div className="w-full bg-slate-100/50 rounded-full h-1.5">
                            <motion.div
                                className="bg-amber-400 h-1.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.min((meal.fat / (safeGoals.fat / 3)) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            ></motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnimatedMealCard;
