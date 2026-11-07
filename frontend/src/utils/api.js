// Base API fetch wrapper using Native Fetch API (No Axios)
const BASE_URL = '/api';

export const fetchClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('collegefinder_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
};

// 1. Authentication APIs
export const authApi = {
  login: (credentials) => fetchClient('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => fetchClient('/auth/register', { method: 'POST', body: userData }),
  getMe: () => fetchClient('/auth/me'),
  updateProfile: (profileData) => fetchClient('/auth/profile', { method: 'PUT', body: profileData }),
};

// 2. College APIs
export const collegeApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchClient(`/colleges${query ? `?${query}` : ''}`);
  },
  getOne: (idOrSlug) => fetchClient(`/colleges/${idOrSlug}`),
  getDistricts: () => fetchClient('/colleges/meta/districts'),
  create: (data) => fetchClient('/colleges', { method: 'POST', body: data }),
  update: (id, data) => fetchClient(`/colleges/${id}`, { method: 'PUT', body: data }),
  updateStatus: (id, statusData) => fetchClient(`/colleges/${id}/status`, { method: 'PATCH', body: statusData }),
  delete: (id) => fetchClient(`/colleges/${id}`, { method: 'DELETE' }),
};

// 3. Course APIs
export const courseApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchClient(`/courses${query ? `?${query}` : ''}`);
  },
  getOne: (id) => fetchClient(`/courses/${id}`),
  create: (data) => fetchClient('/courses', { method: 'POST', body: data }),
  update: (id, data) => fetchClient(`/courses/${id}`, { method: 'PUT', body: data }),
  delete: (id) => fetchClient(`/courses/${id}`, { method: 'DELETE' }),
};

// 4. Enquiry APIs
export const enquiryApi = {
  create: (data) => fetchClient('/enquiries', { method: 'POST', body: data }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchClient(`/enquiries${query ? `?${query}` : ''}`);
  },
  updateStatus: (id, statusData) => fetchClient(`/enquiries/${id}/status`, { method: 'PATCH', body: statusData }),
  delete: (id) => fetchClient(`/enquiries/${id}`, { method: 'DELETE' }),
};

// 5. Wishlist APIs
export const wishlistApi = {
  get: () => fetchClient('/wishlist'),
  add: (collegeId) => fetchClient(`/wishlist/${collegeId}`, { method: 'POST' }),
  remove: (collegeId) => fetchClient(`/wishlist/${collegeId}`, { method: 'DELETE' }),
  check: (collegeId) => fetchClient(`/wishlist/check/${collegeId}`),
};

// 6. Subscription APIs
export const subscriptionApi = {
  getPlans: () => fetchClient('/subscriptions/plans'),
  getCurrent: () => fetchClient('/subscriptions/current'),
  subscribe: (data) => fetchClient('/subscriptions/subscribe', { method: 'POST', body: data }),
  getAll: () => fetchClient('/subscriptions/all'),
  createPlan: (data) => fetchClient('/subscriptions/plans', { method: 'POST', body: data }),
  updatePlan: (id, data) => fetchClient(`/subscriptions/plans/${id}`, { method: 'PUT', body: data }),
};

// 7. Review APIs
export const reviewApi = {
  getCollegeReviews: (collegeId) => fetchClient(`/reviews/college/${collegeId}`),
  create: (data) => fetchClient('/reviews', { method: 'POST', body: data }),
  getAll: () => fetchClient('/reviews'),
  updateStatus: (id, status) => fetchClient(`/reviews/${id}/status`, { method: 'PATCH', body: { status } }),
  delete: (id) => fetchClient(`/reviews/${id}`, { method: 'DELETE' }),
};

// 8. User Management APIs (Super Admin)
export const userApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchClient(`/users${query ? `?${query}` : ''}`);
  },
  updateStatus: (id, data) => fetchClient(`/users/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => fetchClient(`/users/${id}`, { method: 'DELETE' }),
};

// 9. Analytics APIs
export const analyticsApi = {
  getSuperAdmin: () => fetchClient('/analytics/superadmin'),
  getCollegeAdmin: () => fetchClient('/analytics/collegeadmin'),
  getLogs: () => fetchClient('/analytics/logs'),
};

