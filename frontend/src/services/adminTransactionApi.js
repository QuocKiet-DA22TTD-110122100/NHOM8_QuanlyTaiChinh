const API_BASE = '/api/v1/transactions';

export const adminTransactionApi = {
  getAll: (params, token) =>
    fetch(`${API_BASE}?${new URLSearchParams(params)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),

  create: (data, token) =>
    fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  update: (id, data, token) =>
    fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  remove: (id, token) =>
    fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),

  detail: (id, token) =>
    fetch(`${API_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),
}; 