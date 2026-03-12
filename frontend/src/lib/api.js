import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const callsApi = {
  getAll: (status) => axios.get(`${API}/calls`, { params: { status } }),
  getOne: (id) => axios.get(`${API}/calls/${id}`),
  create: (data) => axios.post(`${API}/calls`, data),
  update: (id, data) => axios.put(`${API}/calls/${id}`, data),
  delete: (id) => axios.delete(`${API}/calls/${id}`),
  uploadTranscript: (id, transcriptText) =>
    axios.post(`${API}/calls/${id}/transcript`, null, { params: { transcript_text: transcriptText } }),
  approve: (id, data) => axios.post(`${API}/calls/${id}/approve`, data),
  approveAll: (id) => axios.post(`${API}/calls/${id}/approve-all`),
};

export const vaultApi = {
  getAll: () => axios.get(`${API}/vault`),
  create: (data) => axios.post(`${API}/vault`, data),
  update: (id, data) => axios.put(`${API}/vault/${id}`, data),
  toggle: (id) => axios.patch(`${API}/vault/${id}/toggle`),
  delete: (id) => axios.delete(`${API}/vault/${id}`),
};

export const adminApi = {
  getTeam: () => axios.get(`${API}/admin/team`),
  inviteMember: (data) => axios.post(`${API}/admin/team/invite`, data),
  removeMember: (id) => axios.delete(`${API}/admin/team/${id}`),
  updateRole: (id, role) => axios.patch(`${API}/admin/team/${id}/role`, null, { params: { role } }),
  getSettings: () => axios.get(`${API}/admin/settings`),
  updateSettings: (data) => axios.put(`${API}/admin/settings`, data),
  getPerformance: () => axios.get(`${API}/admin/performance`),
};

export const userApi = {
  getStats: () => axios.get(`${API}/user/stats`),
  getNotifications: () => axios.get(`${API}/user/notifications`),
  updateNotifications: (data) => axios.put(`${API}/user/notifications`, data),
  getOnboarding: () => axios.get(`${API}/user/onboarding`),
  updateOnboarding: (data) => axios.put(`${API}/user/onboarding`, data),
  updateProfile: (name) => axios.put(`${API}/user/profile`, null, { params: { name } }),
};

export const platformApi = {
  getWorkspaces: () => axios.get(`${API}/platform/workspaces`),
  createWorkspace: (data) => axios.post(`${API}/platform/workspaces`, data),
  getSuperusers: () => axios.get(`${API}/platform/superusers`),
  createSuperuser: (data) => axios.post(`${API}/platform/superusers`, data),
  getStats: () => axios.get(`${API}/platform/stats`),
  setup: (data) => axios.post(`${API}/platform/setup`, data),
};

export const publicApi = {
  submitDemo: (data) => axios.post(`${API}/demo-request`, data),
};

export default {
  calls: callsApi,
  vault: vaultApi,
  admin: adminApi,
  user: userApi,
  platform: platformApi,
  public: publicApi,
};
