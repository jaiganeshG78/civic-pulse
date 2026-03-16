import api from './api';

export async function getIssues() {
  const response = await api.get('/issues');
  return response.data;
}

export async function getIssueById(issueId: string) {
  const response = await api.get(`/issues/${issueId}`);
  return response.data;
}

export interface CreateIssueData {
  description: string;
  latitude: number;
  longitude: number;
  image: File;
  force_duplicate?: boolean;
  forced_against_issue_id?: string;
}

export async function createIssue(data: CreateIssueData) {
  const formData = new FormData();
  formData.append('description', data.description);
  formData.append('latitude', String(data.latitude));
  formData.append('longitude', String(data.longitude));
  formData.append('image', data.image);

  if (data.force_duplicate) {
    formData.append('force_duplicate', 'true');
  }
  if (data.forced_against_issue_id) {
    formData.append('forced_against_issue_id', data.forced_against_issue_id);
  }

  const response = await api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function voteOnIssue(issueId: string) {
  const response = await api.post(`/issues/${issueId}/vote`);
  return response.data;
}
