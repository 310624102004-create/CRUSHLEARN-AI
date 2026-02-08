import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, getLessonById } from '../data/mockCourseData';
import { GuidanceEngine } from '../ai/guidanceEngine';
import { AuthService } from '../utils/auth';
import Simulation from '../components/Simulation';

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId);
  const lesson = getLessonById(courseId, lessonId);
  const user = AuthService.getCurrentUser();
  const videoRef = useRef(null);
  const simulationRef = useRef(null);

  // Existing state
  const [showHints, setShowHints] = useState(false);
  const [completed, setCompleted] = useState(
    user.completedLessons?.includes(lessonId) || false
  );

  // New state for slides and video
  const [activeTab, setActiveTab] = useState('slides'); // 'slides' or 'video'
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewedSlides, setViewedSlides] = useState(new Set());
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Simulation state
  const [simulationPassed, setSimulationPassed] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  // Mock slide data - in production, this would come from lesson data
  const slides = lesson?.slides || [
    'https://via.placeholder.com/800x600/0ea5e9/ffffff?text=Slide+1:+Introduction',
    'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Slide+2:+Key+Concepts',
    'https://via.placeholder.com/800x600/8b5cf6/ffffff?text=Slide+3:+Examples',
    'https://via.placeholder.com/800x600/ec4899/ffffff?text=Slide+4:+Practice',
    'https://via.placeholder.com/800x600/10b981/ffffff?text=Slide+5:+Summary',
    'https://via.placeholder.com/800x600/f59e0b/ffffff?text=Slide+6:+Next+Steps',
  ];

  // Mock video URL - in production, use actual video files
  const videoUrl = lesson?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';

  // Mock simulation task data - in production, this would come from lesson data
  const simulationTask = lesson?.simulation || {
    id: `${lessonId}_simulation`,
    description: 'Create output that displays: Hello World',
    requirements: [
      'Output must be exactly "Hello World"',
      'Check spelling and capitalization',
      'No extra spaces or characters'
    ],
    expectedOutput: 'Hello World',
    caseSensitive: true,
    type: 'text',
    difficulty: 'Beginner',
    placeholder: 'Type your output here...',
    hints: [
      'Make sure you spell "Hello World" correctly with a capital H and W.',
      'Is there a space between "Hello" and "World"?',
      'Check that you don\'t have any extra characters before or after the text.'
    ],
    successMessage: 'Perfect! You\'ve successfully completed the practice task. You understand how to produce the expected output!'
  };

  // Load simulation progress from localStorage
  useEffect(() => {
    const savedSimProgress = localStorage.getItem(`simulation_${simulationTask.id}`);
    if (savedSimProgress) {
      const progress = JSON.parse(savedSimProgress);
      setSimulationPassed(progress.passed || false);
    }
  }, [simulationTask.id]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`lesson_${lessonId}_progress`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setViewedSlides(new Set(progress.viewedSlides || []));
      setVideoPlayed(progress.videoPlayed || false);
    }
  }, [lessonId]);

  // Mark current slide as viewed
  useEffect(() => {
    const newViewedSlides = new Set(viewedSlides);
    newViewedSlides.add(currentSlide);
    setViewedSlides(newViewedSlides);
    
    // Save progress
    saveProgress(newViewedSlides, videoPlayed);
  }, [currentSlide]);

  // Save progress to localStorage
  const saveProgress = (viewed, videoStatus) => {
    const progress = {
      viewedSlides: Array.from(viewed),
      videoPlayed: videoStatus,
    };
    localStorage.setItem(`lesson_${lessonId}_progress`, JSON.stringify(progress));
  };

  // Check if all requirements are met
  const allSlidesViewed = viewedSlides.size === slides.length;
  const canProceedToSimulation = allSlidesViewed && videoPlayed;
  const canCompleteLesson = canProceedToSimulation && simulationPassed;

  // Handle simulation completion
  const handleSimulationComplete = (passed) => {
    if (passed) {
      setSimulationPassed(true);
    }
  };

  // Handle "Go to Practice" button click
  const handleGoToPractice = () => {
    setShowSimulation(true);
    setTimeout(() => {
      simulationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle video play event
  const handleVideoPlay = () => {
    if (!videoPlayed) {
      setVideoPlayed(true);
      saveProgress(viewedSlides, true);
    }
  };

  // Handle playback speed change
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Navigate slides
  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (!course || !lesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lesson Not Found
          </h2>
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hints = GuidanceEngine.getHints(lessonId);
  const currentIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = course.lessons[currentIndex + 1];
  const prevLesson = course.lessons[currentIndex - 1];

  const handleMarkComplete = () => {
    const updatedCompletedLessons = [
      ...(user.completedLessons || []),
      lessonId,
    ];
    
    AuthService.updateUser({
      completedLessons: [...new Set(updatedCompletedLessons)],
    });
    
    setCompleted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to={`/course/${courseId}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to {course.title}
        </Link>
      </div>

      {/* Lesson Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
            Lesson {currentIndex + 1} of {course.lessons.length}
          </span>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              lesson.type === 'video'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {lesson.type === 'video' ? '🎥 Video' : '💻 Project'}
          </span>
          {completed && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              ✓ Completed
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {lesson.title}
        </h1>

        <p className="text-gray-600 text-lg mb-4">{lesson.content}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>⏱️ {lesson.duration}</span>
          <span>📚 {course.title}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Lesson Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('slides')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'slides'
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                📊 Slides ({viewedSlides.size}/{slides.length})
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'video'
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                🎥 Video {videoPlayed && '✓'}
              </button>
            </div>

            {/* Slides Viewer */}
            {activeTab === 'slides' && (
              <div className="p-6">
                {/* Slide Display */}
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <div className="aspect-video relative">
                    <img
                      src={slides[currentSlide]}
                      alt={`Slide ${currentSlide + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Slide Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevSlide}
                    disabled={currentSlide === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      Slide {currentSlide + 1} / {slides.length}
                    </p>
                    <div className="flex items-center space-x-1 mt-2">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition ${
                            index === currentSlide
                              ? 'bg-primary-600 w-4'
                              : viewedSlides.has(index)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                          title={`Slide ${index + 1}${viewedSlides.has(index) ? ' (viewed)' : ''}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={goToNextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Slide Progress
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      {Math.round((viewedSlides.size / slides.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(viewedSlides.size / slides.length) * 100}%`,
                      }}
                    />
                  </div>
                  {!allSlidesViewed && (
                    <p className="text-xs text-gray-600 mt-2">
                      View all slides to unlock the next step
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Video Player */}
            {activeTab === 'video' && (
              <div className="p-6">
                {/* Video Element */}
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    className="w-full"
                    controls
                    onPlay={handleVideoPlay}
                    controlsList="nodownload"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Playback Speed Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Playback Speed:
                    </span>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          playbackSpeed === speed
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {videoPlayed && (
                    <span className="flex items-center space-x-2 text-green-600 font-semibold">
                      <span className="text-lg">✓</span>
                      <span>Video Started</span>
                    </span>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Video Learning Tips:
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Use playback speed controls to learn at your pace</li>
                    <li>• Pause and rewind to review important concepts</li>
                    <li>• Take notes while watching</li>
                    <li>• Watch the video at least once to proceed</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Completion Status Card */}
          <div
            className={`rounded-xl shadow-md p-6 ${
              canCompleteLesson
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                : canProceedToSimulation
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200'
                : 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200'
            }`}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {canCompleteLesson 
                ? '🎉 Lesson Complete!' 
                : canProceedToSimulation
                ? '💻 Ready for Practice!'
                : '📋 Lesson Requirements'}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    allSlidesViewed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {allSlidesViewed ? '✓' : '1'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    View All Slides
                  </p>
                  <p className="text-sm text-gray-600">
                    {viewedSlides.size} of {slides.length} slides viewed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    videoPlayed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {videoPlayed ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Watch Video</p>
                  <p className="text-sm text-gray-600">
                    {videoPlayed ? 'Video started ✓' : 'Start the video to continue'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    simulationPassed
                      ? 'bg-green-500 text-white'
                      : canProceedToSimulation
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {simulationPassed ? '✓' : '3'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Complete Practice Simulation</p>
                  <p className="text-sm text-gray-600">
                    {simulationPassed 
                      ? 'Practice completed ✓' 
                      : canProceedToSimulation
                      ? 'Practice simulation unlocked!'
                      : 'Complete slides and video first'}
                  </p>
                </div>
              </div>
            </div>

            {canCompleteLesson && !completed && (
              <button
                onClick={handleMarkComplete}
                className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
              >
                Mark Lesson as Complete ✓
              </button>
            )}

            {completed && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-green-800 text-center font-semibold">
                ✓ Lesson Completed
              </div>
            )}

            {canProceedToSimulation && !showSimulation && !simulationPassed && (
              <button
                onClick={handleGoToPractice}
                className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Go to Practice Simulation →
              </button>
            )}

            {!canProceedToSimulation && (
              <p className="mt-4 text-sm text-gray-600 italic">
                Complete all requirements above to unlock practice simulation
              </p>
            )}
          </div>

          {/* Lesson Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              About This Lesson
            </h2>
            <p className="text-gray-600 mb-4">{lesson.content}</p>
            
            <h3 className="font-semibold text-gray-900 mb-2">
              What You'll Learn:
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>Core concepts and fundamentals</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>Hands-on practical examples</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>Best practices and common patterns</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>Real-world applications</span>
              </li>
            </ul>
          </div>

          {/* Practice Simulation */}
          {(showSimulation || simulationPassed) && canProceedToSimulation && (
            <div ref={simulationRef} className="scroll-mt-8">
              <Simulation
                taskId={simulationTask.id}
                taskData={simulationTask}
                onComplete={handleSimulationComplete}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() =>
                prevLesson &&
                navigate(`/course/${courseId}/lesson/${prevLesson.id}`)
              }
              disabled={!prevLesson}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Lesson
            </button>

            <div className="flex items-center space-x-4">
              {completed && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  ✓ Completed
                </span>
              )}

              <button
                onClick={() =>
                  nextLesson
                    ? navigate(`/course/${courseId}/lesson/${nextLesson.id}`)
                    : navigate(`/course/${courseId}`)
                }
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
              >
                {nextLesson ? 'Next Lesson →' : 'Back to Course'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* AI Hints */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h3 className="font-bold text-gray-900">AI Learning Hints</h3>
            </div>

            <button
              onClick={() => setShowHints(!showHints)}
              className="w-full px-4 py-2 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition mb-4"
            >
              {showHints ? 'Hide Hints' : 'Show AI Hints'}
            </button>

            {showHints && (
              <div className="space-y-3">
                {hints.map((hint, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 text-sm text-gray-700"
                  >
                    <span className="font-semibold text-primary-600">
                      Hint {index + 1}:
                    </span>{' '}
                    {hint}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Progress */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">Course Progress</h3>
            
            <div className="space-y-2">
              {course.lessons.map((l, idx) => (
                <div
                  key={l.id}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    l.id === lessonId ? 'bg-primary-50' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      user.completedLessons?.includes(l.id)
                        ? 'bg-green-100 text-green-700'
                        : l.id === lessonId
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {user.completedLessons?.includes(l.id) ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      l.id === lessonId
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {l.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
