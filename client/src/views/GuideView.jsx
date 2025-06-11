import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGuide, toggleStep, addNote, addAttachment, exportGuideAs } from '../services/api';
import ProgressBar from '../components/ProgressBar';

const GuideView = () => {
    const { guideId } = useParams();
    const [guide, setGuide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [noteInputs, setNoteInputs] = useState({});
    const [uploadingStep, setUploadingStep] = useState(null);
    const [exportingFormat, setExportingFormat] = useState(null);
    const fileInputRef = useRef({});
    const [addingNoteStepId, setAddingNoteStepId] = useState(null);

    const fetchGuide = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getGuide(guideId);
            setGuide(response.data);
        } catch (err) {
            setError('Could not fetch the guide. Does it exist?');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [guideId]);

    useEffect(() => {
        fetchGuide();
    }, [fetchGuide]);

    const handleToggleStep = async (stepId) => {
        const originalGuide = JSON.parse(JSON.stringify(guide));

        const updatedGuide = JSON.parse(JSON.stringify(guide));
        let stepFound = false;
        updatedGuide.chapters.forEach(chapter => {
            const step = chapter.steps.find(s => s.id === stepId);
            if (step) {
                step.isCompleted = !step.isCompleted;
                stepFound = true;
            }
        });

        let completedSteps = 0;
        let totalSteps = 0;
        updatedGuide.chapters.forEach(ch => {
            totalSteps += ch.steps.length;
            ch.steps.forEach(st => {
                if (st.isCompleted) completedSteps++;
            });
        });
        updatedGuide.progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
        
        if(stepFound) {
             setGuide(updatedGuide);
        }

        try {
            await toggleStep(guideId, stepId);
        } catch (err) {
            setError('Failed to update step. Reverting.');
            setGuide(originalGuide);
        }
    };

    const handleNoteInputChange = (stepId, value) => {
        setNoteInputs(prev => ({ ...prev, [stepId]: value }));
    };

    const handleAddNote = async (stepId) => {
        const content = noteInputs[stepId];
        if (!content || !content.trim()) return;
        try {
            await addNote(guideId, stepId, content);
            setNoteInputs(prev => ({ ...prev, [stepId]: '' }));
            setAddingNoteStepId(null); // Reset add note mode
            fetchGuide();
        } catch (err) {
            setError('Failed to add note.');
        }
    };

    const handleFileChange = async (event, stepId) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingStep(stepId); // Show loading indicator for this step
        try {
            await addAttachment(guideId, stepId, file);
            fetchGuide(); // Refresh to show the new image
        } catch (err) {
            setError('Failed to upload file. Is it smaller than 5MB?');
            console.error(err);
        } finally {
            setUploadingStep(null); // Hide loading indicator
        }
    };

    const handleExport = async (format) => {
        setExportingFormat(format);
        try {
            const response = await exportGuideAs(guideId, format);
            // Create a temporary link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'pdf' ? 'pdf' : 'md';
            link.setAttribute('download', `${guide.title}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            setError("Could not export the guide.");
            console.error(err);
        } finally {
            setExportingFormat(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-lg">Loading guide...</div>;
    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
    if (!guide) return <div className="p-8 text-center">No guide data found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-gray-100 z-10 border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                        <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Create</Link>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleExport('pdf')}
                                disabled={exportingFormat === 'pdf'}
                                className="text-sm bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {exportingFormat === 'pdf' ? 'Exporting...' : 'Export as PDF'}
                            </button>
                            <button 
                                onClick={() => handleExport('markdown')}
                                disabled={exportingFormat === 'markdown'}
                                className="text-sm bg-gray-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                            >
                                {exportingFormat === 'markdown' ? 'Exporting...' : 'Export as MD'}
                            </button>
                        </div>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{guide.title}</h1>
                    <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mb-4">{guide.contentType}</p>

                    {/* Centralized Progress Bar */}
                    <div className="mb-6">
                        <ProgressBar value={guide.progress} />
                        <p className="text-right text-sm text-gray-600 mt-1">{Math.round(guide.progress || 0)}% Complete</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-8">
                {guide.chapters.map((chapter, chapterIndex) => (
                    <div key={chapter.id || chapterIndex} className="mb-12">
                        <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-500 pb-2 mb-6">{chapter.title}</h2>
                        <ul className="space-y-8">
                            {chapter.steps.map((step) => (
                                <li key={step.id} className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow ${step.isCompleted ? 'opacity-60' : ''}`}>
                                    <label className="flex items-start cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!step.isCompleted}
                                            onChange={() => handleToggleStep(step.id)}
                                            className="h-6 w-6 border-gray-300 rounded text-blue-600 focus:ring-blue-500 mt-1"
                                        />
                                        <span className={`ml-4 text-lg ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                            {step.content}
                                        </span>
                                    </label>
                                    
                                    {/* Notes & Attachments Section */}
                                    <div className="ml-10 mt-6 pl-4 border-l-2 border-gray-200">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            {(!step.notes || step.notes.length === 0) && (!step.attachments || step.attachments.length === 0) ? (
                                                addingNoteStepId === step.id ? (
                                                    <div className="flex gap-2 w-full">
                                                        <input
                                                            type="text"
                                                            value={noteInputs[step.id] || ''}
                                                            onChange={(e) => handleNoteInputChange(step.id, e.target.value)}
                                                            placeholder="Add a new note..."
                                                            className="w-full text-base border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 mb-0"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleAddNote(step.id)}
                                                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                        >
                                                            Add Note
                                                        </button>
                                                        <button
                                                            onClick={() => setAddingNoteStepId(null)}
                                                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setAddingNoteStepId(step.id)}
                                                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                        >
                                                            Add Note
                                                        </button>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, step.id)}
                                                            className="hidden"
                                                            ref={el => fileInputRef.current[step.id] = el}
                                                        />
                                                        <button
                                                            onClick={() => fileInputRef.current[step.id].click()}
                                                            disabled={uploadingStep === step.id}
                                                            className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                                        >
                                                            + Add Image
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                <>
                                                    {/* Notes Section */}
                                                    <div>
                                                        <h4 className="font-semibold text-gray-600 text-sm mb-2">Notes:</h4>
                                                        {step.notes && step.notes.length > 0 ? (
                                                            <ul className="list-disc list-inside mt-2 text-gray-700">
                                                                {step.notes.map((note) => (
                                                                    <li key={note.id} className="text-sm mb-1">{note.content}</li>
                                                                ))}
                                                            </ul>
                                                        ) : <p className="text-sm text-gray-400 mt-1">No notes yet.</p>}
                                                    </div>
                                                    {/* Attachments Section */}
                                                    <div className="mt-6">
                                                        <h4 className="font-semibold text-gray-600 text-sm mb-2">Attachments:</h4>
                                                        {step.attachments && step.attachments.length > 0 ? (
                                                            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                                                {step.attachments.map(att => (
                                                                    <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                        <img
                                                                            src={att.fileUrl}
                                                                            alt="attachment"
                                                                            className="h-24 w-24 object-cover rounded-md border-2 border-gray-200 hover:border-blue-500 transition"
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 mt-1">No attachments yet.</p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GuideView; 