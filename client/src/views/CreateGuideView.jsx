import { useState, useRef } from "react"
import { useNavigate } from 'react-router-dom';
import { createGuideFromText, createGuideFromAudio } from '../services/api';

// Import the UI components we just added
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"

// Import the icons
import { FileText, Mic, Sparkles, Upload, Zap } from "lucide-react"

export default function CreateGuideView() {
  const [activeTab, setActiveTab] = useState("text")
  const [content, setContent] = useState("")
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleCreateGuide = async () => {
    setIsLoading(true);
    setError('');
    try {
        let response;
        if (activeTab === 'text') {
            if (!content.trim()) {
                setError("Please paste some content to get started.");
                setIsLoading(false);
                return;
            }
            response = await createGuideFromText(content);
        } else {
            if (!audioFile) {
                setError("Please select an audio file to get started.");
                setIsLoading(false);
                return;
            }
            response = await createGuideFromAudio(audioFile);
        }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Guide Tracker</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform your content into interactive, step-by-step guides.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              Interactive
            </Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-slate-800">Create Your Guide</CardTitle>
            <CardDescription className="text-slate-600">
              Choose your input method and provide your content to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tab Selection */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveTab("text")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "text" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <FileText className="h-4 w-4" />
                From Text
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "audio" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Mic className="h-4 w-4" />
                From Audio
              </button>
            </div>

            {/* Content Input */}
            {activeTab === "text" ? (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Paste your content</label>
                <Textarea
                  placeholder="Paste your text content here... This could be instructions, documentation, tutorial content, or any text you'd like to convert into an interactive guide."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">
                  Tip: The more detailed your content, the better your interactive guide will be
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Upload audio file</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-1">Drop your audio file here or click to browse</p>
                  <p className="text-sm text-slate-500">Supports MP3, WAV, M4A files up to 50MB</p>
                  <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current.click()}>
                    Choose File
                  </Button>
                  {audioFile && <p className="text-sm text-slate-600 mt-2">Selected: {audioFile.name}</p>}
                </div>
              </div>
            )}
             {error && <p className="text-red-500 text-sm">{error}</p>}
            {/* Action Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading || (activeTab === "text" && !content.trim()) || (activeTab === "audio" && !audioFile)}
              onClick={handleCreateGuide}
            >
              {isLoading ? 'Processing...' : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Interactive Guide
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Smart Processing</h3>
            <p className="text-sm text-slate-600">
              AI analyzes your content to create structured, easy-to-follow guides
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Interactive Elements</h3>
            <p className="text-sm text-slate-600">Add checkboxes, progress tracking, and interactive components</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Beautiful Design</h3>
            <p className="text-sm text-slate-600">Professional layouts that work perfectly on any device</p>
          </div>
        </div>
      </div>
    </div>
  )
} 