import React, { useState, useMemo, useEffect } from 'react';
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
  ShieldCheck,
  Check,
  Smile,
  Meh,
  Frown,
  Eye,
  X,
  UserPlus,
  LogIn,
  GraduationCap,
  Database,
  Lock,
  Phone
} from 'lucide-react';
import { AuthStorage, UserProfile, AssessmentRecord, MoodEntry } from './lib/authStorage';
import { isSupabaseConfigured } from './lib/supabase';

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

export default function App() {
  // Current Authenticated User (Persisted)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => AuthStorage.getCurrentUser());

  // Navigation: 'dashboard' | 'assessment' | 'mood' | 'recommendations' | 'history' | 'admin'
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'assessment' | 'mood' | 'recommendations' | 'history' | 'admin'>('dashboard');

  // Auth Modal State: null | 'login' | 'register'
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);

  // Registration Form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: 'Apex Institute of Technology',
    course: 'B.Tech Computer Science & Engineering',
    year: '4th Year',
    age: 21,
    gender: 'Prefer not to say'
  });

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // User-Scoped Persistent Assessments & Moods
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);

  // Load user data on user switch
  useEffect(() => {
    if (currentUser) {
      setAssessments(AuthStorage.getUserAssessments(currentUser.id));
      setMoodLogs(AuthStorage.getUserMoods(currentUser.id));
    }
  }, [currentUser]);

  // Assessment Question Navigation & Active Answers
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

  // Mood Tracker Form
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

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  // Admin View State
  const [allStudents, setAllStudents] = useState<UserProfile[]>(() => AuthStorage.getAllUsers());
  const [adminSearch, setAdminSearch] = useState('');
  const [inspectedStudent, setInspectedStudent] = useState<UserProfile | null>(null);

  // Refresh students list
  const refreshStudents = () => {
    setAllStudents(AuthStorage.getAllUsers());
  };

  // Live Score Calculation
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

  const latestAssessment = assessments[0];
  const wellnessScore = latestAssessment ? Math.round(100 - latestAssessment.percentage) : 72;

  // Handle User Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setAuthError('Please complete all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email.trim())) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (registerForm.password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    if (registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    const ageNum = Number(registerForm.age);
    if (isNaN(ageNum) || ageNum < 15 || ageNum > 85) {
      setAuthError('Please enter a valid student age (between 15 and 85).');
      return;
    }

    const res = await AuthStorage.registerUser({
      name: registerForm.name.trim(),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      phone: registerForm.phone.trim() || '+91 9000000000',
      college: registerForm.college.trim() || 'Engineering Institute',
      course: registerForm.course.trim() || 'B.Tech CSE',
      year: registerForm.year,
      age: ageNum,
      gender: registerForm.gender,
      role: 'student'
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthModal(null);
      refreshStudents();
      showNotification(`Account created successfully! Welcome, ${res.user.name}. Your profile and data are saved.`);
      setCurrentPage('dashboard');
    } else {
      setAuthError(res.error || 'Registration failed.');
    }
  };

  // Handle User Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }

    const res = await AuthStorage.login(loginEmail.trim().toLowerCase(), loginPassword);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthModal(null);
      showNotification(`Signed in as ${res.user.name}.`);
      if (res.user.role === 'admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('dashboard');
      }
    } else {
      setAuthError(res.error || 'Login failed.');
    }
  };

  // Switch to preset demo user
  const handleQuickSwitchUser = (email: string) => {
    const users = AuthStorage.getAllUsers();
    const target = users.find(u => u.email === email);
    if (target) {
      AuthStorage.setCurrentUser(target);
      setCurrentUser(target);
      setAuthModal(null);
      showNotification(`Switched to ${target.name}.`);
      if (target.role === 'admin') setCurrentPage('admin');
      else setCurrentPage('dashboard');
    }
  };

  // Logout
  const handleLogout = () => {
    AuthStorage.logout();
    const users = AuthStorage.getAllUsers();
    const guestUser = users[0]; // Fallback to demo student
    setCurrentUser(guestUser);
    showNotification('Logged out successfully.');
    setCurrentPage('dashboard');
  };

  // Save Assessment
  const handleAssessmentSubmit = () => {
    const res = currentScore;
    const newRecord: AssessmentRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalScore: res.total,
      percentage: res.pct,
      stressLevel: res.classification,
      categoryPercentages: res.categoryPercentages
    };

    AuthStorage.saveUserAssessment(currentUser.id, newRecord);
    setAssessments(prev => [newRecord, ...prev]);
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

  // Save Mood
  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MoodEntry = {
      id: Date.now(),
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

    AuthStorage.saveUserMood(currentUser.id, newEntry);
    setMoodLogs(prev => [newEntry, ...prev.slice(0, 6)]);
    showNotification("Today's mood entry recorded successfully.");
    setCurrentPage('dashboard');
  };

  const currentQ = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100);

  // Filtered Students for Admin
  const filteredStudents = useMemo(() => {
    return allStudents.filter(u => u.role === 'student' && (
      u.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.course.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(adminSearch.toLowerCase())
    ));
  }, [allStudents, adminSearch]);

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
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="font-semibold text-[17px] text-[#1E293B] leading-none">MindPulse</div>
              <span className="text-[12px] text-[#64748B]">Student Mental Wellness</span>
            </div>
          </div>

          {/* Right: User Profile & Authentication Buttons */}
          <div className="flex items-center gap-3 text-[14px]">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[#1E293B]">
                  <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-medium text-[13px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="font-medium hidden sm:inline">{currentUser.name}</span>
                </div>

                <button
                  onClick={() => setAuthModal('register')}
                  className="hidden md:flex items-center gap-1 text-[13px] text-[#2563EB] bg-[#EFF6FF] hover:bg-blue-100 px-2.5 py-1.5 rounded-[8px] font-medium transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register New
                </button>

                <button 
                  onClick={handleLogout}
                  className="text-[#64748B] hover:text-[#1E293B] text-[13px] flex items-center gap-1 p-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModal('login')}
                  className="text-[#2563EB] font-medium hover:underline text-[13px] px-2 py-1"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthModal('register')}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13px] px-3.5 py-1.5 rounded-[8px] transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Clean Navigation Bar */}
      <nav className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-2">
          
          <div className="flex items-center gap-1.5 text-[14px]">
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
            {currentPage === 'admin' && (
              <span className="px-3 py-1.5 rounded-[8px] bg-purple-50 text-purple-700 font-medium text-[13px]">
                Faculty Admin Console
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
            <span>{currentUser.role === 'admin' ? 'Role: Faculty Admin' : `Student: ${currentUser.course}`}</span>
          </div>

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
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Welcome Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                  Welcome, {currentUser.name}
                </h1>
                <p className="text-[14px] text-[#64748B] mt-0.5">
                  {currentUser.college} &bull; {currentUser.course} &bull; Personal wellness tracker.
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

                    {(moodLogs.length > 0 ? moodLogs : [{ id: 1, dayLabel: 'Today', stress: 4 }]).slice(0, 7).reverse().map((entry, idx) => {
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
                  "{moodLogs[0]?.journal || 'No journal entry saved yet.'}"
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
            PAGE 2: ASSESSMENT
            ======================================================== */}
        {currentPage === 'assessment' && (
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

              {/* 5 Selectable Radio Cards */}
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

          </div>
        )}

        {/* ========================================================
            PAGE 3: DAILY MOOD TRACKER
            ======================================================== */}
        {currentPage === 'mood' && (
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
            PAGE 4: WELLNESS GUIDANCE
            ======================================================== */}
        {currentPage === 'recommendations' && (
          <div className="space-y-6">
            
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                Personalized Wellness Guidance
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Practical suggestions based on your stress scores to help you maintain balance.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
              <h2 className="text-[16px] font-semibold text-[#1E293B]">What this means</h2>
              <p className="text-[14px] text-[#64748B] mt-1 leading-relaxed">
                Your responses reflect your current academic pace. Consider applying the suggestions below to structure study blocks and recovery habits.
              </p>
            </div>

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
            PAGE 5: HISTORY
            ======================================================== */}
        {currentPage === 'history' && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B]">
                  Assessment History
                </h1>
                <p className="text-[14px] text-[#64748B] mt-0.5">
                  Review previous assessment results and progress over time.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] text-[13px] font-medium px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print History
              </button>
            </div>

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
                    {assessments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#64748B]">
                          No assessments completed yet. Take your first 30-item evaluation.
                        </td>
                      </tr>
                    ) : (
                      assessments.map((rec) => {
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
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 6: FACULTY ADMIN CONSOLE (ACCESSIBLE VIA FOOTER)
            ======================================================== */}
        {currentPage === 'admin' && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[12px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Faculty Administration Console
                </span>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1E293B] mt-1">
                  Institutional Student Wellness Directory
                </h1>
                <p className="text-[14px] text-[#64748B] mt-0.5">
                  Review all enrolled students, monitor assessments, and access counselor notes.
                </p>
              </div>

              <button
                onClick={() => {
                  const student = allStudents.find(u => u.role === 'student') || allStudents[0];
                  AuthStorage.setCurrentUser(student);
                  setCurrentUser(student);
                  setCurrentPage('dashboard');
                  showNotification('Returned to student dashboard.');
                }}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] text-[13px] font-medium px-3.5 py-2 rounded-[8px] transition-colors"
              >
                Return to Student View
              </button>
            </div>

            {/* Admin Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">Total Registered Students</span>
                <div className="text-[28px] font-bold text-[#1E293B] mt-1">{filteredStudents.length}</div>
                <p className="text-[12px] text-[#64748B] mt-0.5">Campus records saved in storage</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">Average Wellness Score</span>
                <div className="text-[28px] font-bold text-[#14B8A6] mt-1">70 / 100</div>
                <p className="text-[12px] text-[#64748B] mt-0.5">Overall cohort baseline</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <span className="text-[13px] font-medium text-[#64748B]">Counselor Intervention Need</span>
                <div className="text-[28px] font-bold text-[#2563EB] mt-1">Normal</div>
                <p className="text-[12px] text-[#64748B] mt-0.5">No critical self-harm flags active</p>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by student name or course..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="border border-[#E2E8F0] rounded-[8px] pl-9 pr-3 py-1.5 text-[13px] w-64 focus:outline-[#2563EB]"
                  />
                </div>
                <span className="text-[13px] text-[#64748B]">{filteredStudents.length} registered students</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] text-[13px]">
                      <th className="py-2.5 px-3 font-medium">Name</th>
                      <th className="py-2.5 px-3 font-medium">Email</th>
                      <th className="py-2.5 px-3 font-medium">Course / Dept</th>
                      <th className="py-2.5 px-3 font-medium">Year</th>
                      <th className="py-2.5 px-3 font-medium">Registered Date</th>
                      <th className="py-2.5 px-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-3 font-medium text-[#1E293B]">{student.name}</td>
                        <td className="py-3 px-3 text-[#64748B]">{student.email}</td>
                        <td className="py-3 px-3">{student.course}</td>
                        <td className="py-3 px-3 text-[#64748B]">{student.year}</td>
                        <td className="py-3 px-3 text-[#64748B]">{student.createdAt}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setInspectedStudent(student)}
                            className="text-[13px] font-medium text-[#2563EB] hover:underline"
                          >
                            Inspect Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inspected Student Modal */}
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
                      <span className="text-[#64748B]">College</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.college}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Course</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.course}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Year / Semester</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.year}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Age / Gender</span>
                      <span className="font-medium text-[#1E293B]">{inspectedStudent.age} yrs &bull; {inspectedStudent.gender}</span>
                    </div>
                    {inspectedStudent.phone && (
                      <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                        <span className="text-[#64748B]">Contact Phone</span>
                        <span className="font-medium text-[#1E293B]">{inspectedStudent.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Assessments Completed</span>
                      <span className="font-medium text-[#2563EB]">
                        {AuthStorage.getUserAssessments(inspectedStudent.id).length} assessments saved
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Daily Mood Logs</span>
                      <span className="font-medium text-[#14B8A6]">
                        {AuthStorage.getUserMoods(inspectedStudent.id).length} recorded
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between items-center">
                    <button
                      onClick={() => {
                        if (inspectedStudent.id === 'user_aarav') {
                          showNotification('Default benchmark student record is protected.');
                          return;
                        }
                        const allUsers = AuthStorage.getAllUsers().filter(u => u.id !== inspectedStudent.id);
                        localStorage.setItem('mindpulse_users_db', JSON.stringify(allUsers));
                        setInspectedStudent(null);
                        refreshStudents();
                        showNotification(`Removed record for ${inspectedStudent.name}.`);
                      }}
                      className="text-[#EF4444] hover:text-red-700 text-[12px] font-medium"
                    >
                      Delete Student Record
                    </button>
                    <button
                      onClick={() => setInspectedStudent(null)}
                      className="bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-[8px]"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Clean, Simple Footer with Faculty Admin Option */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-12 py-6 text-[13px] text-[#64748B]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-semibold text-[#1E293B]">MindPulse</span>
            <span>&bull; Student Mental Wellness Monitoring System</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5 text-[#64748B]">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span>
              Tele-MANAS: <strong className="text-[#1E293B]">14416</strong> (24x7)
            </span>

            {/* Storage / Supabase Status Button */}
            <button
              onClick={() => setShowStorageModal(true)}
              className="text-[#64748B] hover:text-[#1E293B] flex items-center gap-1.5 bg-[#F1F5F9] px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors"
              title="View Authentication & Storage Status"
            >
              <Database className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{isSupabaseConfigured ? 'Supabase Sync Active' : 'User Data Saved Locally'}</span>
            </button>
            
            {/* Faculty Admin Option in Footer */}
            <button
              onClick={() => {
                const users = AuthStorage.getAllUsers();
                const adminUser = users.find(u => u.role === 'admin') || {
                  id: 'user_admin',
                  name: 'Faculty Counselor',
                  email: 'admin@mentalhealth.local',
                  college: 'Apex Institute of Technology',
                  course: 'Student Welfare Department',
                  year: 'Faculty Staff',
                  age: 38,
                  gender: 'Staff',
                  role: 'admin',
                  createdAt: '2026-01-10'
                };
                AuthStorage.setCurrentUser(adminUser as any);
                setCurrentUser(adminUser as any);
                setCurrentPage('admin');
                refreshStudents();
                showNotification('Switched to Faculty Admin Portal.');
              }}
              className="bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-[#2563EB] font-medium px-3.5 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-colors shadow-xs"
              title="Access Institutional Student Wellness Directory & Counselor Console"
            >
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Faculty Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================
          DATA PERSISTENCE & SUPABASE STATUS MODAL
          ======================================================== */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 bg-[#1E293B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-[17px] font-semibold text-[#1E293B]">Authentication & Storage</h3>
              </div>
              <button onClick={() => setShowStorageModal(false)} className="text-[#64748B] hover:text-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-[#64748B]">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-[#1E293B]">Storage Mode:</span>
                  <span className="font-medium text-[#14B8A6]">
                    {isSupabaseConfigured ? 'Supabase Cloud + Local Cache' : 'Browser Persistent Storage (Active)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-[#1E293B]">Active User:</span>
                  <span>{currentUser.name} ({currentUser.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-[#1E293B]">Total Registered Users:</span>
                  <span>{allStudents.length + 1} profiles</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-[#1E293B]">Assessments Saved:</span>
                  <span>{assessments.length} records</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-[#1E293B]">Mood Logs Saved:</span>
                  <span>{moodLogs.length} entries</span>
                </div>
              </div>

              <p className="text-[12px] leading-relaxed">
                All registered accounts, questionnaire assessments, stress classifications, and daily mood journals are permanently saved in persistent storage. You can register new students, switch to the Faculty Admin portal, or sign back in at any time.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowStorageModal(false)}
                className="bg-[#2563EB] text-white text-[13px] font-medium px-4 py-2 rounded-[8px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          AUTH MODAL (Sign In & New User Registration)
          ======================================================== */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-[#1E293B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 sm:p-7 shadow-xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start pb-2 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-[18px] font-semibold text-[#1E293B]">
                  {authModal === 'register' ? 'New Student Registration' : 'Student & Faculty Login'}
                </h3>
                <p className="text-[13px] text-[#64748B] mt-0.5">
                  {authModal === 'register' 
                    ? 'Register your account to securely track your mental wellness.' 
                    : 'Sign in to access your confidential assessment history and trends.'}
                </p>
              </div>
              <button onClick={() => setAuthModal(null)} className="text-[#64748B] hover:text-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[13px] p-2.5 rounded-[8px]">
                {authError}
              </div>
            )}

            {authModal === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-[14px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">College Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="priya@college.edu"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Age (Years) *</label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={85}
                      value={registerForm.age}
                      onChange={(e) => setRegisterForm({ ...registerForm, age: Number(e.target.value) })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Gender</label>
                    <select
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB] bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">College / Institute</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Institute of Technology"
                      value={registerForm.college}
                      onChange={(e) => setRegisterForm({ ...registerForm, college: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Course / Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science"
                      value={registerForm.course}
                      onChange={(e) => setRegisterForm({ ...registerForm, course: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Year / Semester</label>
                    <input
                      type="text"
                      placeholder="e.g. 4th Year / Sem 8"
                      value={registerForm.year}
                      onChange={(e) => setRegisterForm({ ...registerForm, year: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Password (Min 8 chars) *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[14px] py-2.5 rounded-[8px] transition-colors mt-3 shadow-xs"
                >
                  Create Student Account & Save Data
                </button>

                <div className="text-center text-[13px] text-[#64748B] pt-2">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthError(null); setAuthModal('login'); }}
                    className="text-[#2563EB] font-medium hover:underline"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-[14px]">
                <div>
                  <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@mentalhealth.local"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#1E293B] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2 text-[14px] focus:outline-[#2563EB]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[14px] py-2.5 rounded-[8px] transition-colors mt-2"
                >
                  Sign In
                </button>

                {/* Quick One-Click Demo Logins */}
                <div className="pt-2 border-t border-[#E2E8F0] text-[12px]">
                  <span className="text-[#64748B] block mb-1.5 font-medium">Quick Demo Accounts:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickSwitchUser('student@mentalhealth.local')}
                      className="flex-1 py-1.5 px-2 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] rounded-[6px] text-[#1E293B]"
                    >
                      Student (Aarav)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSwitchUser('admin@mentalhealth.local')}
                      className="flex-1 py-1.5 px-2 bg-[#EFF6FF] hover:bg-blue-100 border border-[#BFDBFE] rounded-[6px] text-[#2563EB] font-medium"
                    >
                      Faculty Admin
                    </button>
                  </div>
                </div>

                <div className="text-center text-[13px] text-[#64748B] pt-2">
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthError(null); setAuthModal('register'); }}
                    className="text-[#2563EB] font-medium hover:underline"
                  >
                    Register new student
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
