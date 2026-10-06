import React, { useState, useMemo } from 'react';
import { 
  Heart,
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  BarChart3,
  Calendar,
  Clock,
  ArrowRight,
  FolderTree,
  ShieldCheck,
  Check,
  Smile,
  Meh,
  Frown,
  Eye,
  X
} from 'lucide-react';

// ==========================================
// 30 Assessment Questions
// ==========================================
interface Question {
  id: number;
  category: string;
  question: string;
  reverse: boolean;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  // Academic Stress (1-5)
  { id: 1, category: 'Academic Stress', question: 'I feel stressed because of academic workload and tight deadlines.', reverse: false },
  { id: 2, category: 'Academic Stress', question: 'I feel constant pressure to achieve high grades or match expectations.', reverse: false },
  { id: 3, category: 'Academic Stress', question: 'I find it difficult to concentrate during lectures or study sessions.', reverse: false },
  { id: 4, category: 'Academic Stress', question: 'I feel overwhelmed by assignments, lab projects, or upcoming exams.', reverse: false },
  { id: 5, category: 'Academic Stress', question: 'I worry excessively about my academic future, placements, or higher studies.', reverse: false },

  // Social Life (6-10)
  { id: 6, category: 'Social Life', question: 'I feel socially isolated or disconnected from campus social circles.', reverse: false },
  { id: 7, category: 'Social Life', question: 'I find it difficult to communicate openly with classmates or friends.', reverse: false },
  { id: 8, category: 'Social Life', question: 'I feel uncomfortable or anxious in college social gatherings.', reverse: false },
  { id: 9, category: 'Social Life', question: 'I feel that I do not have enough emotional or social support.', reverse: false },
  { id: 10, category: 'Social Life', question: 'I frequently avoid campus social events or student club activities.', reverse: false },

  // Family Environment (11-15)
  { id: 11, category: 'Family Environment', question: 'I experience tension or stress due to family-related issues.', reverse: false },
  { id: 12, category: 'Family Environment', question: 'I feel warmly supported and understood by my family members.', reverse: true },
  { id: 13, category: 'Family Environment', question: 'Family expectations create pressure or burden for me.', reverse: false },
  { id: 14, category: 'Family Environment', question: 'I frequently worry about family-related problems while trying to study.', reverse: false },
  { id: 15, category: 'Family Environment', question: 'I feel comfortable discussing personal problems openly with family.', reverse: true },

  // Social Media (16-20)
  { id: 16, category: 'Social Media', question: 'I spend excessive hours daily browsing social media platforms.', reverse: false },
  { id: 17, category: 'Social Media', question: 'Social media consumption negatively impacts my mood or peace of mind.', reverse: false },
  { id: 18, category: 'Social Media', question: 'I compare my lifestyle and achievements with people on social media.', reverse: false },
  { id: 19, category: 'Social Media', question: 'I feel anxious or uneasy when I cannot access my phone or feeds.', reverse: false },
  { id: 20, category: 'Social Media', question: 'Social media notifications disrupt my study concentration and revision schedule.', reverse: false },

  // Physical Health (21-24)
  { id: 21, category: 'Physical Health', question: 'I frequently wake up feeling physically tired or exhausted.', reverse: false },
  { id: 22, category: 'Physical Health', question: 'I get sufficient and restful sleep on most nights.', reverse: true },
  { id: 23, category: 'Physical Health', question: 'I regularly exercise or participate in sports and physical activity.', reverse: true },
  { id: 24, category: 'Physical Health', question: 'I experience difficulty maintaining a healthy meal and hydration routine.', reverse: false },

  // Campus Environment (25-28)
  { id: 25, category: 'Campus Environment', question: 'I feel stressed or overwhelmed by the college environment.', reverse: false },
  { id: 26, category: 'Campus Environment', question: 'I have experienced teasing, exclusion, ragging, or undue friction on campus.', reverse: false },
  { id: 27, category: 'Campus Environment', question: 'I feel safe and physically secure on campus and in hostel premises.', reverse: true },
  { id: 28, category: 'Campus Environment', question: 'I feel comfortable approaching professors or college authorities for help.', reverse: true },

  // Financial Stress (29-30)
  { id: 29, category: 'Financial Stress', question: 'Financial problems or living expenses affect my mental peace.', reverse: false },
  { id: 30, category: 'Financial Stress', question: 'I constantly worry about education expenses, loans, or financial independence.', reverse: false }
];

interface AssessmentRecord {
  id: number;
  date: string;
  totalScore: number;
  percentage: number;
  stressLevel: 'Low Stress' | 'Moderate Stress' | 'High Stress';
  categoryPercentages: Record<string, number>;
}

interface MoodEntry {
  id: number;
  date: string;
  dayLabel: string;
  mood: 'Happy' | 'Good' | 'Neutral' | 'Low' | 'Very Low';
  stress: number;
  energy: number;
  sleep: number;
  journal: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  emotionalTheme: string;
  aiSummary: string;
}

interface StudentRecord {
  id: number;
  name: string;
  email: string;
  course: string;
  year: string;
  assessmentsCount: number;
  latestScore: number;
  latestStress: 'Low Stress' | 'Moderate Stress' | 'High Stress';
}

export default function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<'student' | 'admin'>('student');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'assessment' | 'mood' | 'recommendations' | 'history' | 'code'>('dashboard');

  // Student Profile
  const [studentUser] = useState({
    name: 'Aarav Sharma',
    email: 'student@mentalhealth.local',
    college: 'Apex Institute of Technology',
    course: 'B.Tech Computer Science & Engineering',
    year: '4th Year'
  });

  // Assessment Question Navigation & Answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({
    1: 4, 2: 4, 3: 3, 4: 4, 5: 3,
    6: 2, 7: 2, 8: 3, 9: 2, 10: 2,
    11: 2, 12: 4, 13: 3, 14: 2, 15: 4,
    16: 4, 17: 3, 18: 3, 19: 3, 20: 3,
    21: 3, 22: 4, 23: 3, 24: 2,
    25: 2, 26: 1, 27: 5, 28: 4,
    29: 2, 30: 3
  });

  // Assessment History
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentRecord[]>([
    {
      id: 1,
      date: 'Mar 10, 2026',
      totalScore: 78,
      percentage: 40.0,
      stressLevel: 'Moderate Stress',
      categoryPercentages: {
        'Academic Stress': 56,
        'Social Life': 32,
        'Family Environment': 26,
        'Social Media': 50,
        'Physical Health': 36,
        'Campus Environment': 20,
        'Financial Stress': 28
      }
    },
    {
      id: 2,
      date: 'Mar 24, 2026',
      totalScore: 72,
      percentage: 35.0,
      stressLevel: 'Moderate Stress',
      categoryPercentages: {
        'Academic Stress': 50,
        'Social Life': 30,
        'Family Environment': 24,
        'Social Media': 42,
        'Physical Health': 30,
        'Campus Environment': 16,
        'Financial Stress': 26
      }
    }
  ]);

  // Mood Tracker State
  const [moodForm, setMoodForm] = useState({
    mood: 'Good' as 'Happy' | 'Good' | 'Neutral' | 'Low' | 'Very Low',
    stress: 4,
    energy: 7,
    sleep: 7.2,
    journal: 'Finished my database lab assignment on schedule today. Feeling relieved and productive.'
  });

  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    theme: string;
    summary: string;
  } | null>({
    sentiment: 'Positive',
    theme: 'Academic Progress & Relief',
    summary: 'Your reflection shows positive momentum from completing coursework on time.'
  });

  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // 7-Day Mood Stream
  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([
    {
      id: 1,
      date: '2026-03-24',
      dayLabel: 'Tue',
      mood: 'Good',
      stress: 4,
      energy: 7,
      sleep: 7.2,
      journal: 'Finished my database lab assignment on schedule today.',
      sentiment: 'Positive',
      emotionalTheme: 'Academic Progress',
      aiSummary: 'Positive focus and manageable workload balance.'
    },
    {
      id: 2,
      date: '2026-03-25',
      dayLabel: 'Wed',
      mood: 'Neutral',
      stress: 5,
      energy: 6,
      sleep: 6.5,
      journal: 'Long lab sessions today. Need to organize my revision notes for next week.',
      sentiment: 'Neutral',
      emotionalTheme: 'Daily Academic Routine',
      aiSummary: 'Routine academic fatigue noted; pacing is helpful.'
    },
    {
      id: 3,
      date: '2026-03-26',
      dayLabel: 'Thu',
      mood: 'Low',
      stress: 7,
      energy: 4,
      sleep: 5.5,
      journal: 'Feeling anxious about upcoming campus placement interviews and tests.',
      sentiment: 'Negative',
      emotionalTheme: 'Career Preparation',
      aiSummary: 'Placement apprehension noted; structured preparation advised.'
    },
    {
      id: 4,
      date: '2026-03-27',
      dayLabel: 'Fri',
      mood: 'Neutral',
      stress: 5,
      energy: 6,
      sleep: 7.0,
      journal: 'Spoke with a senior who shared helpful placement guidance.',
      sentiment: 'Neutral',
      emotionalTheme: 'Peer Support',
      aiSummary: 'Social reassurance helped alleviate tension.'
    },
    {
      id: 5,
      date: '2026-03-28',
      dayLabel: 'Sat',
      mood: 'Good',
      stress: 4,
      energy: 8,
      sleep: 8.0,
      journal: 'Solved coding problems and attended the student robotics meetup.',
      sentiment: 'Positive',
      emotionalTheme: 'Technical Hobby',
      aiSummary: 'Active participation in technical projects restored energy.'
    },
    {
      id: 6,
      date: '2026-03-29',
      dayLabel: 'Sun',
      mood: 'Happy',
      stress: 3,
      energy: 9,
      sleep: 8.2,
      journal: 'Restful weekend. Calm revision and evening walk with friends.',
      sentiment: 'Positive',
      emotionalTheme: 'Rest & Recovery',
      aiSummary: 'Optimal sleep duration and refreshed emotional outlook.'
    },
    {
      id: 7,
      date: '2026-03-30',
      dayLabel: 'Mon',
      mood: 'Good',
      stress: 4,
      energy: 7,
      sleep: 7.2,
      journal: 'Steady morning routine. Classes went smoothly without rush.',
      sentiment: 'Positive',
      emotionalTheme: 'Balanced Routine',
      aiSummary: 'Healthy week commencement with consistent habits.'
    }
  ]);

  // Admin Registered Students
  const [adminStudents] = useState<StudentRecord[]>([
    { id: 1, name: 'Aarav Sharma', email: 'student@mentalhealth.local', course: 'B.Tech Computer Science', year: '4th Year', assessmentsCount: 2, latestScore: 35.0, latestStress: 'Moderate Stress' },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@student.local', course: 'B.Tech Information Technology', year: '3rd Year', assessmentsCount: 3, latestScore: 18.3, latestStress: 'Low Stress' },
    { id: 3, name: 'Rohan Verma', email: 'rohan.verma@student.local', course: 'B.Tech Electrical Engineering', year: '4th Year', assessmentsCount: 1, latestScore: 70.0, latestStress: 'High Stress' },
    { id: 4, name: 'Ananya Iyer', email: 'ananya.iyer@student.local', course: 'B.Tech Electronics & Comm', year: '2nd Year', assessmentsCount: 2, latestScore: 42.5, latestStress: 'Moderate Stress' }
  ]);

  // Admin Search & Filter
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStressFilter, setAdminStressFilter] = useState('All');
  const [inspectedStudent, setInspectedStudent] = useState<StudentRecord | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // PHP File Explorer selected path
  const [selectedFilePath, setSelectedFilePath] = useState('database/mental_health_system.sql');

  // Compute live score from current answers
  const currentScore = useMemo(() => {
    let total = 0;
    const catMap: Record<string, { sum: number; count: number }> = {};

    ASSESSMENT_QUESTIONS.forEach(q => {
      const raw = answers[q.id] || 3;
      const scored = q.reverse ? 6 - raw : raw;
      total += scored;

      if (!catMap[q.category]) {
        catMap[q.category] = { sum: 0, count: 0 };
      }
      catMap[q.category].sum += scored;
      catMap[q.category].count += 1;
    });

    const minScore = 30;
    const maxScore = 150;
    const pct = Math.round((((total - minScore) / (maxScore - minScore)) * 100) * 10) / 10;
    
    let classification: 'Low Stress' | 'Moderate Stress' | 'High Stress' = 'Low Stress';
    if (pct > 66.6) classification = 'High Stress';
    else if (pct > 33.3) classification = 'Moderate Stress';

    const categoryPercentages: Record<string, number> = {};
    Object.keys(catMap).forEach(cat => {
      const c = catMap[cat];
      categoryPercentages[cat] = Math.round((((c.sum - c.count) / (c.count * 4)) * 100));
    });

    return { total, pct, classification, categoryPercentages };
  }, [answers]);

  const latestAssessment = assessmentHistory[assessmentHistory.length - 1];
  const wellnessScore = Math.round(100 - (latestAssessment?.percentage || 35));

  // Assessment submission
  const handleAssessmentSubmit = () => {
    const res = currentScore;
    const newRecord: AssessmentRecord = {
      id: assessmentHistory.length + 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalScore: res.total,
      percentage: res.pct,
      stressLevel: res.classification,
      categoryPercentages: res.categoryPercentages
    };

    setAssessmentHistory([...assessmentHistory, newRecord]);
    showNotification(`Assessment saved. Your stress classification is ${res.classification}.`);
    setCurrentPage('dashboard');
  };

  // AI Journal reflection check
  const handleAnalyzeJournal = () => {
    if (!moodForm.journal.trim()) {
      showNotification('Please enter a short journal thought first.');
      return;
    }

    setIsAnalyzingAi(true);

    setTimeout(() => {
      const lower = moodForm.journal.toLowerCase();
      let sent: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
      let theme = 'General Well-being';

      const positiveWords = ['good', 'happy', 'relieved', 'great', 'calm', 'productive', 'scheduled', 'rested', 'solved'];
      const negativeWords = ['stressed', 'anxious', 'tired', 'worried', 'difficult', 'overwhelmed', 'fatigue', 'pressure'];

      const posCount = positiveWords.filter(w => lower.includes(w)).length;
      const negCount = negativeWords.filter(w => lower.includes(w)).length;

      if (lower.includes('exam') || lower.includes('assignment') || lower.includes('lab') || lower.includes('placement')) {
        theme = 'Academic & Studies';
      } else if (lower.includes('friend') || lower.includes('senior') || lower.includes('roommate')) {
        theme = 'Social Connection';
      } else if (lower.includes('sleep') || lower.includes('tired') || lower.includes('walk')) {
        theme = 'Daily Routine & Rest';
      }

      if (posCount > negCount) sent = 'Positive';
      else if (negCount > posCount) sent = 'Negative';

      setAiAnalysisResult({
        sentiment: sent,
        theme,
        summary: `Reflective sentiment appears ${sent.toLowerCase()}. Primary focus is centered around ${theme.toLowerCase()}.`
      });

      setIsAnalyzingAi(false);
      showNotification('Journal analysis completed.');
    }, 400);
  };

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MoodEntry = {
      id: moodLogs.length + 1,
      date: new Date().toISOString().split('T')[0],
      dayLabel: 'Today',
      mood: moodForm.mood,
      stress: moodForm.stress,
      energy: moodForm.energy,
      sleep: moodForm.sleep,
      journal: moodForm.journal,
      sentiment: aiAnalysisResult?.sentiment || 'Neutral',
      emotionalTheme: aiAnalysisResult?.theme || 'Daily Routine',
      aiSummary: aiAnalysisResult?.summary || 'Mood entry logged.'
    };

    setMoodLogs([newEntry, ...moodLogs.slice(0, 6)]);
    showNotification("Today's mood entry recorded successfully.");
    setCurrentPage('dashboard');
  };

  // Filtered admin students
  const filteredStudents = useMemo(() => {
    return adminStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                            s.course.toLowerCase().includes(adminSearch.toLowerCase());
      const matchesFilter = adminStressFilter === 'All' || s.latestStress === adminStressFilter;
      return matchesSearch && matchesFilter;
    });
  }, [adminStudents, adminSearch, adminStressFilter]);

  const currentQ = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans">
      
      {/* Discreet Disclaimer Bar */}
      <div className="bg-[#FFFBEB] border-b border-[#FEF3C7] text-[#92400E] text-[13px] py-1.5 px-4 text-center">
        <span>Important: This system is for wellness monitoring and educational purposes only. It does not provide medical diagnosis.</span>
      </div>

      {/* Clean Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="font-semibold text-[17px] text-[#1E293B] leading-none">MindPulse</div>
              <span className="text-[12px] text-[#64748B]">Student Mental Wellness</span>
            </div>
          </div>

          {/* Right: User Profile & Mode Switcher */}
          <div className="flex items-center gap-4 text-[14px]">
            {/* Role switch toggle */}
            <div className="hidden sm:flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] text-[12px]">
              <button
                onClick={() => { setCurrentRole('student'); setCurrentPage('dashboard'); }}
                className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
                  currentRole === 'student' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => { setCurrentRole('admin'); setCurrentPage('dashboard'); }}
                className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
                  currentRole === 'admin' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Faculty Admin
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#1E293B]">
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-medium text-[13px]">
                {currentRole === 'student' ? 'A' : 'F'}
              </div>
              <span className="font-medium hidden sm:inline">
                {currentRole === 'student' ? studentUser.name : 'Faculty Counselor'}
              </span>
            </div>

            <button 
              onClick={() => showNotification('Session logged out.')}
              className="text-[#64748B] hover:text-[#1E293B] text-[13px] flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Clean Navigation Bar */}
      <nav className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-2">
          
          <div className="flex items-center gap-1.5 text-[14px]">
            {currentRole === 'student' ? (
              <>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('assessment')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'assessment'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  Assessment
                </button>
                <button
                  onClick={() => setCurrentPage('mood')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'mood'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  Daily Mood
                </button>
                <button
                  onClick={() => setCurrentPage('recommendations')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'recommendations'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  Wellness Guidance
                </button>
                <button
                  onClick={() => setCurrentPage('history')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'history'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  History
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  Admin Overview
                </button>
                <button
                  onClick={() => setCurrentPage('history')}
                  className={`px-3.5 py-1.5 rounded-[8px] transition-colors ${
                    currentPage === 'history'
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 font-normal'
                  }`}
                >
                  Students Directory
                </button>
              </>
            )}
          </div>

          {/* PHP Codebase Viewer tab link */}
          <button
            onClick={() => setCurrentPage('code')}
            className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
              currentPage === 'code'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>PHP Source</span>
          </button>

        </div>
      </nav>

      {/* Subtle Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white text-[13px] px-4 py-2.5 rounded-[8px] shadow-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ========================================================
            PAGE 1: STUDENT DASHBOARD
            ======================================================== */}
        {currentRole === 'student' && currentPage === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Welcome Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                  Welcome back, {studentUser.name}
                </h1>
                <p className="text-[14px] text-[#64748B] mt-0.5">
                  {studentUser.course} &bull; Here is your recent mental wellness overview.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('mood')}
                  className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] text-[14px] font-medium px-3.5 py-2 rounded-[8px] transition-colors"
                >
                  Log Daily Mood
                </button>
                <button
                  onClick={() => setCurrentPage('assessment')}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white text-[14px] font-medium px-4 py-2 rounded-[8px] transition-colors"
                >
                  Take Assessment
                </button>
              </div>
            </div>

            {/* 4 Dashboard Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Mental Wellness Score */}
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div>
                  <span className="text-[13px] font-medium text-[#64748B]">Mental Wellness Score</span>
                  <div className="text-[28px] font-bold text-[#1E293B] mt-1">
                    {wellnessScore} <span className="text-[15px] font-normal text-[#64748B]">/ 100</span>
                  </div>
                  <div className="text-[13px] font-medium text-[#14B8A6] mt-0.5">
                    {latestAssessment?.stressLevel || 'Moderate Stress'}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#2563EB] h-2 rounded-full" 
                      style={{ width: `${wellnessScore}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Stress Level */}
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div>
                  <span className="text-[13px] font-medium text-[#64748B]">Stress Classification</span>
                  <div className="text-[20px] font-semibold text-[#1E293B] mt-1.5">
                    {latestAssessment?.stressLevel || 'Moderate Stress'}
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    Normalized index: {latestAssessment?.percentage || 35}%
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-[#E2E8F0] text-[12px] text-[#64748B]">
                  Based on recent 30-item survey
                </div>
              </div>

              {/* Today's Mood */}
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div>
                  <span className="text-[13px] font-medium text-[#64748B]">Today's Mood</span>
                  <div className="text-[20px] font-semibold text-[#1E293B] mt-1.5 flex items-center gap-2">
                    <span>🙂</span>
                    <span>{moodLogs[0]?.mood || 'Good'}</span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    Reported Stress: {moodLogs[0]?.stress || 4} / 10
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-[#E2E8F0] text-[12px] text-[#64748B]">
                  Energy level: {moodLogs[0]?.energy || 7} / 10
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div>
                  <span className="text-[13px] font-medium text-[#64748B]">Sleep Last Night</span>
                  <div className="text-[28px] font-bold text-[#1E293B] mt-1">
                    {moodLogs[0]?.sleep || 7.2} <span className="text-[15px] font-normal text-[#64748B]">hours</span>
                  </div>
                  <p className="text-[13px] text-[#14B8A6] font-medium mt-0.5">
                    Within healthy range (7+ hrs)
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-[#E2E8F0] text-[12px] text-[#64748B]">
                  Consistent sleep schedule
                </div>
              </div>

            </div>

            {/* Middle Grid: Mood & Stress Trends + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* 7-Day Trend Chart (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#1E293B]">7-Day Wellness Trends</h2>
                    <p className="text-[13px] text-[#64748B]">Track mood and stress levels over the past week.</p>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                      <span>Stress Level</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]"></span>
                      <span>Sleep (Hours)</span>
                    </div>
                  </div>
                </div>

                {/* Clean SVG Trend Chart */}
                <div className="h-56 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180">
                    <line x1="40" y1="20" x2="680" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="65" x2="680" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="110" x2="680" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="155" x2="680" y2="155" stroke="#F1F5F9" strokeWidth="1" />

                    <text x="15" y="25" fill="#94A3B8" fontSize="11">High</text>
                    <text x="15" y="90" fill="#94A3B8" fontSize="11">Med</text>
                    <text x="15" y="155" fill="#94A3B8" fontSize="11">Low</text>

                    {/* Stress curve */}
                    <path
                      d="M 60 110 Q 160 85, 260 70 T 460 120 T 660 110"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                    />

                    {/* Sleep dashed line */}
                    <path
                      d="M 60 55 L 160 70 L 260 85 L 360 60 L 460 45 L 560 40 L 660 55"
                      fill="none"
                      stroke="#14B8A6"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {moodLogs.slice(0, 7).reverse().map((entry, idx) => {
                      const cx = 60 + idx * 100;
                      const cy = 160 - (entry.stress * 14);

                      return (
                        <g key={entry.id}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2"
                          />
                          <text x={cx} y="175" textAnchor="middle" fill="#64748B" fontSize="12">
                            {entry.dayLabel}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Category-Wise Stress Breakdown (4 cols) */}
              <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1E293B] mb-1">Stress by Category</h2>
                  <p className="text-[13px] text-[#64748B] mb-4">Assessment domain percentages.</p>

                  <div className="space-y-3">
                    {latestAssessment && Object.entries(latestAssessment.categoryPercentages).slice(0, 5).map(([cat, pct]) => {
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-[13px] text-[#1E293B] mb-1">
                            <span>{cat}</span>
                            <span className="font-medium text-[#64748B]">{pct}%</span>
                          </div>
                          <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                pct >= 67 ? 'bg-[#EF4444]' : pct >= 34 ? 'bg-[#F59E0B]' : 'bg-[#14B8A6]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] mt-4">
                  <button
                    onClick={() => setCurrentPage('recommendations')}
                    className="text-[13px] font-medium text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    View wellness suggestions <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Section: AI Journal Insight & Support */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-semibold text-[#1E293B]">Recent Reflection & Support</h2>
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB]">
                  AI Reflection Check
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-4 text-[14px]">
                <p className="text-[#1E293B] italic">
                  "{moodLogs[0]?.journal}"
                </p>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] text-[13px] text-[#64748B]">
                  <strong>Identified Theme:</strong> {aiAnalysisResult?.theme} &bull; {aiAnalysisResult?.summary}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#64748B]">
                <div>
                  Need confidential campus support? <strong>Tele-MANAS:</strong> 14416 (24x7) &bull; <strong>Campus Counseling:</strong> Ext 404
                </div>
                <button
                  onClick={() => setCurrentPage('mood')}
                  className="text-[#2563EB] font-medium hover:underline"
                >
                  Write in journal →
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 2: ASSESSMENT (Question by Question Flow)
            ======================================================== */}
        {currentRole === 'student' && currentPage === 'assessment' && (
          <div className="max-w-[760px] mx-auto space-y-6">
            
            {/* Header & Progress */}
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                Mental Wellness Assessment
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Answer each question based on how you have felt during the past two weeks.
              </p>

              {/* Progress status */}
              <div className="mt-5">
                <div className="flex justify-between text-[13px] text-[#64748B] mb-1.5">
                  <span>Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06)] space-y-6">
              
              <div>
                <span className="text-[12px] font-medium text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded">
                  {currentQ.category}
                </span>
                <h2 className="text-[18px] sm:text-[20px] font-medium text-[#1E293B] mt-3 leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* 5 Clean Selectable Radio-Card Buttons */}
              <div className="space-y-2.5">
                {[
                  { val: 1, label: 'Never' },
                  { val: 2, label: 'Rarely' },
                  { val: 3, label: 'Sometimes' },
                  { val: 4, label: 'Often' },
                  { val: 5, label: 'Always' }
                ].map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.val;
                  return (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.val })}
                      className={`w-full text-left p-3.5 rounded-[8px] border transition-all flex items-center justify-between text-[14px] ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-medium'
                          : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#94A3B8]'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[12px] text-[#64748B]">Score: {opt.val}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  className={`px-4 py-2 rounded-[8px] border text-[14px] font-medium transition-colors ${
                    currentQuestionIndex === 0
                      ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                      : 'border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Previous
                </button>

                {currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(ASSESSMENT_QUESTIONS.length - 1, prev + 1))}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white text-[14px] font-medium px-5 py-2 rounded-[8px] transition-colors"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAssessmentSubmit}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white text-[14px] font-medium px-6 py-2 rounded-[8px] transition-colors"
                  >
                    Complete Assessment
                  </button>
                )}
              </div>

            </div>

            {/* Quick jump questions picker */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 text-[12px]">
              <span className="font-medium text-[#64748B] block mb-2">Jump to Question:</span>
              <div className="grid grid-cols-10 gap-1.5">
                {ASSESSMENT_QUESTIONS.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-7 rounded-[6px] font-medium flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-[#2563EB] text-white'
                          : answers[q.id]
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 3: DAILY MOOD TRACKER
            ======================================================== */}
        {currentRole === 'student' && currentPage === 'mood' && (
          <div className="max-w-[760px] mx-auto space-y-6">
            
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                Daily Mood Tracker
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Log your daily mood, stress level, sleep, and personal reflection.
              </p>
            </div>

            <form onSubmit={handleSaveMood} className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06)] space-y-6">
              
              {/* Heading: How are you feeling today? */}
              <div>
                <label className="block text-[15px] font-semibold text-[#1E293B] mb-3">
                  How are you feeling today?
                </label>

                <div className="grid grid-cols-5 gap-2.5">
                  {[
                    { key: 'Happy', emoji: '😊', label: 'Happy' },
                    { key: 'Good', emoji: '🙂', label: 'Good' },
                    { key: 'Neutral', emoji: '😐', label: 'Neutral' },
                    { key: 'Low', emoji: '😔', label: 'Low' },
                    { key: 'Very Low', emoji: '😞', label: 'Very Low' }
                  ].map((m) => {
                    const isSelected = moodForm.mood === m.key;
                    return (
                      <button
                        type="button"
                        key={m.key}
                        onClick={() => setMoodForm(prev => ({ ...prev, mood: m.key as any }))}
                        className={`p-3 rounded-[10px] border text-center transition-all ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-medium'
                            : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl">{m.emoji}</div>
                        <div className="text-[12px] mt-1">{m.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stress Level & Energy Level Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="flex justify-between text-[14px] text-[#1E293B] font-medium mb-1.5">
                    <span>Stress Level</span>
                    <span>{moodForm.stress} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodForm.stress}
                    onChange={(e) => setMoodForm(prev => ({ ...prev, stress: Number(e.target.value) }))}
                    className="w-full accent-[#2563EB] cursor-pointer"
                  />
                  <div className="flex justify-between text-[12px] text-[#64748B] mt-1">
                    <span>1 (Low)</span>
                    <span>10 (High)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[14px] text-[#1E293B] font-medium mb-1.5">
                    <span>Energy Level</span>
                    <span>{moodForm.energy} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodForm.energy}
                    onChange={(e) => setMoodForm(prev => ({ ...prev, energy: Number(e.target.value) }))}
                    className="w-full accent-[#14B8A6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[12px] text-[#64748B] mt-1">
                    <span>1 (Exhausted)</span>
                    <span>10 (High)</span>
                  </div>
                </div>
              </div>

              {/* Sleep Duration */}
              <div>
                <label className="block text-[14px] font-medium text-[#1E293B] mb-1.5">
                  Sleep Duration (Hours)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={moodForm.sleep}
                    onChange={(e) => setMoodForm(prev => ({ ...prev, sleep: Number(e.target.value) }))}
                    className="w-32 border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                  />
                  <span className="text-[13px] text-[#64748B]">
                    {moodForm.sleep >= 7.0 ? 'Optimal restful sleep' : 'Below recommended 7+ hours'}
                  </span>
                </div>
              </div>

              {/* Journal */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[14px] font-medium text-[#1E293B]">
                    Journal Thought Reflection
                  </label>
                  <button
                    type="button"
                    onClick={handleAnalyzeJournal}
                    disabled={isAnalyzingAi}
                    className="text-[13px] font-medium text-[#2563EB] hover:underline"
                  >
                    {isAnalyzingAi ? 'Analyzing...' : 'Analyze with AI'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={moodForm.journal}
                  onChange={(e) => setMoodForm(prev => ({ ...prev, journal: e.target.value }))}
                  placeholder="Write anything you’d like to reflect on today…"
                  className="w-full border border-[#E2E8F0] rounded-[8px] p-3 text-[14px] focus:outline-[#2563EB]"
                />
              </div>

              {/* AI Result Callout */}
              {aiAnalysisResult && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-4 text-[13px]">
                  <div className="flex justify-between items-center mb-1 text-[#1E293B] font-medium">
                    <span>AI Reflection Summary</span>
                    <span className="text-[12px] px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB]">
                      {aiAnalysisResult.sentiment} Sentiment
                    </span>
                  </div>
                  <p className="text-[#64748B] mt-1">{aiAnalysisResult.summary}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white text-[14px] font-medium px-5 py-2.5 rounded-[8px] transition-colors"
                >
                  Save Today's Mood
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ========================================================
            PAGE 4: WELLNESS GUIDANCE (Recommendations)
            ======================================================== */}
        {currentRole === 'student' && currentPage === 'recommendations' && (
          <div className="space-y-6">
            
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                Personalized Wellness Guidance
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Practical suggestions based on your stress scores to help you maintain balance.
              </p>
            </div>

            {/* Explanation box: What this means */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
              <h2 className="text-[16px] font-semibold text-[#1E293B]">What this means</h2>
              <p className="text-[14px] text-[#64748B] mt-1 leading-relaxed">
                Your recent responses indicate a moderate level of stress. Consider reviewing the wellness suggestions below to organize your studies and physical routine.
              </p>
            </div>

            {/* Clean Recommendation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <h3 className="text-[16px] font-semibold text-[#1E293B]">Manage Academic Stress</h3>
                <p className="text-[14px] text-[#64748B] mt-2 leading-relaxed">
                  Break large tasks into smaller tasks and include short breaks in your study schedule. Take advantage of faculty office hours when coursework feels challenging.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <h3 className="text-[16px] font-semibold text-[#1E293B]">Improve Sleep</h3>
                <p className="text-[14px] text-[#64748B] mt-2 leading-relaxed">
                  Try maintaining a consistent sleep schedule and reducing screen exposure before bedtime. Avoid excessive late-night caffeine during examination weeks.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <h3 className="text-[16px] font-semibold text-[#1E293B]">Mindful Digital Consumption</h3>
                <p className="text-[14px] text-[#64748B] mt-2 leading-relaxed">
                  Turn off non-essential social notifications while studying. Remember that peer feeds often showcase highlights rather than daily realities.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <h3 className="text-[16px] font-semibold text-[#1E293B]">Campus & Social Support</h3>
                <p className="text-[14px] text-[#64748B] mt-2 leading-relaxed">
                  Stay connected with trusted classmates and participate in small group discussions. Talking openly with peers helps relieve academic pressure.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 5: HISTORY TABLE
            ======================================================== */}
        {((currentRole === 'student' && currentPage === 'history') || (currentRole === 'admin' && currentPage === 'history')) && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                  {currentRole === 'student' ? 'Assessment History' : 'Students Directory'}
                </h1>
                <p className="text-[14px] text-[#64748B] mt-0.5">
                  {currentRole === 'student' 
                    ? 'Review previous assessment results and progress over time.'
                    : 'Registered students and their latest stress evaluations.'}
                </p>
              </div>

              {currentRole === 'student' && (
                <button
                  onClick={() => window.print()}
                  className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] text-[13px] font-medium px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print History
                </button>
              )}
            </div>

            {currentRole === 'student' ? (
              /* Student Assessment Table */
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-[13px]">
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Wellness Score</th>
                        <th className="py-3 px-4 font-medium">Stress Level</th>
                        <th className="py-3 px-4 font-medium">Raw Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {assessmentHistory.map((rec) => {
                        const score = Math.round(100 - rec.percentage);
                        const isLow = rec.stressLevel === 'Low Stress';
                        const isMod = rec.stressLevel === 'Moderate Stress';

                        return (
                          <tr key={rec.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-3.5 px-4 font-medium text-[#1E293B]">{rec.date}</td>
                            <td className="py-3.5 px-4">{score} / 100</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                                isLow ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                isMod ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {rec.stressLevel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[#64748B]">{rec.totalScore} / 150</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Admin Students Directory Table */
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)] space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="border border-[#E2E8F0] rounded-[8px] px-3 py-1.5 text-[13px] w-56 focus:outline-[#2563EB]"
                    />
                    <select
                      value={adminStressFilter}
                      onChange={(e) => setAdminStressFilter(e.target.value)}
                      className="border border-[#E2E8F0] rounded-[8px] px-3 py-1.5 text-[13px] focus:outline-[#2563EB]"
                    >
                      <option value="All">All Levels</option>
                      <option value="Low Stress">Low Stress</option>
                      <option value="Moderate Stress">Moderate Stress</option>
                      <option value="High Stress">High Stress</option>
                    </select>
                  </div>
                  <span className="text-[13px] text-[#64748B]">{filteredStudents.length} students found</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[#64748B] text-[13px]">
                        <th className="py-2.5 px-3 font-medium">Student Name</th>
                        <th className="py-2.5 px-3 font-medium">Course</th>
                        <th className="py-2.5 px-3 font-medium">Year</th>
                        <th className="py-2.5 px-3 font-medium">Surveys</th>
                        <th className="py-2.5 px-3 font-medium">Stress Status</th>
                        <th className="py-2.5 px-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3">
                            <span className="font-medium text-[#1E293B]">{s.name}</span>
                            <div className="text-[12px] text-[#64748B]">{s.email}</div>
                          </td>
                          <td className="py-3 px-3">{s.course}</td>
                          <td className="py-3 px-3 text-[#64748B]">{s.year}</td>
                          <td className="py-3 px-3">{s.assessmentsCount} tests</td>
                          <td className="py-3 px-3">
                            <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                              s.latestStress === 'Low Stress' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                              s.latestStress === 'Moderate Stress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {s.latestStress}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => setInspectedStudent(s)}
                              className="text-[13px] font-medium text-[#2563EB] hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin Inspected Student Details Modal */}
            {inspectedStudent && (
              <div className="fixed inset-0 z-50 bg-[#1E293B]/30 flex items-center justify-center p-4">
                <div className="bg-white rounded-[12px] max-w-md w-full p-6 shadow-lg border border-[#E2E8F0] space-y-4">
                  <div className="flex justify-between items-start pb-2 border-b border-[#E2E8F0]">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#1E293B]">{inspectedStudent.name}</h3>
                      <p className="text-[13px] text-[#64748B]">{inspectedStudent.email}</p>
                    </div>
                    <button onClick={() => setInspectedStudent(null)} className="text-[#64748B] hover:text-[#1E293B]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-[14px]">
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Course</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.course}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Year</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.year}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Assessments Completed</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.assessmentsCount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Stress Classification</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.latestStress}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setInspectedStudent(null)}
                      className="bg-[#2563EB] text-white text-[13px] font-medium px-4 py-2 rounded-[8px]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            PAGE 6: ADMIN OVERVIEW DASHBOARD
            ======================================================== */}
        {currentRole === 'admin' && currentPage === 'dashboard' && (
          <div className="space-y-6">
            
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                Faculty & Counseling Overview
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Aggregated student wellness metrics across departments.
              </p>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">Total Students</span>
                <div className="text-[28px] font-bold text-[#1E293B] mt-1">4</div>
                <p className="text-[13px] text-[#64748B] mt-1">Enrolled accounts</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">Total Assessments</span>
                <div className="text-[28px] font-bold text-[#1E293B] mt-1">8</div>
                <p className="text-[13px] text-[#64748B] mt-1">Surveys evaluated</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">Average Wellness</span>
                <div className="text-[28px] font-bold text-[#1E293B] mt-1">68 / 100</div>
                <p className="text-[13px] text-[#14B8A6] font-medium mt-1">Stable campus average</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">High Stress Indicator</span>
                <div className="text-[28px] font-bold text-[#EF4444] mt-1">1</div>
                <p className="text-[13px] text-[#64748B] mt-1">Counselor review advised</p>
              </div>

            </div>

            {/* Quick Students Summary */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[18px] font-semibold text-[#1E293B]">Recent Student Evaluations</h2>
                <button
                  onClick={() => setCurrentPage('history')}
                  className="text-[13px] font-medium text-[#2563EB] hover:underline"
                >
                  View full directory →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] text-[13px]">
                      <th className="py-2.5 px-3 font-medium">Student Name</th>
                      <th className="py-2.5 px-3 font-medium">Course</th>
                      <th className="py-2.5 px-3 font-medium">Stress Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {adminStudents.map(s => (
                      <tr key={s.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-3 font-medium text-[#1E293B]">{s.name}</td>
                        <td className="py-3 px-3 text-[#64748B]">{s.course}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                            s.latestStress === 'Low Stress' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                            s.latestStress === 'Moderate Stress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {s.latestStress}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 7: PHP SOURCE CODE VIEWER (Clean Explorer)
            ======================================================== */}
        {currentPage === 'code' && (
          <div className="space-y-4">
            
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                PHP & MySQL Source Files
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Local XAMPP codebase files (located in <code>/mental-health/</code>).
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
              
              {/* Sidebar */}
              <div className="border-r border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[13px] space-y-4">
                <div>
                  <span className="font-semibold text-[#64748B] text-[11px] uppercase tracking-wider block mb-1.5">Database</span>
                  <button
                    onClick={() => setSelectedFilePath('database/mental_health_system.sql')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[6px] truncate ${
                      selectedFilePath === 'database/mental_health_system.sql' ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-slate-100'
                    }`}
                  >
                    database/mental_health_system.sql
                  </button>
                </div>

                <div>
                  <span className="font-semibold text-[#64748B] text-[11px] uppercase tracking-wider block mb-1.5">Config & Includes</span>
                  <div className="space-y-1">
                    {['config/database.php', 'config/config.php', 'includes/functions.php', 'includes/auth.php'].map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFilePath(f)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-[6px] truncate ${
                          selectedFilePath === f ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-slate-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-[#64748B] text-[11px] uppercase tracking-wider block mb-1.5">Student Flow</span>
                  <div className="space-y-1">
                    {['dashboard.php', 'assessment.php', 'submit_assessment.php', 'mood_tracker.php', 'save_mood.php', 'recommendations.php', 'history.php'].map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFilePath(f)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-[6px] truncate ${
                          selectedFilePath === f ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-slate-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-[#64748B] text-[11px] uppercase tracking-wider block mb-1.5">Admin & API</span>
                  <div className="space-y-1">
                    {['admin/dashboard.php', 'admin/students.php', 'api/analyze_journal.php', 'api/mood_data.php'].map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFilePath(f)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-[6px] truncate ${
                          selectedFilePath === f ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-slate-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code viewer pane */}
              <div className="md:col-span-3 p-5 font-mono text-[12px] text-[#1E293B] bg-white overflow-y-auto max-h-[550px] leading-relaxed">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0] mb-3 text-[12px] text-[#64748B]">
                  <span className="font-semibold text-[#2563EB] font-sans">{selectedFilePath}</span>
                  <span className="font-sans">PHP 8+ &bull; MySQL PDO</span>
                </div>

                <pre className="whitespace-pre overflow-x-auto text-[#334155]">
                  {selectedFilePath === 'database/mental_health_system.sql' ? (
`-- Database: mental_health_system (MySQL / MariaDB)
CREATE DATABASE IF NOT EXISTS mental_health_system;
USE mental_health_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_score INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  stress_level ENUM('Low Stress', 'Moderate Stress', 'High Stress') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE mood_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mood ENUM('Happy', 'Good', 'Neutral', 'Low', 'Very Low') NOT NULL,
  stress_level INT NOT NULL,
  energy_level INT NOT NULL,
  sleep_hours DECIMAL(3,1) NOT NULL,
  journal TEXT DEFAULT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_day (user_id, entry_date)
);`
                  ) : selectedFilePath === 'config/database.php' ? (
`<?php
/**
 * Database Connection via PDO
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'mental_health_system');

class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
    }

    public static function getInstance() {
        if (!self::$instance) self::$instance = new Database();
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}

function getDB() {
    return Database::getInstance()->getConnection();
}
?>`
                  ) : (
`<?php
/**
 * mental-health/${selectedFilePath}
 * AI-Based Student Mental Health Monitoring System
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';
// Fully compatible with local XAMPP setup: http://localhost/mental-health/
?>`
                  )}
                </pre>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Clean, Simple Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-12 py-6 text-center text-[13px] text-[#64748B]">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            &copy; {new Date().getFullYear()} MindPulse &bull; Student Mental Wellness Monitoring System
          </div>
          <div className="flex items-center gap-4">
            <span>B.Tech CSE Project</span>
            <span>XAMPP &bull; PHP 8+ &bull; MySQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
