import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card } from '../components/ui';

const Dashboard = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Interview Stats</h2>
            <div className="text-3xl font-bold text-primary-600 mb-2">{interviewHistory.length}</div>
            <p className="text-gray-600">Total interviews completed</p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Average Score</h2>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {interviewHistory.length > 0 
                ? Math.round(interviewHistory.reduce((acc, item) => acc + item.score, 0) / interviewHistory.length)
                : 0}%
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
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Interviews</h2>
        
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

export default Dashboard;
