import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Meal {
    name: string;
    price: number;
    date: string;
    calories: number;
}

interface ReportData {
    username: string;
    meals: Meal[];
    totalSpent: number;
    budgetLimit: number;
}

export const generateReport = (data: ReportData) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('MealMetrics Weekly Report', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for: ${data.username}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);

    // Budget Summary
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Budget Overview', 14, 55);

    doc.setFontSize(12);
    doc.text(`Total Budget: $${data.budgetLimit.toFixed(2)}`, 14, 65);
    doc.text(`Total Spent: $${data.totalSpent.toFixed(2)}`, 14, 72);

    const remaining = data.budgetLimit - data.totalSpent;
    const isOver = remaining < 0;

    doc.setTextColor(isOver ? 220 : 40, isOver ? 50 : 150, 50);
    doc.text(`Remaining: $${remaining.toFixed(2)}`, 14, 79);

    // Meals Table
    doc.setTextColor(40, 40, 40);
    doc.text('Recent Meals', 14, 95);

    const tableData = data.meals.map(meal => [
        meal.name,
        `$${meal.price.toFixed(2)}`,
        meal.calories,
        new Date(meal.date).toLocaleDateString()
    ]);

    autoTable(doc, {
        startY: 100,
        head: [['Meal Name', 'Price', 'Calories', 'Date']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
        doc.text('MealMetrics - Financial & Nutritional Tracking', 14, 285);
    }

    doc.save(`MealMetrics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
