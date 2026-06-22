import api from './api'

export function fetchUsers() {
  return api.get('/users')
}

export function fetchUser(id) {
  return api.get(`/users/${id}`)
}

export function createUser(payload) {
  return api.post('/users', payload)
}

export function updateUser(id, payload) {
  return api.put(`/users/${id}`, payload)
}

export function updateUserRole(id, role) {
  return api.patch(`/users/${id}/role`, { role })
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`)
}
