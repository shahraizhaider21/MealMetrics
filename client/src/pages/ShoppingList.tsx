import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Printer, CheckSquare, Calendar } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import API_URL from '../api';

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

interface DayGroup {
    date: string;
    meals: Meal[];
}

const ShoppingList = () => {
    const auth = useContext(AuthContext);
    const [upcomingMeals, setUpcomingMeals] = useState<DayGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const [ingredientsMap, setIngredientsMap] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const fetchMealsAndIngredients = async () => {
            if (!auth?.token) return;

            try {
                const res = await axios.get(`${API_URL}/api/meals`);
                const allMeals: Meal[] = res.data;

                // Filter for upcoming meals (today and future)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const futureMeals = allMeals.filter(meal => {
                    const mealDate = new Date(meal.date);
                    return mealDate >= today;
                });

                // Group by Date
                const grouped: Record<string, Meal[]> = {};
                futureMeals.forEach(meal => {
                    const dateKey = new Date(meal.date).toDateString();
                    if (!grouped[dateKey]) {
                        grouped[dateKey] = [];
                    }
                    grouped[dateKey].push(meal);
                });

                // Convert to array and sort by date
                const groupedArray: DayGroup[] = Object.keys(grouped).map(date => ({
                    date,
                    meals: grouped[date]
                })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setUpcomingMeals(groupedArray);

                // Fetch Ingredients from AI
                if (futureMeals.length > 0) {
                    const mealNames = Array.from(new Set(futureMeals.map(m => m.name)));
                    const aiRes = await axios.post('http://localhost:5000/api/ai/ingredients', { meals: mealNames });

                    // Expecting { "Meal Name": ["Ing 1", "Ing 2"] }
                    setIngredientsMap(aiRes.data);
                }

            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMealsAndIngredients();
    }, [auth?.token]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="text-center py-10">Loading shopping list...</div>;
    }

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto pb-20 print:pb-0">
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <CheckSquare className="w-8 h-8 text-green-600" />
                            Smart Shopping List
                        </h1>
                        <p className="text-gray-500 mt-1">Ingredients for your upcoming meals</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                    >
                        <Printer size={20} />
                        Print List
                    </button>
                </div>

                {/* Print Header */}
                <div className="hidden print:block mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {upcomingMeals.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Upcoming Meals</h3>
                        <p className="text-gray-500">Add meals to your planner to generate a shopping list.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {upcomingMeals.map((group) => (
                            <div key={group.date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <h2 className="font-semibold text-gray-800">
                                        {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-2">
                                    {group.meals.map((meal) => (
                                        <div key={meal._id} className="flex justify-between items-center">
                                            <h3 className="font-medium text-gray-800">{meal.name}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* AI Shopping List Per Meal */}
                        {Object.keys(ingredientsMap).length > 0 && (
                            <div className="space-y-6 mt-8">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <CheckSquare className="w-6 h-6 text-indigo-600" />
                                    AI Suggested Ingredients
                                </h2>
                                {Object.entries(ingredientsMap).map(([mealName, ingredients]) => (
                                    <div key={mealName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid">
                                        <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100">
                                            <h3 className="font-semibold text-indigo-900">{mealName}</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {ingredients.map((ingredient, idx) => (
                                                    <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                                        <div className="relative flex items-center">
                                                            <input type="checkbox" className="peer w-4 h-4 border-2 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-all checked:border-indigo-600" />
                                                            <CheckSquare className="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity scale-50 peer-checked:scale-100" size={12} />
                                                        </div>
                                                        <span className="text-gray-600 group-hover:text-gray-900 peer-checked:text-gray-400 peer-checked:line-through transition-colors text-sm">
                                                            {ingredient}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default ShoppingList;
