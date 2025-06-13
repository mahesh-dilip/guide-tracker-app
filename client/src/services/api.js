import axios from 'axios';

// Get the base URL for the backend from the environment variable.
const RENDER_BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

// If we are in production (VITE_API_BASE_URL is set), we construct the full URL.
// Otherwise (in local development), we use a relative path for the Vite proxy.
const API_URL = RENDER_BACKEND_URL ? `${RENDER_BACKEND_URL}/api` : '/api';

export const createGuideFromText = (rawContent) => {
    // Correct endpoint is /guides
    return axios.post(`${API_URL}/guides`, { rawContent });
};

export const createGuideFromAudio = (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return axios.post(`${API_URL}/guides/from-audio`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getGuide = (guideId) => {
    return axios.get(`${API_URL}/guides/${guideId}`);
};

export const toggleStep = (guideId, stepId) => {
    return axios.put(`${API_URL}/guides/${guideId}/steps/${stepId}/complete`);
};

export const addNote = (guideId, stepId, content) => {
    return axios.post(`${API_URL}/guides/${guideId}/steps/${stepId}/notes`, { content });
};

export const addAttachment = (guideId, stepId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/guides/${guideId}/steps/${stepId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const exportGuideAs = (guideId, format) => {
    return axios.get(`${API_URL}/guides/${guideId}/export?format=${format}`, {
        responseType: 'blob',
    });
}; 