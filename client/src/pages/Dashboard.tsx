import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { DollarSign, TrendingUp, Plus, AlertTriangle, Scale, Ruler, Activity, Flame } from 'lucide-react';
import AnimatedMealCard from '../components/AnimatedMealCard';
import EditProfileModal from '../components/EditProfileModal';
import AddMealModal from '../components/AddMealModal';
import SpendingChart from '../components/SpendingChart';
import WaterTracker from '../components/WaterTracker';
import Chatbot from '../components/Chatbot';

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
            const res = await axios.get('http://localhost:5000/api/meals');
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
            await axios.delete(`http://localhost:5000/api/meals/${id}`);
            // Optimistically update UI
            setMeals(meals.filter(meal => meal._id !== id));
            // Recalculate totals if necessary, or just fetchMeals to be safe
            fetchMeals();
        } catch (err) {
            console.error('Failed to delete meal', err);
            alert('Failed to delete meal');
        }
    };

    return (
        <div className="space-y-8 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                    Welcome, {auth?.user?.username || 'Guest'}!
                </h1>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition-colors font-medium shadow-sm"
                >
                    Edit Profile
                </button>
            </div>

            {/* Alerts */}
            <div className="space-y-3">
                {isOverBudget && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md shadow-sm flex items-center gap-3 animate-pulse" role="alert">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="font-bold text-lg">Warning</p>
                            <p>You have exceeded your monthly budget!</p>
                        </div>
                    </div>
                )}
                {isCaloriesExceeded && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-md shadow-sm flex items-center gap-3" role="alert">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="font-bold text-lg">Attention</p>
                            <p>Daily calorie limit reached.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Row 1: Your Stats & Daily Targets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Card: Your Stats */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-xl text-white transform hover:scale-[1.02] transition-transform duration-300">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6" />
                        Your Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <span className="text-indigo-100 text-sm flex items-center gap-1 mb-1"><Scale size={14} /> Weight</span>
                            <span className="text-2xl font-bold">{userStats.weight} kg</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-indigo-100 text-sm flex items-center gap-1 mb-1"><Ruler size={14} /> Height</span>
                            <span className="text-2xl font-bold">{userStats.height} cm</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-indigo-100 text-sm flex items-center gap-1 mb-1"><Activity size={14} /> BMI</span>
                            <span className="text-2xl font-bold">{goals.bmi}</span>
                            <span className="text-xs text-indigo-200 bg-white/20 px-2 py-0.5 rounded-full w-fit mt-1">{goals.bmiCategory}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-indigo-100 text-sm flex items-center gap-1 mb-1"><Flame size={14} /> Daily Goal</span>
                            <span className="text-2xl font-bold">{goals.calories} kcal</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-indigo-100 text-sm mb-1">Consumed Today</p>
                                <p className="text-3xl font-extrabold">{dailyConsumed.calories} kcal</p>
                            </div>
                            <div className={`text-sm px-3 py-1 rounded-full ${isCaloriesExceeded ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>
                                {Math.round((dailyConsumed.calories / goals.calories) * 100)}%
                            </div>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 mt-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-1000 ${isCaloriesExceeded ? 'bg-red-400' : 'bg-green-400'}`}
                                style={{ width: `${Math.min((dailyConsumed.calories / goals.calories) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Daily Targets */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Daily Targets</h2>
                    <div className="space-y-6">
                        {/* Protein */}
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-2 text-gray-600">
                                <span>Protein</span>
                                <span>{dailyConsumed.protein} / {goals.protein}g</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((dailyConsumed.protein / goals.protein) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        {/* Carbs */}
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-2 text-gray-600">
                                <span>Carbs</span>
                                <span>{dailyConsumed.carbs} / {goals.carbs}g</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-orange-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((dailyConsumed.carbs / goals.carbs) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        {/* Fat */}
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-2 text-gray-600">
                                <span>Fat</span>
                                <span>{dailyConsumed.fat} / {goals.fat}g</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-yellow-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((dailyConsumed.fat / goals.fat) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Monthly Budget (Full Width) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Monthly Budget</h2>
                            <p className="text-gray-500 text-sm">Keep track of your culinary expenses</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full md:w-auto px-4 md:px-12">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className={`${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-4 shadow-inner overflow-hidden">
                            <div
                                className={`h-4 rounded-full transition-all duration-1000 ease-out relative ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-600'}`}
                                style={{ width: `${percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Remaining</p>
                        <p className={`text-3xl font-extrabold ${isOverBudget ? 'text-red-500' : 'text-gray-800'}`}>
                            ${(budgetLimit - totalSpent).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">of ${budgetLimit.toFixed(2)} limit</p>
                    </div>
                </div>
            </div>

            {/* Row 3: Water Tracker & Spending Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Water Tracker */}
                <div className="h-full">
                    <WaterTracker />
                </div>

                {/* Spending Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <SpendingChart meals={meals} />
                </div>
            </div>

            {/* Row 3: Upcoming / Planned Meals */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        Upcoming / Planned
                    </h2>
                </div>

                {upcomingMeals.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Nothing planned yet. Use the Planner!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingMeals.map((meal) => (
                            <AnimatedMealCard key={meal._id} meal={meal} goals={goals} onDelete={handleDeleteMeal} />
                        ))}
                    </div>
                )}
            </div>

            {/* Row 4: Recent Meals */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        Recent Meals
                    </h2>
                </div>

                {recentMeals.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No meals tracked yet. Start by adding one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentMeals.map((meal) => (
                            <AnimatedMealCard key={meal._id} meal={meal} goals={goals} onDelete={handleDeleteMeal} />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            {/* Floating Action Button (FAB) - Moved to top right or kept as Add Meal? 
                The user requested Chatbot as a floating button bottom-right. 
                The current FAB is for Add Meal. 
                I should probably move the Add Meal button or keep them both.
                Let's keep Add Meal but maybe move it up or to the left?
                Or stack them?
                The Chatbot is fixed bottom-8 right-8.
                The Add Meal FAB is fixed bottom-8 right-8.
                Conflict!
                I will move Add Meal FAB to bottom-8 right-24 (left of Chatbot) or bottom-24 right-8 (above Chatbot).
                Let's move Add Meal to bottom-24 right-8.
            */}
            <button
                onClick={() => setIsAddMealModalOpen(true)}
                className="fixed bottom-28 right-8 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 hover:shadow-green-500/50 transition-all duration-300 z-40 group"
                aria-label="Add Meal"
            >
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
            <AddMealModal isOpen={isAddMealModalOpen} onClose={() => setIsAddMealModalOpen(false)} onMealAdded={fetchMeals} />
            <Chatbot />
        </div>
    );
};

export default Dashboard;
