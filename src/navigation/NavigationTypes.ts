import { ExamResult } from '@/types/exams.types';
import { UserResult } from '@/types/report.types';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';

export interface AuthStackParamList extends Record<string, object | undefined> {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export interface BottomTabParamList extends Record<string, object | undefined> {
  Home: undefined;
  Report: undefined;
  Account: undefined;
};

export interface AppStackParamList extends Record<string, object | undefined> {
  BottomTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  BookDetail: { book: any };
  Profile: undefined;
  Exam: undefined;
  ExamResult: undefined;
  EditProfile: undefined;
  AssesmentDetail: { assessment?: UserResult; examResult?: ExamResult };
  ExamHistory: { userResult: UserResult[] };
};

export type RootStackParamList = AuthStackParamList | AppStackParamList;

export type BookDetailScreenProps = {
  route: { params: { book: any } };
};

export type ExamScreenProps = {
  route: { params: { bookId?: string } };
};

export type ExamResultScreenProps = {
  route: { params: { score: number; totalQuestions: number; bookId?: string } };
};

export type AssesmentDetailScreenProps = {
  route: { params: { assessment: UserResult; examResult?: ExamResult } };
};

export type AssesmentDetailRouteProp = RouteProp<AppStackParamList, 'AssesmentDetail'>;

export type ExamHistoryRouteProp = RouteProp<AppStackParamList, 'ExamHistory'>;