import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Meal {
    price: number;
    date: string;
}

interface SpendingChartProps {
    meals: Meal[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ meals }) => {
    // Process data: Group by last 7 days
    const processData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days: { date: string; dayName: string; amount: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            last7Days.push({
                date: d.toDateString(),
                dayName: days[d.getDay()],
                amount: 0
            });
        }

        meals.forEach(meal => {
            const mealDate = new Date(meal.date).toDateString();
            const dayEntry = last7Days.find(d => d.date === mealDate);
            if (dayEntry) {
                dayEntry.amount += meal.price;
            }
        });

        return last7Days;
    };

    const data = processData();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Weekly Spending</h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dayName" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']} />
                        <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SpendingChart;
