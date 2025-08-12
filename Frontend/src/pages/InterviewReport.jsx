import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card, Alert, Spinner, Badge } from '../components/ui';
import { reportService, interviewService } from '../services/api';

const InterviewReport = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { reportId } = useParams();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/interview/report/${reportId}` } });
      return;
    }
    
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch report data from API
        const reportResponse = await reportService.getReport(reportId);
        const report = reportResponse.data;
        
        // Fetch the related interview data
        const interviewResponse = await interviewService.getInterview(report.interview);
        const interview = interviewResponse.data;
        
        // Combine the data into our report object
        const formattedReport = {
          id: report._id,
          date: interview.createdAt,
          domain: interview.interviewType,
          role: interview.jobRole,
          overallScore: report.overallScore,
          strengths: report.strengths || [],
          improvements: report.areasForImprovement || [],
          questionResponses: (report.questionFeedback || []).map(feedback => ({
            question: feedback.question,
            answer: feedback.answer,
            feedback: feedback.feedback,
            score: feedback.score
          }))
        };
        
        setReport(formattedReport);
      } catch (err) {
        console.error('Failed to fetch interview report:', err);
        setError('Failed to fetch interview report. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [isAuthenticated, navigate, reportId]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
            <span className="ml-3 text-lg">Loading your interview report...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
          <div className="text-center">
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!report) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Alert type="warning" className="mb-6">
            Report not found or has been removed.
          </Alert>
          <div className="text-center">
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const renderScoreBar = (score) => {
    let colorClass = 'bg-red-500';
    if (score >= 80) {
      colorClass = 'bg-green-500';
    } else if (score >= 60) {
      colorClass = 'bg-yellow-500';
    } else if (score >= 40) {
      colorClass = 'bg-orange-500';
    }
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${colorClass}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm"
            className="mb-4"
            onClick={() => navigate('/dashboard')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Interview Report</h1>
          <p className="text-gray-600">{formatDate(report.date)}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Interview Summary</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge color="primary">{report.domain}</Badge>
                    <Badge color="secondary">{report.role}</Badge>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Overall Score:</span>
                  <span className={`text-2xl font-bold ${
                    report.overallScore >= 80 ? 'text-green-600' : 
                    report.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {report.overallScore}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {report.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {report.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Question Analysis</h2>
            
            {report.questionResponses.map((response, index) => (
              <Card key={index} className="mb-4">
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-600 mb-2">
                  Question {index + 1}
                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{response.question}</h3>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Your Answer:</h4>
                  <p className="text-gray-800">{response.answer}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-500">Score:</h4>
                    <span className={`text-sm font-medium ${
                      response.score >= 80 ? 'text-green-600' : 
                      response.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {response.score}/100
                    </span>
                  </div>
                  {renderScoreBar(response.score)}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Feedback:</h4>
                  <p className="text-gray-800">{response.feedback}</p>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="mb-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Review Your Feedback</h4>
                    <p className="text-sm text-gray-600">Study the detailed analysis to understand your strengths and weaknesses.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Practice More</h4>
                    <p className="text-sm text-gray-600">Focus on the areas needing improvement and try another interview session.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Track Progress</h4>
                    <p className="text-sm text-gray-600">Compare your results over time to see how you're improving.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  fullWidth
                  onClick={() => navigate('/interview/new')}
                >
                  Start Another Interview
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InterviewReport;
