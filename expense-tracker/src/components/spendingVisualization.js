import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import './spendingVisualization.css';

const SpendingVisualization = () => {
    const [spendingData, setSpendingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpendingData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/spending', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch spending data');
                }

                const data = await response.json();
                setSpendingData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSpendingData();
    }, []);

    const getChartData = () => {
        const categories = spendingData.map(item => item.category);
        const amounts = spendingData.map(item => item.amount);

        return {
            labels: categories,
            datasets: [
                {
                    label: 'Spending',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="spending-visualization">
            <div className="chart-container">
                <Bar data={getChartData()} options={{ responsive: true }} />
            </div>
            <div className="chart-container">
                <Pie data={getChartData()} options={{ responsive: true }} />
            </div>
        </div>
    );
};

export default SpendingVisualization;