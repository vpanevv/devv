const dateElement = document.querySelector("[data-current-date]");
const timeElement = document.querySelector("[data-current-time]");

if (dateElement && timeElement) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric"
  });

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const updateSignalClock = () => {
    const now = new Date();
    dateElement.textContent = dateFormatter.format(now);
    timeElement.textContent = timeFormatter.format(now);
  };

  updateSignalClock();
  window.setInterval(updateSignalClock, 1000);
}

const servicesDialog = document.querySelector("[data-services-dialog]");
const openServicesButton = document.querySelector("[data-open-services-dialog]");
const closeServicesButtons = document.querySelectorAll("[data-close-services-dialog]");

if (servicesDialog && openServicesButton) {
  const toggleServicesDialog = (isOpen) => {
    servicesDialog.hidden = !isOpen;
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  openServicesButton.addEventListener("click", () => {
    toggleServicesDialog(true);
  });

  closeServicesButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleServicesDialog(false);
    });
  });

  servicesDialog.addEventListener("click", (event) => {
    if (event.target === servicesDialog) {
      toggleServicesDialog(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !servicesDialog.hidden) {
      toggleServicesDialog(false);
    }
  });
}
