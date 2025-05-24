import api from './api';

const imcService = {
    calculateIMC: async (weight, height) => {
        try {
            const response = await api.post('/imc/calculate_imc', {weight, height});
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error occurred while calculating IMC' };
        }
    },

    getHistory: async () => {
        try {
            const response = await api.get('/imc/history');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error occurred while fetching IMC history' };
        }
    },

    getRecord: async (id) => {
        try {
            const response = await api.get(`/imc/record/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error occurred while fetching IMC record' };
        }
    },

    deleteRecord: async (id) => {
        try {
            const response = await api.delete(`/imc/record/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error occurred while deleting IMC record' };
        }
    }
};

export default imcService;