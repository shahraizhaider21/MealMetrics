import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import API_URL from '../api';

interface Meal {
    _id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
}

const Analysis = () => {
    const auth = useContext(AuthContext);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [macroData, setMacroData] = useState<any[]>([]);

    useEffect(() => {
        const fetchMeals = async () => {
            if (!auth?.token) return;
            try {
                const res = await axios.get(`${API_URL}/api/meals`);
                const allMeals: Meal[] = res.data;
                processData(allMeals);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMeals();
    }, [auth?.token]);

    const processData = (data: Meal[]) => {
        const now = new Date();
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 6);
        last7Days.setHours(0, 0, 0, 0);

        const recentMeals = data.filter(meal => new Date(meal.date) >= last7Days);

        // 1. Macro Distribution (Total for period)
        const totalMacros = recentMeals.reduce((acc, meal) => ({
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fat: acc.fat + meal.fat
        }), { protein: 0, carbs: 0, fat: 0 });

        setMacroData([
            { name: 'Protein', value: totalMacros.protein, color: '#6366f1' }, // Indigo
            { name: 'Carbs', value: totalMacros.carbs, color: '#10b981' },   // Emerald
            { name: 'Fat', value: totalMacros.fat, color: '#64748b' },       // Slate
        ]);

        // 2. Calories vs Goal (Daily)
        const dailyMap = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date(last7Days);
            d.setDate(last7Days.getDate() + i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            dailyMap.set(dateStr, 0);
        }

        recentMeals.forEach(meal => {
            const d = new Date(meal.date);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyMap.has(dateStr)) {
                dailyMap.set(dateStr, dailyMap.get(dateStr) + meal.calories);
            }
        });

        const goal = auth?.user?.goals?.calories || 2000;
        const chartData = Array.from(dailyMap).map(([name, calories]) => ({
            name,
            calories,
            goal
        }));
        setWeeklyData(chartData);
    };

    return (
        <PageTransition>
            <div className="space-y-8 pb-24 pt-20 px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis</h1>
                    <p className="text-slate-500 mt-1">Nutritional breakdown for the last 7 days.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Macro Distribution - Donut Chart */}
                    <div className="glass p-6 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">What you eat</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={macroData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {macroData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Calorie Consistency - Bar Chart */}
                    <div className="glass p-6 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Consistency Score</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 4 }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="calories" name="Calories" fill="#0f172a" radius={[6, 6, 6, 6]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default Analysis;
