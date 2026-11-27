redirectIfAuthenticated();

const form = document.getElementById("register-form");
const alertBox = document.getElementById("alert");
const submitBtn = form.querySelector("button[type='submit']");

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert--${type}`;
  alertBox.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  alertBox.hidden = true;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  submitBtn.disabled = true;
  submitBtn.textContent = "Creando cuenta…";

  try {
    await registerUser({
      name: data.get("name").trim(),
      email: data.get("email").trim(),
      itsonId: data.get("itsonId").trim(),
      password: data.get("password"),
    });
    window.location.replace("login.html?registered=1");
  } catch (error) {
    showAlert(error.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Crear cuenta";
  }
});
