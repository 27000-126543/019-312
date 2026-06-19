import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ScenarioPage from '@/pages/ScenarioPage';
import AnnotationsPage from '@/pages/AnnotationsPage';
import MeetingReviewPage from '@/pages/MeetingReviewPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scenario/:eventId" element={<ScenarioPage />} />
        <Route path="/annotations" element={<AnnotationsPage />} />
        <Route path="/meeting-review" element={<MeetingReviewPage />} />
      </Routes>
    </Router>
  );
}
