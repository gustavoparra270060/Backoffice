redirectIfAuthenticated();

const form = document.getElementById("login-form");
const alertBox = document.getElementById("alert");
const submitBtn = form.querySelector("button[type='submit']");

if (new URLSearchParams(window.location.search).get("registered") === "1") {
  showAlert("Cuenta creada con éxito. Ya puedes iniciar sesión.", "success");
}

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
  submitBtn.textContent = "Ingresando…";

  try {
    await loginUser({
      email: data.get("email").trim(),
      password: data.get("password"),
    });
    window.location.replace("home.html");
  } catch (error) {
    showAlert(error.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Iniciar sesión";
  }
});
