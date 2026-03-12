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
  const openButton = openSelector ? document.querySelector(openSelector) : null;
  const closeButtons = document.querySelectorAll(closeSelector);

  if (!dialog) {
    return;
  }

  const toggleDialog = (isOpen) => {
    dialog.hidden = !isOpen;
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  openButton?.addEventListener("click", () => {
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

setupDialog({
  dialogSelector: "[data-login-dialog]",
  openSelector: "[data-open-login-dialog]",
  closeSelector: "[data-close-login-dialog]"
});

setupDialog({
  dialogSelector: "[data-success-dialog]",
  closeSelector: "[data-close-success-dialog]"
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
  if (frequencyInput instanceof HTMLInputElement && frequencyInput.value) {
    frequencyOptions.forEach((option) => {
      if (option.getAttribute("data-frequency-choice") === frequencyInput.value) {
        option.classList.add("is-selected");
      }
    });
  }

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

const logoUploadInput = document.querySelector("[data-logo-upload-input]");
const logoUploadStatus = document.querySelector("[data-logo-upload-status]");
const logoUploadPanel = document.querySelector("[data-logo-upload-panel]");

if (
  logoUploadInput instanceof HTMLInputElement &&
  logoUploadStatus &&
  logoUploadPanel
) {
  const defaultUploadStatus = logoUploadStatus.textContent?.trim() || "Choose Logo File";

  const syncLogoUploadState = () => {
    const hasFile = Boolean(logoUploadInput.files?.length);

    logoUploadStatus.textContent = hasFile ? "Successful uploading" : defaultUploadStatus;
    logoUploadPanel.classList.toggle("is-uploaded", hasFile);
  };

  syncLogoUploadState();
  logoUploadInput.addEventListener("change", syncLogoUploadState);
}

const brandForm = document.querySelector("[data-brand-form]");

if (brandForm instanceof HTMLFormElement) {
  const clearFieldErrors = () => {
    brandForm.querySelectorAll(".field-group.has-error").forEach((group) => {
      group.classList.remove("has-error");
    });

    brandForm.querySelectorAll(".field-error").forEach((error) => {
      error.remove();
    });
  };

  const showFieldError = (field, message) => {
    const group = field.closest(".field-group");

    if (!group) {
      return;
    }

    group.classList.add("has-error");

    const error = document.createElement("div");
    error.className = "field-error";
    error.textContent = message;
    group.appendChild(error);
  };

  brandForm.addEventListener("submit", (event) => {
    clearFieldErrors();

    const invalidFields = Array.from(brandForm.querySelectorAll("input, select, textarea"))
      .filter((field) => field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)
      .filter((field) => !field.checkValidity());

    if (invalidFields.length === 0) {
      return;
    }

    event.preventDefault();

    invalidFields.forEach((field) => {
      showFieldError(field, field.validationMessage);
    });

    const firstInvalid = invalidFields[0];
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
