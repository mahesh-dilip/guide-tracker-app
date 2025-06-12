import axios from 'axios';

// The VITE_API_BASE_URL will be read from the Vercel environment variable in production.
// Locally (in dev mode), it will be undefined, so we default to a relative path '/api'
// which will use our Vite proxy.
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const createGuideFromText = (rawContent) => {
    return axios.post(`${API_URL}/guides/from-text`, { rawContent });
};

export const createGuideFromAudio = (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile); // Key 'audio' must match backend
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
    // We must use FormData to send files
    const formData = new FormData();
    formData.append('file', file); // The key 'file' must match the backend route

    return axios.post(`${API_URL}/guides/${guideId}/steps/${stepId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const exportGuideAs = (guideId, format) => {
    // We expect a file back, so the responseType must be 'blob'
    return axios.get(`${API_URL}/guides/${guideId}/export?format=${format}`, {
        responseType: 'blob',
    });
}; 