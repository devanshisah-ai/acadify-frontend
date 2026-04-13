import api from './axios';

export const dashboardAPI = {

  // ==================
  // ADMIN (REAL BACKEND)
  // ==================
  admin: {
    getOverview: async () => {
      try {
        const res = await api.get('/admin/stream-performance');
        return res.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch overview' };
      }
    },

    getUsers: async () => {
      try {
        const res = await api.get('/admin/high-risk');
        return res.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch users' };
      }
    },

    getSystemAnalytics: async () => {
      try {
        const res = await api.get('/admin/top-performers');
        return res.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch analytics' };
      }
    }
  },

  // ==================
  // STUDENT (TEMP MOCK)
  // ==================
  student: {
    getOverview: async () => {
      return {
        avgScore: "75%",
        attendance: "82%",
        rank: 12,
        totalStudents: 120,
        recentActivity: []
      };
    },

    getMarks: async () => {
      return {
        subjects: []
      };
    },

    getAttendance: async () => {
      return {
        attendance: "80%"
      };
    },

    getPerformanceAnalytics: async () => {
      return {
        trend: "Improving",
        riskLevel: "Low"
      };
    }
  },

  // ==================
  // TEACHER (TEMP MOCK)
  // ==================
  teacher: {
    getOverview: async () => {
      return {
        totalClasses: 3,
        totalStudents: 120,
        pendingGrades: 5
      };
    },

    getClasses: async () => {
      return [];
    },

    getClassPerformance: async () => {
      return [];
    },

    submitGrades: async () => {
      return { success: true };
    }
  }
};


// ==================
// COMMON (KEEP SIMPLE)
// ==================

export const commonAPI = {
  getProfile: async () => {
    return {
      name: "User",
      role: "ADMIN"
    };
  },

  updateProfile: async () => {
    return { success: true };
  }
};