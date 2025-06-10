import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateGuideView from './views/CreateGuideView';
import GuideView from './views/GuideView';
import './App.css'

const App = () => {
    return (
        <Router>
            <div className="bg-gray-100 min-h-screen font-sans">
                <Routes>
                    <Route path="/" element={<CreateGuideView />} />
                    <Route path="/guide/:guideId" element={<GuideView />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
