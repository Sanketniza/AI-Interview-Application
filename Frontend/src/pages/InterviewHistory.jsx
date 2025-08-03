import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card } from '../components/ui';

const InterviewHistory = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/history' } });
    }
  }, [isAuthenticated, navigate]);
  
  // Mock interview history data
  const interviewHistory = [
    {
      id: 'mock-report-1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      domain: 'Software Engineering',
      role: 'Frontend Developer',
      score: 88
    },
    {
      id: 'mock-report-2',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      domain: 'Software Engineering',
      role: 'Backend Developer',
      score: 76
    },
    {
      id: 'mock-report-3',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      domain: 'Data Science',
      role: 'Data Analyst',
      score: 92
    }
  ];
  
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Interview History</h1>
        
        {interviewHistory.length > 0 ? (
          <>
            <div className="mb-6">
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Interviews</p>
                    <p className="text-3xl font-bold text-primary-600">{interviewHistory.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {Math.round(interviewHistory.reduce((acc, item) => acc + item.score, 0) / interviewHistory.length)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Last Interview</p>
                    <p className="text-xl font-semibold text-gray-800">
                      {formatDate(interviewHistory[0].date)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="mb-6 flex justify-end">
              <Button onClick={() => navigate('/interview/new')}>
                Start New Interview
              </Button>
            </div>
            
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
                    <tr key={interview.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(interview.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.domain}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.score >= 80 ? 'bg-green-100 text-green-800' : 
                          interview.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {interview.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          size="sm" 
                          variant="link" 
                          onClick={() => navigate(`/interview/report/${interview.id}`)}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't completed any interviews yet.</p>
            <Button onClick={() => navigate('/interview/new')}>
              Start Your First Interview
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default InterviewHistory;
