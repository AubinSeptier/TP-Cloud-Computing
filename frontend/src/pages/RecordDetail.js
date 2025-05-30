// RecordDetail.js: A React component for displaying the details of a specific BMI record, allowing users to view, delete, or navigate back to the dashboard.
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import imcService from '../services/imc';
import '../styles/RecordDetail.css';

const RecordDetail = () => {
    const { id } = useParams();
    const navigate  = useNavigate();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await imcService.getRecord(id);
                setRecord(response.record);
            } catch (error) {
                setError('An error occurred while fetching the record');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await imcService.deleteRecord(id);
                navigate('/dashboard', { state: { message: 'Record deleted successfully!'} });
            } catch (error) {
                setError('An error occured while deleting the record');
                console.error(error);
            }
        }
    };

    if (loading) {
        return <div className='text-center my-5'>Loading...</div>
    }

    if (error) {
        return (
            <div className='alert alert-danger m-4' role='alert'>
                {error}
                <Link to='/dashboard' className='btn btn-primary ms-3'>
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    if (!record) {
        return (
            <div className='alert alert-warning m-4' role='alert'>
                No record found.
                <Link to='/dashboard' className='btn btn-primary ms-3'>
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'Underweight':
                return 'text-warning';
            case 'Normal weight':
                return 'text-success';
            case 'Overweight':
                return 'text-danger';
            default:
                return 'text-danger';
        }
    };

    return (
        <div className='record-detail-container'>
            <div className='card'>
                <div className='card-header'>
                    <h2>BMI Record Detail</h2>
                </div>
            </div>
            <div className='card-body'>
                <div className='row'>
                    <div className='col-md-6'>
                        <h3>Informations</h3>
                        <p><strong>Date:</strong> {record.created_at}</p>
                        <p><strong>Weight:</strong> {record.weight}</p>
                        <p><strong>Height:</strong> {record.height}</p>
                    </div>
                    <div className='col-md-6'>
                        <h3>Results</h3>
                        <p><strong>BMI:</strong> {record.imc_value}</p>
                        <p><strong>Status:</strong> <span className={getStatusClass(record.status)}>{record.status}</span></p>
                    </div>
                </div>
                <div className='imc-info mt-4'>
                    <h4>What does your BMI mean?</h4>
                    <ul>
                        <li><strong>Below 18.5:</strong>Underweight</li>
                        <li><strong>18.5 - 24.9:</strong>Normal Weight</li>
                        <li><strong>25 - 29.9:</strong>Overweight</li>
                        <li><strong>30 - 34.9:</strong>Obesity (class I)</li>
                        <li><strong>35 - 39.9:</strong>Obesity (class II)</li>
                        <li><strong>40 and above:</strong>Obesity (class III)</li>
                    </ul>
                </div>
                <div className='card-footer'>
                    <Link to='/dashboard' className='btn btn-primary me-2'>
                        Back to Dashboard
                    </Link>
                    <button onClick={handleDelete} className='btn btn-danger'>
                        Delete Record
                    </button>
                </div>
            </div>            
        </div>
    );
};

export default RecordDetail;