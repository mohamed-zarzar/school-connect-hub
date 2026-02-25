import { APP_CONFIG } from '@/config';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { Lesson, Question, Exam, ExamAttempt, ExamConfig } from '@/types/exam';

const delay = () => new Promise(r => setTimeout(r, APP_CONFIG.MOCK_DELAY));
let idCounter = 500;
const genId = (prefix: string) => `${prefix}-${++idCounter}`;

// In-memory stores
let lessons: Lesson[] = [
  { id: 'les-1', name: 'Addition & Subtraction', description: 'Basic arithmetic operations', subjectId: 'sub-1', levelId: 'lvl-1', order: 1, createdAt: '2024-01-01' },
  { id: 'les-2', name: 'Multiplication', description: 'Multiplication tables and methods', subjectId: 'sub-1', levelId: 'lvl-1', order: 2, createdAt: '2024-01-01' },
  { id: 'les-3', name: 'Grammar Basics', description: 'Parts of speech and sentence structure', subjectId: 'sub-2', levelId: 'lvl-1', order: 1, createdAt: '2024-01-01' },
  { id: 'les-4', name: 'Algebra Intro', description: 'Introduction to algebraic expressions', subjectId: 'sub-1', levelId: 'lvl-2', order: 1, createdAt: '2024-01-01' },
];

let questions: Question[] = [
  { id: 'q-1', lessonId: 'les-1', text: '5 + 3 = 8', type: 'true_false', difficulty: 'easy', options: [{ id: 'o-1', text: 'True' }, { id: 'o-2', text: 'False' }], correctAnswerId: 'o-1', createdAt: '2024-01-01' },
  { id: 'q-2', lessonId: 'les-1', text: 'What is 12 - 7?', type: 'multiple_choice', difficulty: 'easy', options: [{ id: 'o-3', text: '4' }, { id: 'o-4', text: '5' }, { id: 'o-5', text: '6' }, { id: 'o-6', text: '7' }], correctAnswerId: 'o-4', createdAt: '2024-01-01' },
  { id: 'q-3', lessonId: 'les-1', text: '15 + 27 = 43', type: 'true_false', difficulty: 'medium', options: [{ id: 'o-7', text: 'True' }, { id: 'o-8', text: 'False' }], correctAnswerId: 'o-8', createdAt: '2024-01-01' },
  { id: 'q-4', lessonId: 'les-2', text: 'What is 6 × 7?', type: 'multiple_choice', difficulty: 'medium', options: [{ id: 'o-9', text: '36' }, { id: 'o-10', text: '42' }, { id: 'o-11', text: '48' }, { id: 'o-12', text: '49' }], correctAnswerId: 'o-10', createdAt: '2024-01-01' },
  { id: 'q-5', lessonId: 'les-3', text: 'A noun is a person, place, or thing.', type: 'true_false', difficulty: 'easy', options: [{ id: 'o-13', text: 'True' }, { id: 'o-14', text: 'False' }], correctAnswerId: 'o-13', createdAt: '2024-01-01' },
  { id: 'q-6', lessonId: 'les-4', text: 'Solve: 2x = 10, x = ?', type: 'multiple_choice', difficulty: 'medium', options: [{ id: 'o-15', text: '3' }, { id: 'o-16', text: '5' }, { id: 'o-17', text: '7' }, { id: 'o-18', text: '10' }], correctAnswerId: 'o-16', createdAt: '2024-01-01' },
];

let exams: Exam[] = [];
let attempts: ExamAttempt[] = [];

function searchFilter<T extends Record<string, any>>(items: T[], search?: string): T[] {
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter(item =>
    Object.values(item).some(val => typeof val === 'string' && val.toLowerCase().includes(q))
  );
}

export const lessonApi = {
  getAll: async (params: PaginationParams & { subjectId?: string; levelId?: string }): Promise<PaginatedResponse<Lesson>> => {
    await delay();
    let items = [...lessons];
    if (params.subjectId) items = items.filter(l => l.subjectId === params.subjectId);
    if (params.levelId) items = items.filter(l => l.levelId === params.levelId);
    items = searchFilter(items, params.search);
    const total = items.length;
    const totalPages = Math.ceil(total / params.limit);
    const start = (params.page - 1) * params.limit;
    return { data: items.slice(start, start + params.limit), total, page: params.page, limit: params.limit, totalPages, message: 'Success', success: true, statusCode: 200 };
  },
  getAllFlat: async (): Promise<ApiResponse<Lesson[]>> => {
    await delay();
    return { data: [...lessons], message: 'Success', success: true, statusCode: 200 };
  },
  getById: async (id: string): Promise<ApiResponse<Lesson | null>> => {
    await delay();
    const item = lessons.find(l => l.id === id) || null;
    return { data: item, message: item ? 'Success' : 'Not found', success: !!item, statusCode: item ? 200 : 404 };
  },
  create: async (data: Omit<Lesson, 'id' | 'createdAt'>): Promise<ApiResponse<Lesson>> => {
    await delay();
    const newItem: Lesson = { ...data, id: genId('les'), createdAt: new Date().toISOString() };
    lessons = [...lessons, newItem];
    return { data: newItem, message: 'Lesson created', success: true, statusCode: 201 };
  },
  update: async (id: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> => {
    await delay();
    const idx = lessons.findIndex(l => l.id === id);
    if (idx === -1) return { data: null as any, message: 'Not found', success: false, statusCode: 404 };
    lessons[idx] = { ...lessons[idx], ...data };
    lessons = [...lessons];
    return { data: lessons[idx], message: 'Updated', success: true, statusCode: 200 };
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay();
    lessons = lessons.filter(l => l.id !== id);
    questions = questions.filter(q => q.lessonId !== id);
    return { data: null, message: 'Deleted', success: true, statusCode: 200 };
  },
};

export const questionApi = {
  getAll: async (params: PaginationParams & { lessonId?: string; difficulty?: string }): Promise<PaginatedResponse<Question>> => {
    await delay();
    let items = [...questions];
    if (params.lessonId) items = items.filter(q => q.lessonId === params.lessonId);
    if (params.difficulty) items = items.filter(q => q.difficulty === params.difficulty);
    items = searchFilter(items, params.search);
    const total = items.length;
    const totalPages = Math.ceil(total / params.limit);
    const start = (params.page - 1) * params.limit;
    return { data: items.slice(start, start + params.limit), total, page: params.page, limit: params.limit, totalPages, message: 'Success', success: true, statusCode: 200 };
  },
  getByLessonIds: async (lessonIds: string[]): Promise<ApiResponse<Question[]>> => {
    await delay();
    const items = questions.filter(q => lessonIds.includes(q.lessonId));
    return { data: items, message: 'Success', success: true, statusCode: 200 };
  },
  create: async (data: Omit<Question, 'id' | 'createdAt'>): Promise<ApiResponse<Question>> => {
    await delay();
    const newItem: Question = { ...data, id: genId('q'), createdAt: new Date().toISOString() };
    questions = [...questions, newItem];
    return { data: newItem, message: 'Question created', success: true, statusCode: 201 };
  },
  update: async (id: string, data: Partial<Question>): Promise<ApiResponse<Question>> => {
    await delay();
    const idx = questions.findIndex(q => q.id === id);
    if (idx === -1) return { data: null as any, message: 'Not found', success: false, statusCode: 404 };
    questions[idx] = { ...questions[idx], ...data };
    questions = [...questions];
    return { data: questions[idx], message: 'Updated', success: true, statusCode: 200 };
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay();
    questions = questions.filter(q => q.id !== id);
    return { data: null, message: 'Deleted', success: true, statusCode: 200 };
  },
};

export const examApi = {
  getAll: async (params: PaginationParams): Promise<PaginatedResponse<Exam>> => {
    await delay();
    let items = searchFilter([...exams], params.search);
    const total = items.length;
    const totalPages = Math.ceil(total / params.limit);
    const start = (params.page - 1) * params.limit;
    return { data: items.slice(start, start + params.limit), total, page: params.page, limit: params.limit, totalPages, message: 'Success', success: true, statusCode: 200 };
  },
  getById: async (id: string): Promise<ApiResponse<Exam | null>> => {
    await delay();
    const item = exams.find(e => e.id === id) || null;
    return { data: item, message: item ? 'Success' : 'Not found', success: !!item, statusCode: item ? 200 : 404 };
  },
  generate: async (config: ExamConfig): Promise<ApiResponse<Exam>> => {
    await delay();
    let selectedQuestionIds: string[] = [];

    if (config.mode === 'manual' && config.questionIds) {
      selectedQuestionIds = config.questionIds;
    } else if (config.mode === 'auto') {
      const pool = questions.filter(q => config.lessonIds.includes(q.lessonId));
      const easy = pool.filter(q => q.difficulty === 'easy');
      const medium = pool.filter(q => q.difficulty === 'medium');
      const hard = pool.filter(q => q.difficulty === 'hard');

      const pick = (arr: Question[], count: number) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(q => q.id);
      };

      selectedQuestionIds = [
        ...pick(easy, config.easyCount || 0),
        ...pick(medium, config.mediumCount || 0),
        ...pick(hard, config.hardCount || 0),
      ];
    }

    const exam: Exam = {
      id: genId('exam'),
      name: config.name,
      lessonIds: config.lessonIds,
      questionIds: selectedQuestionIds,
      createdAt: new Date().toISOString(),
      status: 'published',
    };
    exams = [...exams, exam];
    return { data: exam, message: 'Exam generated', success: true, statusCode: 201 };
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay();
    exams = exams.filter(e => e.id !== id);
    return { data: null, message: 'Deleted', success: true, statusCode: 200 };
  },
};

export const attemptApi = {
  submit: async (examId: string, studentId: string, answers: Record<string, string>): Promise<ApiResponse<ExamAttempt>> => {
    await delay();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { data: null as any, message: 'Exam not found', success: false, statusCode: 404 };

    const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
    let correct = 0;
    examQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswerId) correct++;
    });

    const attempt: ExamAttempt = {
      id: genId('att'),
      examId,
      studentId,
      answers,
      score: correct,
      totalQuestions: examQuestions.length,
      completedAt: new Date().toISOString(),
    };
    attempts = [...attempts, attempt];
    return { data: attempt, message: 'Exam submitted', success: true, statusCode: 201 };
  },
  getByExam: async (examId: string): Promise<ApiResponse<ExamAttempt[]>> => {
    await delay();
    return { data: attempts.filter(a => a.examId === examId), message: 'Success', success: true, statusCode: 200 };
  },
};
