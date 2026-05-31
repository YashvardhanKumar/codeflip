// ============================================================================
// ENUMS
// ============================================================================

export enum Language {
  CPP = 'CPP',
  JAVA = 'JAVA',
  PYTHON = 'PYTHON',
  JAVASCRIPT = 'JAVASCRIPT',
  TYPESCRIPT = 'TYPESCRIPT'
}

// Judge0 Language IDs
export const LanguageCodes: Record<Language, number> = {
  [Language.CPP]: 54,        // C++ (GCC 9.2.0)
  [Language.JAVA]: 62,       // Java (OpenJDK 13.0.1)
  [Language.PYTHON]: 71,     // Python (3.8.1)
  [Language.JAVASCRIPT]: 63, // JavaScript (Node.js 12.14.0)
  [Language.TYPESCRIPT]: 74  // TypeScript (3.7.4)
};

// Reverse mapping: Judge0 ID to Language enum
export const Judge0ToLanguage: Record<number, Language> = {
  54: Language.CPP,
  62: Language.JAVA,
  71: Language.PYTHON,
  63: Language.JAVASCRIPT,
  74: Language.TYPESCRIPT
};

// Language display names
export const LanguageDisplayNames: Record<Language, string> = {
  [Language.CPP]: 'C++',
  [Language.JAVA]: 'Java',
  [Language.PYTHON]: 'Python',
  [Language.JAVASCRIPT]: 'JavaScript',
  [Language.TYPESCRIPT]: 'TypeScript'
};

export interface RunCodePayload {
  problem_id: number;
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;

  number_of_runs?: number;

  cpu_time_limit?: number;
  cpu_extra_time?: number;
  wall_time_limit?: number;
  memory_limit?: number;
  stack_limit?: number;
  max_processes_and_or_threads?: number;
  max_file_size?: number;

  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
  enable_network?: boolean;
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum Status {
  QUEUE = 'In Queue',
  PROCESS = 'Processing',
  SUCCESS = 'Accepted',
  WRONG_ANSWER = 'Wrong Answer',
  TIME_LIMIT_EXCEEDED = 'Time Limit Exceeded',
  COMPILE_ERROR = 'Compilation Error',
  RUNTIME_ERROR_SIGSEGV = 'Runtime Error (SIGSEGV)',
  RUNTIME_ERROR_SIGXFSZ = 'Runtime Error (SIGXFSZ)',
  RUNTIME_ERROR_SIGFPE = 'Runtime Error (SIGFPE)',
  RUNTIME_ERROR_SIGABRT = 'Runtime Error (SIGABRT)',
  RUNTIME_ERROR_NZEC = 'Runtime Error (NZEC)',
  RUNTIME_ERROR_OTHER = 'Runtime Error (Other)',
  INTERNAL_ERROR = 'Internal Error',
  EXEC_FORMAT_ERROR = 'Exec Format Error',
  INVALID_TESTCASE = 'Invalid Testcase'
}

export enum DataType {
  STRING = 'string',
  INTEGER = 'integer'
} 

// ============================================================================
// CORE MODEL INTERFACES
// ============================================================================

export interface User {
  id: number;
  is_staff: boolean;
  username: string;
  email?: string;
  name?: string | null;
  default_lang?: Language;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
  date_joined: string;
}

export interface UserRegistration {
  username: string;
  email?: string;
  name?: string | null;
  password: string;
  password2: string;
  default_lang?: Language;
}

export interface Tag {
  id: number;
  tags: string;
}

export interface Codeblock {
  id: number;
  problem: number;
  imports: string;
  block: string;
  runner_code: string;
  language: Language;
  language_display: string;
  full_code: string;
}

export interface Testcase {
  id: number;
  problem: number;
  input: string;
  output: string;
  output_type: DataType;
  display_testcase: boolean;
  created_at: string;
}

export interface TestcaseList {
  id: number;
  input: string;
  output: string;
  output_type: DataType;
  display_testcase: boolean;
  created_at: string;
}

export interface Problem {
  id: number;
  name: string;
  problem_description?: string;
  difficulty?: Difficulty;
  tags: Tag[];
  codeblocks: Codeblock[];
  testcases: TestcaseList[];
  created_at: string;
  success_rate: string;
}

export interface ProblemList {
  id: number;
  name: string;
  problem_description?: string;
  difficulty?: Difficulty;
  tags: Tag[];
  created_at: string;
  total_solutions: string;
  total_testcases: string;
}

export interface Solution {
  id: number;
  user: User;
  problem: number;
  testcase_results: any
  code: string;
  language: Language;
  language_display: string;
  status: Status | string | null;
  status_display: string;
  created_at: string;
}

export interface SolutionList {
  id: number;
  user: User;
  problem_id: number;
  language: Language;
  language_display: string;
  status: Status | string | null;
  status_display: string;
  created_at: string;
}

export interface Discuss {
  id: number;
  title: string;
  body: string;
  author: User;
  problem: number;
  tags: Tag[];
  views: number;
  is_editorial: boolean;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  comments?: Comment[];
  created_at: string;
}

export interface Comment {
  id: number;
  author: User;
  discuss: number;
  body: string;
  parent: number | null;
  replies: Comment[];
  upvote_count: number;
  downvote_count: number;
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokenRequest {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}

export interface SolutionSubmitRequest {
  problem_id: number;
  code: string;
  language?: Language;
}

export interface ProblemCreateRequest {
  name: string;
  problem_description?: string;
  difficulty?: Difficulty;
  tag_ids?: number[];
}

export interface ProblemUpdateRequest {
  name?: string;
  problem_description?: string;
  difficulty?: Difficulty;
  tag_ids?: number[];
}

export interface ProfileProblemSummary {
  id: number;
  name: string;
  difficulty: Difficulty;
  last_submitted_at: string;
}

export interface ProfileSubmission {
  id: number;
  problem_id: number;
  problem_name: string;
  difficulty: Difficulty;
  language: Language;
  language_display: string;
  status: Status | string | null;
  status_display: string;
  created_at: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface ProfileStats {
  total_submissions: number;
  successful_submissions: number;
  unique_problems_attempted: number;
  unique_problems_solved: number;
  success_rate: number;
  current_streak: number;
  active_days: number;
  difficulty_breakdown: Record<Difficulty, {
    solved: number;
    attempted: number;
  }>;
  status_breakdown: Record<string, number>;
}

export interface UserProfile {
  user: User;
  stats: ProfileStats;
  heatmap: HeatmapDay[];
  recent_submissions: ProfileSubmission[];
  solved_problems: ProfileProblemSummary[];
  attempted_problems: ProfileProblemSummary[];
  available_years: number[];
  selected_year: number;
}
