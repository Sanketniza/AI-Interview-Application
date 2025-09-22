import React from 'react';
import { InterviewAnalysis } from './InterviewReportGenerator';

interface Props {
    analysis: InterviewAnalysis;
}

const InterviewSummary: React.FC<Props> = ({ analysis }) => (
    <div>
        <h2>Interview Report</h2>
        <h3>Strengths</h3>
        <ul>
            {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <h3>Weaknesses</h3>
        <ul>
            {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
        <h3>Areas to Improve</h3>
        <ul>
            {analysis.areasToImprove.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
        <h3>Summary</h3>
        <p>{analysis.summary}</p>
    </div>
);

export default InterviewSummary;
