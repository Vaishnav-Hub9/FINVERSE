const BASE_URL = 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('finverse_token')

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const api = {
  // Auth
  signup: (data) => fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  login: (data) => fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Transactions
  getTransactions: () => fetch(`${BASE_URL}/transactions`, { headers: headers() }).then(r => r.json()),
  addTransaction: (data) => fetch(`${BASE_URL}/transactions`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  updateTransaction: (id, data) => fetch(`${BASE_URL}/transactions/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteTransaction: (id) => fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
  getAnalytics: () => fetch(`${BASE_URL}/transactions/analytics`, { headers: headers() }).then(r => r.json()),

  // Budget
  getBudget: () => fetch(`${BASE_URL}/budget`, { headers: headers() }).then(r => r.json()),
  addCategory: (data) => fetch(`${BASE_URL}/budget`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  updateCategory: (id, data) => fetch(`${BASE_URL}/budget/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteCategory: (id) => fetch(`${BASE_URL}/budget/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),

  // Stocks
  getStocks: () => fetch(`${BASE_URL}/stocks`, { headers: headers() }).then(r => r.json()),
  addStock: (data) => fetch(`${BASE_URL}/stocks`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  updateStock: (id, data) => fetch(`${BASE_URL}/stocks/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteStock: (id) => fetch(`${BASE_URL}/stocks/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),

  // Reminders
  getReminders: () => fetch(`${BASE_URL}/reminders`, { headers: headers() }).then(r => r.json()),
  addReminder: (data) => fetch(`${BASE_URL}/reminders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  updateReminder: (id, data) => fetch(`${BASE_URL}/reminders/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteReminder: (id) => fetch(`${BASE_URL}/reminders/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
}
