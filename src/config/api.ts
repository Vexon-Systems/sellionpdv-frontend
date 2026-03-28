import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api', 
    
    // WithCredentials permitirá o envio de cookies ao servidor
    withCredentials: true, 
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
        }
        
        return Promise.reject(error);
    }
);