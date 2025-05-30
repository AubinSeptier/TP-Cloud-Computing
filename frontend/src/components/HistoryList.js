// HistoryList.js: A React component for displaying a list of BMI records with options to delete or view details of each record.
import React from 'react';
import { Link } from 'react-router-dom';
import imcService from '../services/imc';
import '../styles/HistoryList.css';

const HistoryList = ({ records, onDelete }) => {
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await imcService.deleteRecord(id);
                if (onDelete) {
                    onDelete(id);
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('An error occurred while deleting the record.');
            }
        }
    };

    if (!records || records.length === 0) {
        return <p className='text-center'>No records found.</p>;
    }

    return (
        <div className='history-list'>
            <h2>BMI History</h2>
            <div className='table-responsive'>
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Weight (kg)</th>
                            <th>Height (cm)</th>
                            <th>BMI</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id}>
                                <td>{record.created_at}</td>
                                <td>{record.weight}</td>
                                <td>{record.height}</td>
                                <td>{record.imc_value}</td>
                                <td className={getStatusClass(record.status)}>
                                    {record.status}
                                </td>
                                <td>
                                    <Link to={`/record/${record.id}`}
                                    className='btn btn-sm btn-info me-2'
                                    >
                                        Display
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(record.id)}
                                        className='btn btn-sm btn-danger'
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryList;