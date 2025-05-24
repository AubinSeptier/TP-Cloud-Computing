import React, { useState } from 'react';
import imcService from '../services/imc';
// import '../styles/IMCCalculator.css';

const IMCCalculator = ({ onCalculate }) => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weight || !height) {
            setError('Please fullfill all fields');
            return;
        }


        try {
            setLoading(true);
            setError('');
            const response = await imcService.calculateIMC(parseFloat(weight), parseFloat(height));
            if (onCalculate) {
                onCalculate(response.imc_record);
            }
            setWeight('');
            setHeight('');
        } catch (error) {
            setError(error.message || 'An error occured while calculating IMC');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='imc-calculator'>
            <h2>Calculate your BMI</h2>
            {error && <div className='alert alert-danger'>{error}</div>} 
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='weight' className='form-label'>
                        Weight (kg)
                    </label>
                    <input
                        type='number'
                        className='form-control'
                        id='weight'
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder='"Enter your weight (kg)'
                        min='20'
                        max='500'
                        step='0.1'
                        required
                    />
                </div>
                <div className='mb-3'>
                    <label htmlFor='height' className='form-label'>
                        Height (cm)
                    </label>
                    <input
                        type='number'
                        className='form-control'
                        id='height'
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder='"Enter your height (cm)'
                        min='50'
                        max='300'
                        step='0.1'
                        required
                    />
                </div>
                <button 
                    type='submit'
                    className='btn btn-primary'
                    disabled={loading}
                >
                    {loading ? 'Calculating...' : 'Calculate'}
                </button>
            </form>
        </div>
    )
};

export default IMCCalculator;