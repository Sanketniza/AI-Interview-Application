import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card, Spinner, Alert } from '../components/ui';
import { interviewService, reportService } from '../services/api';

const Dashboard = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }
    
    // Fetch interview history and reports
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get completed interviews
        const interviewsResponse = await interviewService.getInterviews();
        const completedInterviews = interviewsResponse.data.filter(interview => 
          interview.status === 'completed'
        );
        
        // Get reports for the completed interviews
        const reportsResponse = await reportService.getReports();
        
        // Combine interview and report data
        const interviewData = completedInterviews.map(interview => {
          const report = reportsResponse.data.find(r => r.interview === interview._id);
          return {
            id: report ? report._id : interview._id,
            interviewId: interview._id,
            date: interview.createdAt,
            domain: interview.interviewType,
            role: interview.jobRole,
            score: report ? report.overallScore : null,
            hasReport: Boolean(report)
          };
        });
        
        // Sort by most recent first
        interviewData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Only show the most recent 5
        setInterviewHistory(interviewData.slice(0, 5));
        
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load your interview data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading your dashboard...</span>
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-6">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Interview Stats</h2>
                <div className="text-3xl font-bold text-primary-600 mb-2">{interviewHistory.length}</div>
                <p className="text-gray-600">Total interviews completed</p>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Average Score</h2>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {interviewHistory.some(item => item.score) 
                    ? Math.round(
                        interviewHistory
                          .filter(item => item.score)
                          .reduce((acc, item) => acc + item.score, 0) / 
                        interviewHistory.filter(item => item.score).length
                      )
                    : 'N/A'}%
                </div>
                <p className="text-gray-600">Across all interviews</p>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Practice More</h2>
                <p className="text-gray-600 mb-4">Start a new interview session to improve your skills</p>
                <Button onClick={() => navigate('/interview/new')}>
                  New Interview
                </Button>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Interviews</h2>
              <Button 
                variant="link" 
                onClick={() => navigate('/history')}
              >
                View All
              </Button>
            </div>
            
            {interviewHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {interviewHistory.map((interview) => (
                      <tr key={interview.id || interview._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(interview.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.domain}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {interview.score ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              interview.score >= 80 ? 'bg-green-100 text-green-800' : 
                              interview.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {interview.score}%
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {interview.hasReport ? (
                            <Button 
                              size="sm" 
                              variant="link" 
                              onClick={() => navigate(`/interview/report/${interview.id}`)}
                            >
                              View Report
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-sm">Report pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-4">You haven't completed any interviews yet.</p>
                <Button onClick={() => navigate('/interview/new')}>
                  Start Your First Interview
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
