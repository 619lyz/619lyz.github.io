const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const sectionLinks = [...document.querySelectorAll("[data-nav-section]")];
const sections = sectionLinks
  .map((link) => document.querySelector(`#${link.dataset.navSection}`))
  .filter(Boolean);

const setActiveSection = (sectionId) => {
  sectionLinks.forEach((link) => {
    const isActive = link.dataset.navSection === sectionId;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateActiveSection = () => {
  const marker = window.scrollY + Math.min(window.innerHeight * 0.32, 260);
  let activeSection = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= marker) {
      activeSection = section.id;
    }
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeSection = "contact";
  }

  if (activeSection) {
    setActiveSection(activeSection);
  }
};

let scrollFrame;

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      updateActiveSection();
      scrollFrame = undefined;
    });
  },
  { passive: true },
);

window.addEventListener("resize", updateActiveSection);

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveSection(link.dataset.navSection));
});

updateActiveSection();
