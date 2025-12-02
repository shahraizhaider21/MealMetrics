import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, type Variants } from 'framer-motion';
import { DollarSign, Plus, AlertTriangle, Activity, FileText, UtensilsCrossed } from 'lucide-react';
import { generateReport } from '../utils/ReportGenerator';
import AnimatedMealCard from '../components/AnimatedMealCard';
import EditProfileModal from '../components/EditProfileModal';
import AddMealModal from '../components/AddMealModal';
import SpendingChart from '../components/SpendingChart';
import WaterTracker from '../components/WaterTracker';
import Chatbot from '../components/Chatbot';
import PageTransition from '../components/PageTransition';
import AnimatedCounter from '../components/AnimatedCounter';
import API_URL from '../api';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};

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

const Dashboard = () => {
    const auth = useContext(AuthContext);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);

    const fetchMeals = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/meals`);
            // Ensure meals are sorted by date (newest first)
            const sortedMeals = res.data.sort((a: Meal, b: Meal) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMeals(sortedMeals);

            // Calculate Monthly Spent
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const monthlyMeals = sortedMeals.filter((meal: Meal) => {
                const mealDate = new Date(meal.date);
                return mealDate.getMonth() === currentMonth && mealDate.getFullYear() === currentYear;
            });

            const total = monthlyMeals.reduce((acc: number, meal: Meal) => acc + meal.price, 0);
            setTotalSpent(total);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchMeals();
        }
    }, [auth?.token]);

    const budgetLimit = auth?.user?.budgetLimit || 0;
    const percentage = budgetLimit > 0 ? Math.min((totalSpent / budgetLimit) * 100, 100) : 0;
    const isOverBudget = totalSpent > budgetLimit;

    // Dynamic Goals
    const goals = auth?.user?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 70, bmi: 0, bmiCategory: 'N/A' };
    const userStats = {
        weight: auth?.user?.weight || 0,
        height: auth?.user?.height || 0
    };

    // Calculate Daily Consumed
    const today = new Date().toDateString();
    const todaysMeals = meals.filter((meal: Meal) => new Date(meal.date).toDateString() === today);
    const dailyConsumed = todaysMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const isCaloriesExceeded = dailyConsumed.calories > goals.calories;

    // Logic for Upcoming vs Recent Meals
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const pastOrTodayMeals = meals.filter(meal => new Date(meal.date) < startOfTomorrow);
    const upcomingMeals = meals.filter(meal => new Date(meal.date) >= startOfTomorrow);

    // Sort: Past/Today = Newest First
    pastOrTodayMeals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Sort: Upcoming = Soonest First
    upcomingMeals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Recent Meals (Last 5 of past/today)
    const recentMeals = pastOrTodayMeals.slice(0, 5);

    const handleDeleteMeal = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/meals/${id}`);
            // Optimistically update UI
            setMeals(meals.filter(meal => meal._id !== id));
            // Recalculate totals if necessary, or just fetchMeals to be safe
            fetchMeals();
        } catch (err) {
            console.error('Failed to delete meal', err);
            alert('Failed to delete meal');
        }
    };

    const handleExportReport = () => {
        if (!auth?.user) return;

        generateReport({
            username: auth.user.username,
            meals: meals,
            totalSpent: totalSpent,
            budgetLimit: budgetLimit
        });
    };

    return (
        <PageTransition>
            <motion.div
                className="space-y-8 pb-24"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" variants={itemVariants} viewport={{ once: true }}>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back, {auth?.user?.username}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportReport}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <FileText size={18} />
                            <span>Export Report</span>
                        </button>
                        <button
                            onClick={() => setIsAddMealModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                        >
                            <Plus size={18} />
                            <span>Add Meal</span>
                        </button>
                    </div>
                </motion.div>

                {/* Alerts */}
                <div className="space-y-3">
                    {isOverBudget && (
                        <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3" role="alert">
                            <AlertTriangle size={20} />
                            <div>
                                <p className="font-semibold text-sm">Budget Exceeded</p>
                                <p className="text-sm">You have exceeded your monthly budget.</p>
                            </div>
                        </motion.div>
                    )}
                    {isCaloriesExceeded && (
                        <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg flex items-center gap-3" role="alert">
                            <AlertTriangle size={20} />
                            <div>
                                <p className="font-semibold text-sm">Calorie Limit Reached</p>
                                <p className="text-sm">You have reached your daily calorie goal.</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Row 1: Your Stats & Daily Targets */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants} viewport={{ once: true }}>
                    {/* Hero Card: Your Stats */}
                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out text-white">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-white/80" />
                            Your Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <span className="text-white/70 text-xs uppercase tracking-wider font-medium mb-1">Weight</span>
                                <span className="text-2xl font-bold text-white">{userStats.weight} <span className="text-sm text-white/60 font-normal">kg</span></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/70 text-xs uppercase tracking-wider font-medium mb-1">Height</span>
                                <span className="text-2xl font-bold text-white">{userStats.height} <span className="text-sm text-white/60 font-normal">cm</span></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/70 text-xs uppercase tracking-wider font-medium mb-1">BMI</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">
                                        <AnimatedCounter value={goals.bmi} />
                                    </span>
                                    <span className="text-xs text-violet-600 bg-white px-2 py-0.5 rounded-full font-bold">{goals.bmiCategory}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/70 text-xs uppercase tracking-wider font-medium mb-1">Daily Goal</span>
                                <span className="text-2xl font-bold text-white">
                                    <AnimatedCounter value={goals.calories} /> <span className="text-sm text-white/60 font-normal">kcal</span>
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-white/70 text-xs uppercase tracking-wider font-medium mb-1">Consumed Today</p>
                                    <p className="text-3xl font-bold text-white">{dailyConsumed.calories} <span className="text-lg text-white/60 font-normal">kcal</span></p>
                                </div>
                                <div className={`text-xs font-medium px-2 py-1 rounded-md ${isCaloriesExceeded ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>
                                    {Math.round((dailyConsumed.calories / goals.calories) * 100)}%
                                </div>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2">
                                <motion.div
                                    className={`h-2 rounded-full ${isCaloriesExceeded ? 'bg-red-400' : 'bg-white'}`}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.min((dailyConsumed.calories / goals.calories) * 100, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Targets */}
                    <div className="glass p-6 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Daily Targets</h2>
                        <div className="space-y-6">
                            {/* Protein */}
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2 text-slate-600">
                                    <span>Protein</span>
                                    <span className="text-slate-900">{dailyConsumed.protein} / {goals.protein}g</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="bg-slate-800 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min((dailyConsumed.protein / goals.protein) * 100, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    ></motion.div>
                                </div>
                            </div>
                            {/* Carbs */}
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2 text-slate-600">
                                    <span>Carbs</span>
                                    <span className="text-slate-900">{dailyConsumed.carbs} / {goals.carbs}g</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="bg-slate-600 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min((dailyConsumed.carbs / goals.carbs) * 100, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    ></motion.div>
                                </div>
                            </div>
                            {/* Fat */}
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2 text-slate-600">
                                    <span>Fat</span>
                                    <span className="text-slate-900">{dailyConsumed.fat} / {goals.fat}g</span>
                                </div>
                                <div className="w-full bg-slate-100/50 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="bg-amber-400 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min((dailyConsumed.fat / goals.fat) * 100, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Row 2: Monthly Budget (Full Width) */}
                <motion.div className="glass rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out p-6" variants={itemVariants} viewport={{ once: true }}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">Monthly Budget</h2>
                                <p className="text-slate-500 text-sm">Expense tracking</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full md:w-auto px-4 md:px-12">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span className="text-slate-600">Used</span>
                                <span className={`${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className={`h-3 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-slate-800'}`}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                >
                                </motion.div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-1">Remaining</p>
                            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                                $<AnimatedCounter value={budgetLimit - totalSpent} />
                            </p>
                            <p className="text-xs text-slate-400">of ${budgetLimit.toFixed(2)} limit</p>
                        </div>
                    </div>
                </motion.div>

                {/* Row 3: Water Tracker & Spending Chart */}
                <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants} viewport={{ once: true }}>
                    {/* Water Tracker */}
                    <div className="h-full">
                        <WaterTracker />
                    </div>

                    {/* Spending Chart */}
                    <div className="lg:col-span-2 glass p-6 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out">
                        <SpendingChart meals={meals} />
                    </div>
                </motion.div>

                {/* Row 3: Upcoming / Planned Meals */}
                <motion.div variants={itemVariants} viewport={{ once: true }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                            Upcoming / Planned
                        </h2>
                    </div>

                    {upcomingMeals.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                            <div className="p-3 bg-slate-100 rounded-full">
                                <UtensilsCrossed className="text-slate-400" size={24} />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No meals planned yet. Start by adding one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingMeals.map((meal) => (
                                <AnimatedMealCard key={meal._id} meal={meal} goals={goals} onDelete={handleDeleteMeal} />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Row 4: Recent Meals */}
                <motion.div variants={itemVariants} viewport={{ once: true }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                            Recent Meals
                        </h2>
                    </div>

                    {recentMeals.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                            <div className="p-3 bg-slate-100 rounded-full">
                                <UtensilsCrossed className="text-slate-400" size={24} />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No meals tracked yet. Start by adding one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentMeals.map((meal) => (
                                <AnimatedMealCard key={meal._id} meal={meal} goals={goals} onDelete={handleDeleteMeal} />
                            ))}
                        </div>
                    )}
                </motion.div>

                <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
                <AddMealModal isOpen={isAddMealModalOpen} onClose={() => setIsAddMealModalOpen(false)} onMealAdded={fetchMeals} />
                <Chatbot />
            </motion.div>
        </PageTransition>
    );
};

export default Dashboard;
