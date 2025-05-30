// Dashboard.js: A React component for the user dashboard that displays the user's BMI calculator and history of BMI records, fetching data from services and handling user interactions.
import React, { useState, useEffect} from 'react';
import IMCCalculator from '../components/IMCCalculator';
import HistoryList from '../components/HistoryList';
import imcService from '../services/imc';
import authService from '../services/auth';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);

                const response = await imcService.getHistory();
                setRecords(response.history || []);
            } catch (error) {
                setError('An error occurred while fetching data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleIMCCalculated = (newRecord) => {
        setRecords([newRecord, ...records]);
    };

    const handleDeleteRecord = (id) => {
        setRecords(records.filter(record => record.id !== id));
    };

    if (loading) {
        return <div className='text-center my-5'>Loading...</div>;
    }

    return (
        <div className='dashboard-container'>
            <div className='welcome-section'>
                <h1>Hi, {user?.username}!</h1>
                <p>Welcome to your BMI tracking dashboard</p>
            </div>
            <div className='row'>
                <div className='col-lg-4'>
                    <div className='card mb-4'>
                        <div className='card-body'>
                            <IMCCalculator onCalculate={handleIMCCalculated} />
                        </div>
                    </div>
                </div>
                <div className='col-lg-8'>
                    <div className='card'>
                        <div className='card-body'>
                            {error ? (
                                <div className='alert alert-danger'>{error}</div>
                            ) : (
                                <HistoryList records={records} onDelete={handleDeleteRecord} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;