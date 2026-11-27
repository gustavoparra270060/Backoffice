if (requireAuth()) init();

function init() {
  document.documentElement.classList.add("ready");

  const list = document.getElementById("project-list");
  const template = document.getElementById("project-template");
  const statusBox = document.getElementById("status");
  const emptyBox = document.getElementById("empty");
  const dialog = document.getElementById("project-dialog");
  const form = document.getElementById("project-form");
  const dialogTitle = document.getElementById("dialog-title");
  const formAlert = document.getElementById("form-alert");
  const saveBtn = document.getElementById("save-btn");

  let projects = [];
  let editingId = null;

  const user = getUser();
  document.getElementById("user-name").textContent = user && user.name ? user.name : "Usuario";

  document.getElementById("logout-btn").addEventListener("click", logout);
  document.getElementById("add-btn").addEventListener("click", () => openForm());
  document.getElementById("cancel-btn").addEventListener("click", () => dialog.close());
  form.addEventListener("submit", onSubmit);
  list.addEventListener("click", onListClick);

  loadProjects();

  function setStatus(message) {
    statusBox.textContent = message || "";
    statusBox.hidden = !message;
  }

  async function loadProjects() {
    setStatus("Cargando proyectos…");
    try {
      projects = await getMyProjects();
      setStatus("");
      render();
    } catch (error) {
      setStatus(error.message);
    }
  }

  function render() {
    list.replaceChildren();
    emptyBox.hidden = projects.length > 0;

    projects.forEach((project) => {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = project._id;
      node.querySelector(".project__title").textContent = project.title;
      node.querySelector(".project__desc").textContent = project.description;

      const tags = node.querySelector(".tags");
      (project.technologies || []).forEach((tech) => {
        const li = document.createElement("li");
        li.className = "tag";
        li.textContent = tech;
        tags.append(li);
      });

      const repo = node.querySelector(".project__repo");
      if (project.repository) {
        repo.href = project.repository;
      } else {
        repo.remove();
      }

      const img = node.querySelector(".project__img");
      if (project.images && project.images[0]) {
        img.src = project.images[0];
      } else {
        img.remove();
      }

      list.append(node);
    });

    updateStats();
  }

  function updateStats() {
    const techs = new Set();
    projects.forEach((p) => (p.technologies || []).forEach((t) => techs.add(t.toLowerCase())));
    document.getElementById("stat-total").textContent = projects.length;
    document.getElementById("stat-tech").textContent = techs.size;
    document.getElementById("stat-repo").textContent = projects.filter((p) => p.repository).length;
  }

  function openForm(project) {
    editingId = project ? project._id : null;
    form.reset();
    formAlert.hidden = true;
    dialogTitle.textContent = project ? "Actualizar proyecto" : "Agregar proyecto";
    saveBtn.textContent = project ? "Guardar cambios" : "Crear proyecto";

    if (project) {
      form.elements.title.value = project.title || "";
      form.elements.description.value = project.description || "";
      form.elements.technologies.value = (project.technologies || []).join(", ");
      form.elements.repository.value = project.repository || "";
      form.elements.images.value = (project.images || []).join("\n");
    }
    dialog.showModal();
  }

  function onListClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.closest(".project").dataset.id;
    const project = projects.find((p) => p._id === id);
    if (!project) return;

    if (button.dataset.action === "edit") openForm(project);
    if (button.dataset.action === "delete") onDelete(project);
  }

  function getUserId() {
    if (user && user.id) return user.id;
    const payload = decodeToken(getToken()) || {};
    return payload.id || payload._id || payload.userId || payload.sub;
  }

  function readForm() {
    const split = (text, separator) =>
      text.split(separator).map((item) => item.trim()).filter(Boolean);

    const body = {
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      userId: getUserId(),
      technologies: split(form.elements.technologies.value, ","),
      images: split(form.elements.images.value, "\n"),
    };
    const repository = form.elements.repository.value.trim();
    if (repository) body.repository = repository;
    return body;
  }

  async function onSubmit(event) {
    event.preventDefault();
    formAlert.hidden = true;
    if (!form.reportValidity()) return;

    saveBtn.disabled = true;
    const label = saveBtn.textContent;
    saveBtn.textContent = "Guardando…";

    try {
      const body = readForm();
      if (editingId) {
        await updateProject(editingId, body);
      } else {
        await createProject(body);
      }
      dialog.close();
      await loadProjects();
    } catch (error) {
      formAlert.textContent = error.message;
      formAlert.hidden = false;
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = label;
    }
  }

  async function onDelete(project) {
    if (!window.confirm(`¿Eliminar el proyecto "${project.title}"? Esta acción no se puede deshacer.`)) return;
    setStatus("Eliminando…");
    try {
      await deleteProject(project._id);
      await loadProjects();
    } catch (error) {
      setStatus(error.message);
    }
  }
}
