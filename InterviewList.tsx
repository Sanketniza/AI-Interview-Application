import React from 'react';

const InterviewList = ({ interviews, viewReport }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Interviewee</th>
                    <th>Position</th>
                    <th>Date</th>
                    <th>Report</th>
                </tr>
            </thead>
            <tbody>
                {interviews.map(interview => (
                    <tr key={interview.id}>
                        <td>{interview.interviewee}</td>
                        <td>{interview.position}</td>
                        <td>{new Date(interview.date).toLocaleString()}</td>
                        <td>
                            {interview.reportAvailable
                                ? <button onClick={() => viewReport(interview.id)}>View Report</button>
                                : "Report pending"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default InterviewList;