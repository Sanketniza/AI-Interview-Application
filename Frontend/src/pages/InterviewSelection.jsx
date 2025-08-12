import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button, Card, Select, Alert } from '../components/ui';
import { interviewService } from '../services/api';

const domains = [
  { 
    id: 'software-engineering',
    name: 'Software Engineering',
    roles: [
      { id: 'frontend-developer', name: 'Frontend Developer' },
      { id: 'backend-developer', name: 'Backend Developer' },
      { id: 'fullstack-developer', name: 'Fullstack Developer' },
      { id: 'mobile-developer', name: 'Mobile Developer' },
      { id: 'devops-engineer', name: 'DevOps Engineer' },
    ]
  },
  {
    id: 'data-science',
    name: 'Data Science',
    roles: [
      { id: 'data-analyst', name: 'Data Analyst' },
      { id: 'data-scientist', name: 'Data Scientist' },
      { id: 'machine-learning-engineer', name: 'Machine Learning Engineer' },
      { id: 'data-engineer', name: 'Data Engineer' },
    ]
  },
  {
    id: 'product-management',
    name: 'Product Management',
    roles: [
      { id: 'product-manager', name: 'Product Manager' },
      { id: 'product-owner', name: 'Product Owner' },
      { id: 'business-analyst', name: 'Business Analyst' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    roles: [
      { id: 'financial-analyst', name: 'Financial Analyst' },
      { id: 'investment-banker', name: 'Investment Banker' },
      { id: 'accountant', name: 'Accountant' },
      { id: 'financial-advisor', name: 'Financial Advisor' },
    ]
  },
];

const InterviewSelection = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/interview/new' } });
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (selectedDomain) {
      const domain = domains.find(d => d.id === selectedDomain);
      if (domain) {
        setAvailableRoles(domain.roles);
        setSelectedRole('');
      } else {
        setAvailableRoles([]);
      }
    } else {
      setAvailableRoles([]);
      setSelectedRole('');
    }
  }, [selectedDomain]);
  
  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };
  
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleStartInterview = async () => {
    if (selectedDomain && selectedRole) {
      setIsStarting(true);
      setError(null);
      
      try {
        const domainName = domains.find(d => d.id === selectedDomain).name;
        const roleName = availableRoles.find(r => r.id === selectedRole).name;
        
        // Call the API to create a new interview in the database
        const response = await interviewService.startInterview({
          jobRole: roleName,
          companyName: 'Practice Interview', // Default company name for practice
          interviewType: domainName
        });
        
        // Navigate to the interview session with the interview ID
        navigate(`/interview/session`, { 
          state: { 
            interviewId: response.data._id,
            domain: domainName,
            role: roleName
          } 
        });
      } catch (err) {
        console.error('Failed to start interview:', err);
        setError('Failed to start interview. Please try again.');
        setIsStarting(false);
      }
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Start a New Interview</h1>
          
          <Card className="mb-6">
            <div className="prose max-w-none mb-6">
              <h2>Select Your Domain and Role</h2>
              <p>
                Choose the industry and specific role you want to practice interviewing for. 
                We'll tailor the interview questions based on your selection.
              </p>
            </div>
            
            <div className="space-y-6">
              <Select
                id="domain"
                label="Select Domain"
                value={selectedDomain}
                onChange={handleDomainChange}
                required
              >
                <option value="">Select a domain</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </Select>
              
              <Select
                id="role"
                label="Select Role"
                value={selectedRole}
                onChange={handleRoleChange}
                disabled={!selectedDomain}
                required
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
          
          <Card className="mb-6">
            <div className="prose max-w-none mb-6">
              <h2>What to Expect</h2>
              <p>
                In this mock interview, our AI interviewer will ask you questions 
                related to your selected domain and role. You'll receive feedback
                on your answers to help you improve your interview skills.
              </p>
              <ul>
                <li>The interview will last approximately 15-20 minutes</li>
                <li>You'll be asked 5-7 questions specific to your role</li>
                <li>After the interview, you'll receive a detailed feedback report</li>
              </ul>
            </div>
          </Card>
          
          {error && (
            <Alert type="error" className="mb-6" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartInterview}
              disabled={!selectedDomain || !selectedRole || isStarting}
            >
              {isStarting ? 'Starting...' : 'Start Interview'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InterviewSelection;
