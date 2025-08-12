import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card, Alert, Spinner, Badge } from '../components/ui';
import { interviewService, reportService } from '../services/api';

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
  // Interview ID for API communication
  const [interviewId, setInterviewId] = useState(null);
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
    
    if (!location.state?.domain || !location.state?.role || !location.state?.interviewId) {
      navigate('/interview/new');
      return;
    }
    
    setDomainInfo({
      domain: location.state.domain,
      role: location.state.role 
    });
    
    setInterviewId(location.state.interviewId);
    
    // Start a new interview session
    const startInterview = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the interview details from the API
        const response = await interviewService.getInterview(location.state.interviewId);
        const interviewData = response.data;
        
        if (interviewData.questions && interviewData.questions.length > 0) {
          // Format questions from the API
          const formattedQuestions = interviewData.questions.map((q, index) => ({
            id: index + 1,
            question: q
          }));
          
          setQuestions(formattedQuestions);
          setCurrentQuestion(formattedQuestions[0]);
        } else {
          // If no questions are available, generate some based on domain/role
          await interviewService.generateQuestions(location.state.interviewId);
          
          // Fetch the updated interview with generated questions
          const updatedResponse = await interviewService.getInterview(location.state.interviewId);
          const updatedInterviewData = updatedResponse.data;
          
          if (updatedInterviewData.questions && updatedInterviewData.questions.length > 0) {
            // Format questions from the API
            const formattedQuestions = updatedInterviewData.questions.map((q, index) => ({
              id: index + 1,
              question: q
            }));
            
            setQuestions(formattedQuestions);
            setCurrentQuestion(formattedQuestions[0]);
          } else {
            throw new Error('No questions were generated for this interview.');
          }
        }
      } catch (err) {
        console.error('Failed to load interview:', err);
        
        // Create a user-friendly error message
        let errorMessage = 'Failed to start interview session: ';
        
        if (err.response?.data?.message) {
          // Handle API error with message
          errorMessage += err.response.data.message;
        } else if (err.message) {
          // Handle error with message property
          errorMessage += err.message;
        } else {
          // Generic error
          errorMessage += 'Please try again later.';
        }
        
        // Additional debugging info in console
        if (err.response?.data) {
          console.error('Error response data:', err.response.data);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    startInterview();
  }, [isAuthenticated, navigate, location.state]);
  
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };
  
  const handleNext = async () => {
    if (userInput.trim() === '') return;
    
    // Save current answer locally
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: userInput
    };
    setAnswers(newAnswers);
    
    try {
      // Save question and answer to the database
      await interviewService.saveQuestionAnswer(interviewId, {
        question: currentQuestion.question,
        answer: userInput
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
    } catch (err) {
      console.error('Failed to save answer:', err);
      setError('Failed to save your answer. Please try again.');
    }
  };
  
  const handleComplete = async () => {
    // Include the last answer if not empty
    if (userInput.trim() !== '') {
      try {
        await interviewService.saveQuestionAnswer(interviewId, {
          question: currentQuestion.question,
          answer: userInput
        });
      } catch (err) {
        console.error('Failed to save final answer:', err);
      }
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Complete the interview in the database
      await interviewService.completeInterview(interviewId);
      
      // Generate a report based on the interview
      const reportResponse = await reportService.generateReport(interviewId);
      
      setInterviewComplete(true);
      
      // Navigate to the report page with the real report ID
      navigate(`/interview/report/${reportResponse.data._id}`);
    } catch (err) {
      console.error('Failed to complete interview:', err);
      const errorMessage = err.message || 'Failed to submit interview. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  // Helper function to retry the submission process
  const retrySubmission = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First check if the interview is already completed
      const interviewResponse = await interviewService.getInterview(interviewId);
      const interviewData = interviewResponse.data;
      
      // Only try to complete the interview if it's not already completed
      if (interviewData.status !== 'completed') {
        await interviewService.completeInterview(interviewId);
      }
      
      // Try to generate the report
      const reportResponse = await reportService.generateReport(interviewId);
      
      setInterviewComplete(true);
      
      // Navigate to the report page with the real report ID
      navigate(`/interview/report/${reportResponse.data._id}`);
    } catch (err) {
      console.error('Retry submission failed:', err);
      const errorMessage = err.message || 'Failed to submit interview. Please try again.';
      setError(errorMessage);
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
  
  // Display a dedicated error page if we have errors but no questions loaded
  if (error && (!questions || questions.length === 0)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <div className="text-center py-8">
              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold mt-4 mb-2">Failed to Start Interview</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex justify-center space-x-4">
                <Button 
                  color="primary" 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    
                    // Retry the interview setup process
                    const startInterview = async () => {
                      try {
                        // First try to generate new questions
                        await interviewService.generateQuestions(interviewId);
                        
                        // Then fetch the updated interview data
                        const updatedResponse = await interviewService.getInterview(interviewId);
                        const updatedInterviewData = updatedResponse.data;
                        
                        if (updatedInterviewData.questions && updatedInterviewData.questions.length > 0) {
                          const formattedQuestions = updatedInterviewData.questions.map((q, index) => ({
                            id: index + 1,
                            question: q
                          }));
                          
                          setQuestions(formattedQuestions);
                          setCurrentQuestion(formattedQuestions[0]);
                        } else {
                          throw new Error('Failed to generate interview questions');
                        }
                      } catch (retryErr) {
                        console.error('Retry failed:', retryErr);
                        setError(`Retry failed: ${retryErr.message || 'Unknown error'}`);
                      } finally {
                        setLoading(false);
                      }
                    };
                    
                    startInterview();
                  }}
                >
                  Retry Interview
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate('/interview/new')}
                >
                  Start New Interview
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (interviewComplete || isSubmitting) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card>
            {error ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold mt-4 mb-2">Submission Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex flex-col items-center">
                  <Button 
                    color="primary" 
                    onClick={retrySubmission}
                    className="mb-4 w-48"
                  >
                    Retry Submission
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => navigate('/interview/history')}
                    className="w-48"
                  >
                    View Interview History
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  If the problem persists, your answers have been saved. You can access this interview 
                  from your interview history later.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Spinner size="lg" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Analyzing Your Responses</h2>
                <p className="text-gray-600">
                  We're generating your feedback report. This may take a moment...
                </p>
              </div>
            )}
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
            <div className="flex flex-col">
              <div className="mb-2">{error}</div>
              <div>
                <Button 
                  variant="outlined" 
                  color="danger" 
                  size="sm" 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Retry the interview setup process
                    const startInterview = async () => {
                      try {
                        // First try to generate new questions
                        await interviewService.generateQuestions(interviewId);
                        
                        // Then fetch the updated interview data
                        const updatedResponse = await interviewService.getInterview(interviewId);
                        const updatedInterviewData = updatedResponse.data;
                        
                        if (updatedInterviewData.questions && updatedInterviewData.questions.length > 0) {
                          const formattedQuestions = updatedInterviewData.questions.map((q, index) => ({
                            id: index + 1,
                            question: q
                          }));
                          
                          setQuestions(formattedQuestions);
                          setCurrentQuestion(formattedQuestions[0]);
                          setCurrentIndex(0);
                          setUserInput('');
                          setAnswers({});
                        } else {
                          throw new Error('Failed to generate interview questions');
                        }
                      } catch (retryErr) {
                        console.error('Retry failed:', retryErr);
                        setError(`Retry failed: ${retryErr.message || 'Unknown error'}`);
                      } finally {
                        setLoading(false);
                      }
                    };
                    
                    startInterview();
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
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
