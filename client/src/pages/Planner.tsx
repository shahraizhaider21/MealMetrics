import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import AddMealModal from '../components/AddMealModal';

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

const Planner = () => {
    const auth = useContext(AuthContext);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Calculate start of week (Monday)
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    useEffect(() => {
        setCurrentWeekStart(getStartOfWeek(new Date()));
    }, []);

    const fetchMeals = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/meals');
            setMeals(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchMeals();
        }
    }, [auth?.token]);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(currentWeekStart.getDate() + i);
        return d;
    });

    const getMealsForDate = (date: Date) => {
        return meals.filter(meal => new Date(meal.date).toDateString() === date.toDateString());
    };

    const handleAddMeal = (date: Date) => {
        setSelectedDate(date);
        setIsAddMealModalOpen(true);
    };

    const changeWeek = (offset: number) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + (offset * 7));
        setCurrentWeekStart(newStart);
    };

    const handleDeleteMeal = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/meals/${id}`);
            setMeals(meals.filter(meal => meal._id !== id));
        } catch (err) {
            console.error('Failed to delete meal', err);
            alert('Failed to delete meal');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 flex items-center gap-2">
                    <Calendar className="text-green-600" />
                    Weekly Planner
                </h1>
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm">
                    <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-700">
                        {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(new Date(currentWeekStart).setDate(currentWeekStart.getDate() + 6)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, index) => {
                    const dayMeals = getMealsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const totalCals = dayMeals.reduce((acc, meal) => acc + meal.calories, 0);
                    const totalPrice = dayMeals.reduce((acc, meal) => acc + meal.price, 0);

                    return (
                        <div key={index} className={`flex flex-col h-full min-h-[400px] rounded-xl border ${isToday ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white'} shadow-sm overflow-hidden`}>
                            {/* Header */}
                            <div className={`p-3 text-center border-b ${isToday ? 'bg-green-100 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                <p className={`text-sm font-bold ${isToday ? 'text-green-700' : 'text-gray-500'}`}>
                                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                                </p>
                                <p className={`text-lg font-extrabold ${isToday ? 'text-green-800' : 'text-gray-800'}`}>
                                    {day.getDate()}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                                {dayMeals.map(meal => (
                                    <div key={meal._id} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                                        <button
                                            onClick={() => handleDeleteMeal(meal._id)}
                                            className="absolute top-1 right-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete"
                                        >
                                            &times;
                                        </button>
                                        <div className="flex justify-between items-start pr-4">
                                            <p className="font-semibold text-gray-800 text-sm truncate">{meal.name}</p>
                                            <span className="text-xs font-bold text-green-600">${meal.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-500">{meal.calories} kcal</span>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleAddMeal(day)}
                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors flex justify-center items-center gap-1 text-sm font-medium mt-2"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>

                            {/* Footer Summary */}
                            <div className="p-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                                <span>{totalCals} kcal</span>
                                <span>${totalPrice.toFixed(0)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AddMealModal
                isOpen={isAddMealModalOpen}
                onClose={() => setIsAddMealModalOpen(false)}
                onMealAdded={fetchMeals}
                defaultDate={selectedDate}
            />
        </div>
    );
};

export default Planner;
