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
