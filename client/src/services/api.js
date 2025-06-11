import axios from 'axios';

export const createGuideFromText = (rawContent) => {
    return axios.post('/api/guides/from-text', { rawContent });
};

export const createGuideFromAudio = (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile); // Key 'audio' must match backend
    return axios.post('/api/guides/from-audio', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getGuide = (guideId) => {
    return axios.get(`/api/guides/${guideId}`);
};

export const toggleStep = (guideId, stepId) => {
    return axios.put(`/api/guides/${guideId}/steps/${stepId}/complete`);
};

export const addNote = (guideId, stepId, content) => {
    return axios.post(`/api/guides/${guideId}/steps/${stepId}/notes`, { content });
};

export const addAttachment = (guideId, stepId, file) => {
    // We must use FormData to send files
    const formData = new FormData();
    formData.append('file', file); // The key 'file' must match the backend route

    return axios.post(`/api/guides/${guideId}/steps/${stepId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const exportGuideAs = (guideId, format) => {
    // We expect a file back, so the responseType must be 'blob'
    return axios.get(`/api/guides/${guideId}/export?format=${format}`, {
        responseType: 'blob',
    });
}; 