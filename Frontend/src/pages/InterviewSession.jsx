import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card, Alert, Spinner, Badge } from '../components/ui';

const InterviewSession = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  // Session ID for API communication
  const [, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [domainInfo, setDomainInfo] = useState({
    domain: '',
    role: ''
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/interview/session' } });
    }
    
    if (!location.state?.domain || !location.state?.role) {
      navigate('/interview/new');
      return;
    }
    
    setDomainInfo({
      domain: location.state.domain,
      role: location.state.role
    });
    
    // Start a new interview session
    const startInterview = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, we'd call the backend API
        // Mock data for demonstration
        const mockResponse = {
          sessionId: 'mock-session-' + Date.now(),
          questions: [
            {
              id: 1,
              question: `Tell me about your experience with ${location.state.role} roles.`
            },
            {
              id: 2,
              question: `What are the key skills needed for a successful ${location.state.role}?`
            },
            {
              id: 3,
              question: `Describe a challenging problem you solved in the ${location.state.domain} field.`
            },
            {
              id: 4,
              question: `How do you stay updated with the latest trends in ${location.state.domain}?`
            },
            {
              id: 5,
              question: `Where do you see yourself in 5 years in the ${location.state.domain} industry?`
            }
          ]
        };
        
        setSessionId(mockResponse.sessionId);
        setQuestions(mockResponse.questions);
        setCurrentQuestion(mockResponse.questions[0]);
      } catch (_) {
        setError('Failed to start interview session. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    startInterview();
  }, [isAuthenticated, navigate, location.state]);
  
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };
  
  const handleNext = () => {
    if (userInput.trim() === '') return;
    
    // Save current answer
    setAnswers({
      ...answers,
      [currentQuestion.id]: userInput
    });
    
    // Clear input for next question
    setUserInput('');
    
    // Move to next question or complete interview
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentQuestion(questions[currentIndex + 1]);
    } else {
      // Last question completed
      handleComplete();
    }
  };
  
  const handleComplete = async () => {
    // Include the last answer if not empty
    let finalAnswers = { ...answers };
    if (userInput.trim() !== '') {
      finalAnswers[currentQuestion.id] = userInput;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real implementation, we'd submit to the backend API
      // Mock submission for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInterviewComplete(true);
      // Navigate to report page with mock report ID
      navigate('/interview/report/mock-report-' + Date.now());
    } catch (_) {
      setError('Failed to submit interview. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
            <span className="ml-3 text-lg">Setting up your interview...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (interviewComplete || isSubmitting) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <div className="text-center py-8">
              <Spinner size="lg" className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Analyzing Your Responses</h2>
              <p className="text-gray-600">
                We're generating your feedback report. This may take a moment...
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Interview Session</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge color="primary">{domainInfo.domain}</Badge>
              <Badge color="secondary">{domainInfo.role}</Badge>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
        
        {error && (
          <Alert type="error" className="mb-6" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Card className="mb-6">
          <div className="prose max-w-none mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Interviewer</h3>
                <p className="text-gray-700 mt-1">{currentQuestion?.question}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              id="answer"
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type your answer here..."
              value={userInput}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="flex justify-between">
            {currentIndex > 0 ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentIndex(currentIndex - 1);
                  setCurrentQuestion(questions[currentIndex - 1]);
                  setUserInput(answers[questions[currentIndex - 1].id] || '');
                }}
              >
                Previous
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button 
              onClick={handleNext}
              disabled={userInput.trim() === ''}
            >
              {currentIndex < questions.length - 1 ? 'Next' : 'Complete Interview'}
            </Button>
          </div>
        </Card>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Tips for a great response</h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>Be specific and provide examples from your experience</li>
                <li>Structure your answer clearly with a beginning, middle, and end</li>
                <li>Keep your response concise and relevant to the question</li>
                <li>Highlight your achievements and the skills you utilized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InterviewSession;
