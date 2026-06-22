import api from './api'

export function fetchUsers(){
  return api.get('/users')
}

export function createUser(payload){
  return api.post('/users', payload)
}

export function updateUserRole(id, role){
  return api.put(`/users/${id}/role?role=${encodeURIComponent(role)}`)
}
