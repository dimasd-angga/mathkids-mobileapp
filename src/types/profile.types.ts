export interface ProfileUpdateState {
  isLoadingUpdateProfile: boolean;
  isLoadingHistories: boolean;
  errorHistories: string | null;
  errorUpdateProfile: string | null;
  histories: any[];
}

export interface HistoryItem {
  id: string;
  type: string;
  title: string;
  description: string;
  score: number;
  timestamp: string;
  timeAgo: string;
  documentId: string;
  additionalData: {
    level: number;
    streaks: number;
    resilience: number;
  };
}

export interface HistoryResponse {
  data: {
    history: HistoryItem[];
  }
}
  