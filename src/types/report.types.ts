export interface GradeMilestoneItemExam {
  exam_index: number;
  id: number;
  documentId: string;
  title: string;
  exam_stats: any;
  user_stats: any;
  status: 'closed' | 'opened';
}

export interface GradeMilestoneItem {
  id: number;
  documentId: string;
  title: string;
  desc: string | null;
  exams: GradeMilestoneItemExam[];
}

export interface GradeMilestoneApiResponse {
  data: {
    grades: GradeMilestoneItem[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  };
}

export interface UserResult {
  attempt: number;
  createdAt: string;
  documentId: string;
  id: number;
  publishedAt: string;
  score: number;
  totalTime: string;
  updatedAt: string;
}

export interface GradeMilestoneItemExamById {
  documentId: string;
  exam_index: number;
  exam_stats: {
    pace: {
      average: number;
      median: number;
    };
    resilience: {
      average: number;
      median: number;
    };
    score: {
      average: number;
      median: number;
    };
    streaks: {
      average: number;
      median: number;
    };
  };
  grade: {
    desc: string | null;
    documentId: string;
    id: number;
    title: string;
  };
  id: number;
  overall_stats: {
    pace: {
      average: number;
      median: number;
    };
    score: {
      average: number;
      median: number;
    };
    streaks: {
      average: number;
      median: number;
    };
    resilience: {
      average: number;
      median: number;
    };
    updatedAt: string;
  };
  school_stats: {
    documentId: string;
    id: number;
    name: string;
    totalUsers: number;
  }[];
  status: string;
  title: string;
  user_results: UserResult[];
  user_stats: {
    attempts: number;
    pace: {
      average: number;
      median: number;
    };
    resilience: {
      average: number;
      median: number;
    };
    score: {
      average: number;
      median: number;
    };
    streaks: {
      average: number;
      median: number;
    };
  };
}

export interface GradeMilestoneExamsByIdResponse {
  data: GradeMilestoneItemExamById;
}

export interface ReportState {
  examGradeMilestonesAssesment: GradeMilestonesExamAssesment | null;
  selectedExamGradeMilestoneAssesment: GradeMilestoneItemExamById | null;
  examGradeMilestoneExamsById: GradeMilestoneItemExamById | null;
  examGradeMilestones: GradeMilestoneItem[],
  selectedExamGradeMilestone: GradeMilestoneItemExam | null,
  isLoadingExamGradeMilestonesAssesment: boolean;
  isLoadingExamGradeMilestonesById: boolean;
  isLoadingExamGradeMilestones: boolean;
  error: string | null;
}

export interface QuestionAnswerCollectionData {
  question: string;
  is_correct: boolean;
  question_id: string;
  user_speed: number;
  user_answer: string;
  avgSpeed: number;
  medianSpeed: number;
  correct_answer: number
}

export interface GradeMilestonesExamAssesment {
  id: number;
  documentId: string;
  pace: number;
  streaks: number;
  resilience: number;
  score: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  question_collections: QuestionAnswerCollectionData[];
  total_time: string;
}

export interface GradeMilestonesExamAssesmentResponse {
  data: GradeMilestonesExamAssesment
}