import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Droplets } from 'lucide-react';

const WaterTracker = () => {
    const [intake, setIntake] = useState(1250); // Start with some water for demo
    const goal = 2500;
    const percentage = Math.min((intake / goal) * 100, 100);

    const addWater = (amount: number) => {
        setIntake(prev => Math.min(prev + amount, goal + 500)); // Allow slight overflow
    };

    const removeWater = (amount: number) => {
        setIntake(prev => Math.max(prev - amount, 0));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets className="text-blue-500" />
                Hydration
            </h3>

            {/* Glass Container */}
            <div className="relative w-32 h-48 border-4 border-gray-200 border-t-0 rounded-b-3xl bg-gray-50 overflow-hidden mb-6">
                {/* Liquid */}
                <motion.div
                    className="absolute bottom-0 left-0 w-full bg-blue-400 opacity-80"
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    {/* Wave Animation */}
                    <motion.div
                        className="absolute -top-3 left-0 w-[200%] h-6 bg-blue-400 rounded-[50%]"
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        style={{ opacity: 0.8 }}
                    />
                </motion.div>

                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="text-2xl font-bold text-gray-800 drop-shadow-md">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>

            <div className="text-center mb-4">
                <p className="text-gray-500 text-sm">Goal: {goal}ml</p>
                <p className="text-2xl font-bold text-blue-600">{intake}ml</p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => removeWater(250)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                    <Minus size={20} />
                </button>
                <button
                    onClick={() => addWater(250)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-md"
                >
                    <Plus size={18} />
                    250ml
                </button>
            </div>
        </div>
    );
};

export default WaterTracker;
