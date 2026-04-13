// dashboard.api.js
// Frontend API client for all dashboard operations

const API_BASE = 'http://localhost:8080'; // Update this to match your backend URL

/**
 * Get authorization header with token from localStorage
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Handle API response and errors
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle common HTTP errors
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
};

/**
 * Dashboard API - All dashboard-related endpoints
 */
export const dashboardAPI = {
  /**
   * Admin Dashboard APIs
   */
  admin: {
    /**
     * Get admin dashboard overview
     * Returns: totalUsers, totalStudents, totalTeachers, activeSessions
     */
    getOverview: async () => {
      const response = await fetch(`${API_BASE}/admin/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get all users with optional role filter
     * @param {string|null} role - Filter by role: 'STUDENT', 'TEACHER', 'ADMIN', or null for all
     * Returns: Array of users with name, email, role, active status
     */
    getUsers: async (role = null) => {
      const url = role 
        ? `${API_BASE}/admin/users?role=${role}`
        : `${API_BASE}/admin/users`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get system analytics
     * Returns: System-wide statistics and insights
     */
    getSystemAnalytics: async () => {
      const response = await fetch(`${API_BASE}/admin/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get top performing students
     */
    getTopPerformers: async () => {
      const response = await fetch(`${API_BASE}/admin/top-performers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get lowest performing students
     */
    getLowestPerformers: async () => {
      const response = await fetch(`${API_BASE}/admin/lowest-performers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get students with backlogs
     */
    getBacklogs: async () => {
      const response = await fetch(`${API_BASE}/admin/backlogs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get high-risk students
     */
    getHighRiskStudents: async () => {
      const response = await fetch(`${API_BASE}/admin/high-risk`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get stream performance comparison
     */
    getStreamPerformance: async () => {
      const response = await fetch(`${API_BASE}/admin/stream-performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    }
  },
  
  /**
   * Student Dashboard APIs
   */
  student: {
    /**
     * Get student dashboard overview
     * Returns: avgScore, attendance, rank, totalStudents, recentActivity
     */
    getOverview: async () => {
      const response = await fetch(`${API_BASE}/student/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get student marks/grades
     * Returns: Array of subjects with name, score, grade, status
     */
    getMarks: async () => {
      const response = await fetch(`${API_BASE}/student/marks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get performance analytics (AI-powered insights)
     * Returns: trend, riskLevel
     */
    getPerformanceAnalytics: async () => {
      const response = await fetch(`${API_BASE}/student/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get performance report
     */
    getPerformanceReport: async () => {
      const response = await fetch(`${API_BASE}/student/report`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get semester-wise performance
     */
    getSemesterPerformance: async () => {
      const response = await fetch(`${API_BASE}/student/semester-performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get subject marks trend
     */
    getMarksTrend: async () => {
      const response = await fetch(`${API_BASE}/student/marks-trend`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get weak subjects
     * @param {number} threshold - Marks threshold (default 50)
     */
    getWeakSubjects: async (threshold = 50) => {
      const response = await fetch(`${API_BASE}/student/weak-subjects?threshold=${threshold}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get student's doubts
     */
    getDoubts: async () => {
      const response = await fetch(`${API_BASE}/student/doubts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Raise a new doubt
     * @param {object} doubtData - { teacher_id?, question }
     */
    raiseDoubt: async (doubtData) => {
      const response = await fetch(`${API_BASE}/student/doubt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(doubtData)
      });
      return handleResponse(response);
    },
    
    /**
     * Get activity log
     */
    getActivity: async () => {
      const response = await fetch(`${API_BASE}/student/activity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    }
  },
  
  /**
   * Teacher Dashboard APIs
   */
  teacher: {
    /**
     * Get teacher dashboard overview
     * Returns: totalClasses, totalStudents, pendingGrades
     */
    getOverview: async () => {
      const response = await fetch(`${API_BASE}/teacher/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get teacher's classes
     * Returns: Array of classes with name, subject, students, schedule
     */
    getClasses: async () => {
      const response = await fetch(`${API_BASE}/teacher/classes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get pending doubts assigned to teacher
     */
    getPendingDoubts: async () => {
      const response = await fetch(`${API_BASE}/teacher/doubts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Answer a doubt
     * @param {object} answerData - { doubt_id, answer }
     */
    answerDoubt: async (answerData) => {
      const response = await fetch(`${API_BASE}/teacher/doubt/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(answerData)
      });
      return handleResponse(response);
    },
    
    /**
     * Add marks for a student
     * @param {object} marksData - { student_id, subject_id, marks_obtained, semester }
     */
    addMarks: async (marksData) => {
      const response = await fetch(`${API_BASE}/teacher/marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(marksData)
      });
      return handleResponse(response);
    },
    
    /**
     * Update existing marks
     * @param {object} marksData - { mark_id, marks_obtained }
     */
    updateMarks: async (marksData) => {
      const response = await fetch(`${API_BASE}/teacher/marks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(marksData)
      });
      return handleResponse(response);
    },
    
    /**
     * Get class performance for a subject
     * @param {number} subjectId - Subject ID
     * @param {number|null} semester - Optional semester filter
     */
    getClassPerformance: async (subjectId, semester = null) => {
      const url = semester 
        ? `${API_BASE}/teacher/class-performance?subject_id=${subjectId}&semester=${semester}`
        : `${API_BASE}/teacher/class-performance?subject_id=${subjectId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    },
    
    /**
     * Get activity log
     */
    getActivity: async () => {
      const response = await fetch(`${API_BASE}/teacher/activity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      return handleResponse(response);
    }
  }
};

/**
 * Export individual API groups for convenience
 */
export const adminAPI = dashboardAPI.admin;
export const studentAPI = dashboardAPI.student;
export const teacherAPI = dashboardAPI.teacher;

/**
 * Export default
 */
export default dashboardAPI;
