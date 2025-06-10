import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGuideFromText } from '../services/api';

const CreateGuideView = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError('Please paste some content first.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await createGuideFromText(text);
            const { guideId } = response.data;
            navigate(`/guide/${guideId}`);
        } catch (err) {
            setError('Failed to create guide. The AI might be busy. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Guide Tracker</h1>
                <p className="text-center text-gray-500 mb-6">Paste any recipe, tutorial, or set of instructions to get started.</p>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <textarea
                        className="w-full h-60 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Paste your content here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isLoading}
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? 'Processing...' : 'Create Interactive Guide'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGuideView; 