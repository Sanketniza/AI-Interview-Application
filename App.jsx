import React from 'react';
import { generateInterviewReport } from './InterviewReportGenerator';
import InterviewSummary from './InterviewSummary';

const App = () => {
    const [interviewEnded, setInterviewEnded] = React.useState(false);
    const [interviewResult, setInterviewResult] = React.useState<any>(null);
    const [reportError, setReportError] = React.useState<string | null>(null);

    // Call this when the interview ends
    async function onInterviewEnd(result: any) {
        try {
            setInterviewResult(result);
            setInterviewEnded(true);
            setReportError(null);
        } catch (e) {
            setReportError("Failed to fetch interview report. Please try again.");
            setInterviewEnded(true);
        }
    }

    return (
        <div>
           
            {interviewEnded && (
                reportError ? (
                    <div className="error-message">{reportError}</div>
                ) : interviewResult ? (
                    <InterviewSummary analysis={generateInterviewReport(interviewResult)} />
                ) : (
                    <div>Report pending</div>
                )
            )}
           
        </div>
    );
};

export default App;