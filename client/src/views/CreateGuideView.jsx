import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGuideFromText, createGuideFromAudio } from '../services/api';

const CreateGuideView = () => {
    const [inputType, setInputType] = useState('text'); // 'text' or 'audio'
    const [text, setText] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setAudioFile(event.target.files[0]);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        try {
            let response;
            if (inputType === 'text') {
                if (!text.trim()) {
                    setError('Please paste some content first.');
                    setIsLoading(false);
                    return;
                }
                response = await createGuideFromText(text);
            } else {
                if (!audioFile) {
                    setError('Please select an audio file first.');
                    setIsLoading(false);
                    return;
                }
                response = await createGuideFromAudio(audioFile);
            }
            
            const { guideId } = response.data;
            navigate(`/guide/${guideId}`);

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to create guide. Please try again.';
            setError(errorMsg);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Guide Tracker</h1>
                <p className="text-center text-gray-500 mb-6">Create an interactive guide from text or audio.</p>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* Tab Interface */}
                    <div className="flex border-b mb-4">
                        <button 
                            onClick={() => setInputType('text')} 
                            className={`py-2 px-4 font-semibold ${inputType === 'text' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        >
                            From Text
                        </button>
                        <button 
                            onClick={() => setInputType('audio')} 
                            className={`py-2 px-4 font-semibold ${inputType === 'audio' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        >
                            From Audio
                        </button>
                    </div>

                    {/* Conditional Rendering based on tab */}
                    {inputType === 'text' ? (
                        <textarea
                            className="w-full h-60 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Paste your content here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isLoading}
                        />
                    ) : (
                        <div className="h-60 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md">
                            <input 
                                type="file" 
                                accept="audio/*" 
                                onChange={handleFileChange} 
                                disabled={isLoading} 
                                className="mb-4" 
                            />
                            {audioFile && (
                                <p className="text-sm text-gray-600">Selected: {audioFile.name}</p>
                            )}
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Processing...' : 'Create Interactive Guide'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGuideView; 