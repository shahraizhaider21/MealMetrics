import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Droplets } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../api';

const WaterTracker = () => {
    const auth = useContext(AuthContext);
    const [intake, setIntake] = useState(0);
    const goal = 2500; // Default goal

    useEffect(() => {
        if (auth?.user) {
            // Prefer the simple waterIntake field if available, otherwise fallback to logs
            if (auth.user.waterIntake !== undefined) {
                setIntake(auth.user.waterIntake);
            } else if (auth.user.waterLogs) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todayLog = auth.user.waterLogs.find((log: any) => {
                    const logDate = new Date(log.date);
                    logDate.setHours(0, 0, 0, 0);
                    return logDate.getTime() === today.getTime();
                });

                if (todayLog) {
                    setIntake(todayLog.amount);
                } else {
                    setIntake(0);
                }
            }
        }
    }, [auth?.user]);

    const updateWater = async (newAmount: number) => {
        if (!auth?.user) return;

        const clampedAmount = Math.max(0, newAmount);
        setIntake(clampedAmount);

        try {
            await axios.put(`${API_URL}/api/auth/water`, {
                userId: auth.user.id, // Assuming user object has id
                date: new Date(),
                amount: clampedAmount
            });

            // Optimistically update context if possible, or trigger a reload
            // For now, we rely on local state for immediate feedback
            // Ideally, we should update the auth context user object here
            // Optimistically update context if possible, or trigger a reload
            // For now, we rely on local state for immediate feedback
            // Ideally, we should update the auth context user object here
            if (auth.user) {
                // Update the local user object in context (if possible, though context might be read-only without a setter)
                // Since we can't easily update context deep state, we rely on the fact that we just updated the backend.
                // However, for "persistence" across reloads, the backend update is key.
                // For immediate UI, 'intake' state is enough.
                // We can manually update the auth.user object reference if we want to be hacky, but better to just rely on local state.
                auth.user.waterIntake = clampedAmount;
            }

        } catch (err) {
            console.error("Failed to update water", err);
        }
    };

    const percentage = Math.min((intake / goal) * 100, 100);
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 ease-out flex flex-col items-center h-full justify-between">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 w-full">
                <div className="p-1.5 bg-blue-50 rounded-md">
                    <Droplets className="text-blue-500 w-4 h-4" />
                </div>
                Hydration
            </h3>

            <div className="relative flex items-center justify-center mb-6">
                {/* SVG Circular Progress */}
                <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-slate-200"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className="text-blue-600"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{Math.round(percentage)}%</span>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Daily Goal</span>
                </div>
            </div>

            <div className="text-center mb-6">
                <p className="text-3xl font-bold text-slate-900">{intake} <span className="text-lg text-slate-400 font-normal">ml</span></p>
                <p className="text-slate-500 text-sm">of {goal}ml goal</p>
            </div>

            <div className="flex items-center gap-4 w-full">
                <button
                    onClick={() => updateWater(intake - 250)}
                    className="p-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    disabled={intake <= 0}
                >
                    <Minus size={20} />
                </button>
                <button
                    onClick={() => updateWater(intake + 250)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                    <Plus size={18} />
                    Add 250ml
                </button>
            </div>
        </div>
    );
};

export default WaterTracker;
