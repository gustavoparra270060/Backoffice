const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";
const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function decodeToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

function requireAuth() {
  if (isTokenValid(getToken())) return true;
  clearSession();
  window.location.replace("login.html");
  return false;
}

function redirectIfAuthenticated() {
  if (isTokenValid(getToken())) window.location.replace("home.html");
}

function logout() {
  clearSession();
  window.location.replace("login.html");
}
