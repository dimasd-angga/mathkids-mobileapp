export const STRAPI_HOST_URL = 'https://dokidou.ursawhite.com';
// export const STRAPI_HOST_URL = 'http://103.174.114.181:1337';
export const STRAPI_BASE_URL = `${STRAPI_HOST_URL}/api`;
export const BACKOFFICE_BASE_URL = 'https://dokidou-backoffice.ursawhite.com/api';
// export const BACKOFFICE_BASE_URL = 'http://localhost:3000/api';
export const BACKOFFICE_SECRET = 'super_secret';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/local',
    REGISTER: '/register',
    ME: '/users/me',
  },
  PROFILE: {
    UPDATE: '/users',
    UPDATE_AVATAR: '/upload',
    HISTORY: '/history',
  },
  GRADE: {
    GRADES: '/grades',
  },
  SCHOOL: {
    SCHOOLS: '/schools',
  },
  EXAM: {
    USER: '/user-exam',
    QUESTIONS: '/exam',
    RESULT: '/exam-result',
  },
  DAILY: {
    RESULT: '/daily-result',
  },
  REPORT: {
    GRADE_MILESTONE: '/exam-list',
    GRADE_MILESTONE_ASSESMENT: '/exam-result',
  },
};
