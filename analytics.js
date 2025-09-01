// Chart configurations
const chartConfigs = {
    monthlyChart: {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        maxTicksLimit: 5
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    },
    categoryChart: {
        type: 'doughnut',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 5
                    }
                }
            },
            cutout: '60%'
        }
    },
    incomeChart: {
        type: 'pie',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 5
                    }
                }
            }
        }
    },
    expenseChart: {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        maxTicksLimit: 5
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    }
};

// Initialize charts
let charts = {};

function initializeCharts() {
    // Monthly Income vs Expenses Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    charts.monthlyChart = new Chart(monthlyCtx, {
        ...chartConfigs.monthlyChart,
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Income',
                    data: [],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.1,
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: [],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.1,
                    borderWidth: 2
                }
            ]
        }
    });

    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    charts.categoryChart = new Chart(categoryCtx, {
        ...chartConfigs.categoryChart,
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)',
                    'rgb(234, 179, 8)',
                    'rgb(168, 85, 247)'
                ],
                borderWidth: 1
            }]
        }
    });

    // Income Sources Chart
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    charts.incomeChart = new Chart(incomeCtx, {
        ...chartConfigs.incomeChart,
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(16, 185, 129)',
                    'rgb(5, 150, 105)',
                    'rgb(4, 120, 87)',
                    'rgb(6, 95, 70)'
                ],
                borderWidth: 1
            }]
        }
    });

    // Expense Categories Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    charts.expenseChart = new Chart(expenseCtx, {
        ...chartConfigs.expenseChart,
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: 'rgb(239, 68, 68)',
                borderWidth: 1
            }]
        }
    });
}

// Update charts with transaction data
function updateCharts(transactions) {
    // Group transactions by month
    const monthlyData = {};
    const categoryData = {};
    const incomeSources = {};
    const expenseCategories = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Monthly data
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            monthlyData[monthYear].income += transaction.amount;
        } else {
            monthlyData[monthYear].expense += transaction.amount;
        }

        // Category data
        if (!categoryData[transaction.category]) {
            categoryData[transaction.category] = 0;
        }
        categoryData[transaction.category] += transaction.amount;

        // Income/Expense specific data
        if (transaction.type === 'income') {
            if (!incomeSources[transaction.category]) {
                incomeSources[transaction.category] = 0;
            }
            incomeSources[transaction.category] += transaction.amount;
        } else {
            if (!expenseCategories[transaction.category]) {
                expenseCategories[transaction.category] = 0;
            }
            expenseCategories[transaction.category] += transaction.amount;
        }
    });

    // Update Monthly Chart
    const months = Object.keys(monthlyData).sort();
    charts.monthlyChart.data.labels = months;
    charts.monthlyChart.data.datasets[0].data = months.map(month => monthlyData[month].income);
    charts.monthlyChart.data.datasets[1].data = months.map(month => monthlyData[month].expense);
    charts.monthlyChart.update();

    // Update Category Distribution Chart
    charts.categoryChart.data.labels = Object.keys(categoryData);
    charts.categoryChart.data.datasets[0].data = Object.values(categoryData);
    charts.categoryChart.update();

    // Update Income Sources Chart
    charts.incomeChart.data.labels = Object.keys(incomeSources);
    charts.incomeChart.data.datasets[0].data = Object.values(incomeSources);
    charts.incomeChart.update();

    // Update Expense Categories Chart
    charts.expenseChart.data.labels = Object.keys(expenseCategories);
    charts.expenseChart.data.datasets[0].data = Object.values(expenseCategories);
    charts.expenseChart.update();
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    
    // Update charts whenever transactions change
    const updateChartsHandler = () => {
        const transactions = JSON.parse(localStorage.getItem('budgetBuddy_transactions') || '[]');
        updateCharts(transactions);
    };

    // Listen for transaction changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'budgetBuddy_transactions') {
            updateChartsHandler();
        }
    });

    // Initial update
    updateChartsHandler();
}); 