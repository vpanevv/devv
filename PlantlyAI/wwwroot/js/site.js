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

const setupDialog = ({ dialogSelector, openSelector, closeSelector }) => {
  const dialog = document.querySelector(dialogSelector);
  const openButton = document.querySelector(openSelector);
  const closeButtons = document.querySelectorAll(closeSelector);

  if (!dialog || !openButton) {
    return;
  }

  const toggleDialog = (isOpen) => {
    dialog.hidden = !isOpen;
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  openButton.addEventListener("click", () => {
    toggleDialog(true);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleDialog(false);
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      toggleDialog(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.hidden) {
      toggleDialog(false);
    }
  });
};

setupDialog({
  dialogSelector: "[data-services-dialog]",
  openSelector: "[data-open-services-dialog]",
  closeSelector: "[data-close-services-dialog]"
});

setupDialog({
  dialogSelector: "[data-brand-dialog]",
  openSelector: "[data-open-brand-dialog]",
  closeSelector: "[data-close-brand-dialog]"
});

const mapLocationInput = document.querySelector("[data-map-location-input]");
const mapChoiceButtons = document.querySelectorAll("[data-map-choice]");
const mapLocationSelect = document.querySelector("[data-map-location-select]");

if (mapLocationInput && mapChoiceButtons.length > 0) {
  mapChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      mapLocationInput.value = button.getAttribute("data-map-choice") ?? "";
      mapLocationInput.focus();
    });
  });
}

if (mapLocationInput && mapLocationSelect) {
  mapLocationSelect.addEventListener("change", () => {
    mapLocationInput.value = mapLocationSelect.value;
    mapLocationInput.focus();
  });
}

const frequencyInput = document.querySelector("[data-frequency-input]");
const frequencyOptions = document.querySelectorAll("[data-frequency-choice]");

if (frequencyInput && frequencyOptions.length > 0) {
  frequencyOptions.forEach((button) => {
    button.addEventListener("click", () => {
      frequencyOptions.forEach((option) => {
        option.classList.remove("is-selected");
      });

      button.classList.add("is-selected");
      frequencyInput.value = button.getAttribute("data-frequency-choice") ?? "";
    });
  });
}

const platformToggles = document.querySelectorAll("[data-platform-toggle]");

if (platformToggles.length > 0) {
  platformToggles.forEach((toggle) => {
    const platformName = toggle.getAttribute("data-platform-toggle");

    if (!platformName) {
      return;
    }

    const linkInput = document.querySelector(`[data-platform-link="${platformName}"]`);

    if (!(linkInput instanceof HTMLInputElement) || !(toggle instanceof HTMLInputElement)) {
      return;
    }

    const syncPlatformRequirement = () => {
      linkInput.required = toggle.checked;
    };

    syncPlatformRequirement();
    toggle.addEventListener("change", syncPlatformRequirement);
  });
}
