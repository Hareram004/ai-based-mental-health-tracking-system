import { supabase, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  college: string;
  course: string;
  year: string;
  age: number;
  gender: string;
  phone?: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface AssessmentRecord {
  id: number;
  date: string;
  totalScore: number;
  percentage: number;
  stressLevel: 'Low Stress' | 'Moderate Stress' | 'High Stress';
  categoryPercentages: Record<string, number>;
}

export interface MoodEntry {
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

// Default Seed Users
const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_aarav',
    name: 'Aarav Sharma',
    email: 'student@mentalhealth.local',
    password: 'Student@12345',
    college: 'Apex Institute of Technology',
    course: 'B.Tech Computer Science & Engineering',
    year: '4th Year',
    age: 21,
    gender: 'Male',
    phone: '+91 9123456789',
    role: 'student',
    createdAt: '2026-01-15'
  },
  {
    id: 'user_admin',
    name: 'Faculty Counselor',
    email: 'admin@mentalhealth.local',
    password: 'Admin@12345',
    college: 'Apex Institute of Technology',
    course: 'Student Welfare Department',
    year: 'Faculty Staff',
    age: 38,
    gender: 'Prefer not to say',
    phone: '+91 9876543210',
    role: 'admin',
    createdAt: '2026-01-10'
  }
];

// Initial assessments for Aarav
const DEFAULT_ASSESSMENTS: AssessmentRecord[] = [
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
];

// Initial mood stream for Aarav
const DEFAULT_MOODS: MoodEntry[] = [
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
    journal: 'Long lab sessions today. Need to organize revision notes for next week.',
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
];

export class AuthStorage {
  private static USERS_KEY = 'mindpulse_users_db';
  private static CURRENT_USER_KEY = 'mindpulse_active_user';
  private static ASSESSMENTS_PREFIX = 'mindpulse_assessments_';
  private static MOODS_PREFIX = 'mindpulse_moods_';

  // Get all registered users
  static getAllUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      if (!data) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS;
    }
  }

  // Register a new user
  static async registerUser(newUser: Omit<UserProfile, 'id' | 'createdAt'>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const users = this.getAllUsers();
      
      // Duplicate email validation
      const existing = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (existing) {
        return { success: false, error: 'An account with this email address is already registered.' };
      }

      const id = 'user_' + Math.random().toString(36).substring(2, 9);
      const userRecord: UserProfile = {
        ...newUser,
        id,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // If Supabase is connected, trigger remote auth registration
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signUp({
            email: newUser.email,
            password: newUser.password || 'Student@12345',
            options: {
              data: {
                name: newUser.name,
                college: newUser.college,
                course: newUser.course
              }
            }
          });
        } catch (supaErr) {
          console.warn('Supabase remote sign up notice:', supaErr);
        }
      }

      users.push(userRecord);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      this.setCurrentUser(userRecord);

      return { success: true, user: userRecord };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  // Login authentication
  static async login(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return { success: false, error: 'No account found with this email. Please register first.' };
      }

      if (password && user.password && user.password !== password) {
        return { success: false, error: 'Incorrect password entered.' };
      }

      // If Supabase is connected, authenticate with Supabase
      if (isSupabaseConfigured && supabase && password) {
        try {
          await supabase.auth.signInWithPassword({
            email,
            password
          });
        } catch (supaErr) {
          console.warn('Supabase remote sign in notice:', supaErr);
        }
      }

      this.setCurrentUser(user);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }

  // Get active user session
  static getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!data) {
        const defaultStudent = DEFAULT_USERS[0];
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(defaultStudent));
        return defaultStudent;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS[0];
    }
  }

  // Set active user session
  static setCurrentUser(user: UserProfile) {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  // Logout session
  static async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out notice:', err);
      }
    }
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // User Assessments Persistence
  static getUserAssessments(userId: string): AssessmentRecord[] {
    try {
      const key = this.ASSESSMENTS_PREFIX + userId;
      const data = localStorage.getItem(key);
      if (!data) {
        // Provide initial dataset for Aarav, empty for new users
        if (userId === 'user_aarav') {
          localStorage.setItem(key, JSON.stringify(DEFAULT_ASSESSMENTS));
          return DEFAULT_ASSESSMENTS;
        }
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveUserAssessment(userId: string, assessment: AssessmentRecord): void {
    const list = this.getUserAssessments(userId);
    const updated = [assessment, ...list];
    localStorage.setItem(this.ASSESSMENTS_PREFIX + userId, JSON.stringify(updated));
  }

  // User Moods Persistence
  static getUserMoods(userId: string): MoodEntry[] {
    try {
      const key = this.MOODS_PREFIX + userId;
      const data = localStorage.getItem(key);
      if (!data) {
        if (userId === 'user_aarav') {
          localStorage.setItem(key, JSON.stringify(DEFAULT_MOODS));
          return DEFAULT_MOODS;
        }
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveUserMood(userId: string, mood: MoodEntry): void {
    const list = this.getUserMoods(userId);
    const updated = [mood, ...list];
    localStorage.setItem(this.MOODS_PREFIX + userId, JSON.stringify(updated));
  }
}
