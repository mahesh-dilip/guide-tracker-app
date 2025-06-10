import React from 'react';

const ProgressBar = ({ value }) => {
    const progress = Math.min(100, Math.max(0, value)); // Clamp value between 0-100
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar; 