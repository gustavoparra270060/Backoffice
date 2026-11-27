async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers["auth-token"] = getToken();

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (auth && (res.status === 401 || res.status === 403)) {
    logout();
    throw new Error("Tu sesión expiró. Inicia sesión de nuevo.");
  }

  if (!res.ok) {
    const message = data && (data.message || data.error);
    throw new Error(message || "Ocurrió un error. Inténtalo de nuevo.");
  }

  return data;
}

function registerUser({ name, email, itsonId, password }) {
  return request("/auth/register", {
    method: "POST",
    body: { name, email, itsonId, password },
  });
}

async function loginUser({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (!data || !data.token) throw new Error("La respuesta del servidor no incluye token.");
  saveSession(data.token, data.user);
  return data;
}

async function getMyProjects() {
  const data = await request("/projects", { auth: true });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.projects)) return data.projects;
  return [];
}

function createProject(project) {
  return request("/projects", { method: "POST", body: project, auth: true });
}

function updateProject(projectId, updates) {
  return request(`/projects/${encodeURIComponent(projectId)}`, {
    method: "PUT",
    body: updates,
    auth: true,
  });
}

function deleteProject(projectId) {
  return request(`/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
    auth: true,
  });
}
