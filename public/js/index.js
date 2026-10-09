const getYear = () => {
  const today = new Date();

  const options = {
    year: "numeric",
  };

  const year = today.toLocaleDateString("en-US", options);
  return year;
};

const yearElement = document.getElementById("year");
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("list-menu");
const menuBackdrop = document.getElementById("menu-backdrop");
const menuIcon = document.getElementById("menu-icon");
const newListButton = document.getElementById("new-list-button");
const dialog = document.getElementById("new-list-dialog");
const dialogClose = document.getElementById("dialog-close");
const dialogCancel = document.getElementById("dialog-cancel");
const listNameInput = document.getElementById("list-name");
const newListForm = document.getElementById("new-list-form");
const listNameError = document.getElementById("list-name-error");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (yearElement) {
  yearElement.textContent = getYear();
}

document.querySelectorAll(".item-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", () => checkbox.form.submit());
});

if (menuToggle && menu && menuBackdrop) {
  const desktopMenuQuery = window.matchMedia("(min-width: 768px)");
  const menuTimeline = gsap.timeline({ paused: true });
  menuTimeline
    .set(menu, { display: "flex" })
    .to(menu, { x: 0, duration: prefersReducedMotion ? 0 : 0.45, ease: "power3.out" })
    .to(menuBackdrop, { autoAlpha: 1, duration: prefersReducedMotion ? 0 : 0.25 }, "<");

  const setMenuState = (isOpen) => {
    const isDesktop = desktopMenuQuery.matches;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close list menu" : "Open list menu");
    menu.setAttribute("aria-hidden", String(!isOpen && !isDesktop));
    menuIcon.src = isOpen ? "/icons/x.svg" : "/icons/menu.svg";
    document.body.classList.toggle("menu-open", isOpen);

    if (isOpen) {
      menuTimeline.play();
    } else {
      menuTimeline.reverse();
    }
  };

  const syncMenuForViewport = () => {
    if (desktopMenuQuery.matches) {
      menuTimeline.pause(0);
      menu.style.display = "flex";
      menu.style.transform = "none";
      menuBackdrop.style.opacity = "0";
      menuBackdrop.style.visibility = "hidden";
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.remove("menu-open");
    } else {
      menuTimeline.pause(0);
      menu.style.removeProperty("display");
      menu.style.removeProperty("transform");
      menuBackdrop.style.removeProperty("opacity");
      menuBackdrop.style.removeProperty("visibility");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open list menu");
      menuIcon.src = "/icons/menu.svg";
      document.body.classList.remove("menu-open");
      menu.setAttribute("aria-hidden", "true");
    }
  };

  syncMenuForViewport();
  desktopMenuQuery.addEventListener("change", syncMenuForViewport);

  const closeMenu = () => setMenuState(false);

  menuToggle.addEventListener("click", () => {
    setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  menuBackdrop.addEventListener("click", closeMenu);
  document.querySelectorAll("[data-menu-close]").forEach((element) => {
    element.addEventListener("click", closeMenu);
  });

  const dialogTimeline = gsap.timeline({ paused: true });
  dialogTimeline
    .set(dialog, { display: "grid" })
    .to(dialog, { autoAlpha: 1, duration: prefersReducedMotion ? 0 : 0.25 })
    .fromTo(
      dialog.querySelector(".dialog"),
      { y: prefersReducedMotion ? 0 : 18, scale: prefersReducedMotion ? 1 : 0.98 },
      { y: 0, scale: 1, duration: prefersReducedMotion ? 0 : 0.35, ease: "power2.out" },
      "<"
    );

  const openDialog = () => {
    closeMenu();
    dialog.hidden = false;
    document.body.classList.add("dialog-open");
    dialogTimeline.play();
    listNameInput.focus();
  };

  const closeDialog = () => {
    dialogTimeline.reverse();
    document.body.classList.remove("dialog-open");
    window.setTimeout(() => {
      dialog.hidden = true;
    }, prefersReducedMotion ? 0 : 350);
    newListButton.focus();
  };

  newListButton.addEventListener("click", openDialog);
  dialogClose.addEventListener("click", closeDialog);
  dialogCancel.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!dialog.hidden) {
        closeDialog();
      } else if (menuToggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuToggle.focus();
      }
    }
  });

  newListForm.addEventListener("submit", (event) => {
    const name = listNameInput.value.trim();
    if (!name || name.length > 60) {
      event.preventDefault();
      listNameError.textContent = "Enter a list name between 1 and 60 characters.";
      listNameInput.focus();
    }
  });

  if (dialog.dataset.openOnLoad === "true") {
    openDialog();
  }
}
