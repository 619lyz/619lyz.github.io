const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const robotDialog = document.querySelector("#robot-dialog");
const openRobot = document.querySelector("[data-open-robot]");
const closeRobot = document.querySelector("[data-close-robot]");

openRobot?.addEventListener("click", () => {
  robotDialog?.showModal();
});

closeRobot?.addEventListener("click", () => {
  robotDialog?.close();
});

robotDialog?.addEventListener("click", (event) => {
  if (event.target === robotDialog) {
    robotDialog.close();
  }
});
