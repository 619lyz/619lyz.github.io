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

const news = document.querySelector(".news");

if (news) {
  const list = news.querySelector(".news-list");
  const items = [...list.children];
  const controls = news.querySelector(".news-controls");
  const toggle = news.querySelector(".news-toggle");
  const scrollButton = news.querySelector(".news-scroll");
  const position = news.querySelector(".news-position");
  const count = String(items.length).padStart(2, "0");
  let expanded = false;

  news.querySelector(".news-count").textContent = count;

  const updateNews = () => {
    const previewHeight = parseFloat(getComputedStyle(news).getPropertyValue("--news-preview-height"));
    const collapsible = list.scrollHeight > previewHeight + 2;
    if (!collapsible) {
      expanded = false;
    }

    news.classList.toggle("is-collapsible", collapsible);
    news.classList.toggle("is-expanded", expanded);
    controls.hidden = !collapsible;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.querySelector("span").textContent = expanded ? "收起动态" : "展示全部";

    const scrollable = collapsible && !expanded;
    const atEnd = list.scrollHeight - list.clientHeight - list.scrollTop < 2;
    news.classList.toggle("can-scroll-more", scrollable && !atEnd);
    news.classList.toggle("at-end", atEnd);
    if (scrollable) {
      list.setAttribute("tabindex", "0");
    } else {
      list.removeAttribute("tabindex");
    }

    const listTop = list.getBoundingClientRect().top;
    const firstVisible = items.findIndex(item => item.getBoundingClientRect().bottom > listTop + 24);
    const current = atEnd ? items.length : Math.max(1, firstVisible + 1);
    position.textContent = `${String(current).padStart(2, "0")} / ${count}`;
    const scrollLabel = atEnd ? "回到最新动态" : "继续浏览动态";
    scrollButton.setAttribute("aria-label", scrollLabel);
    scrollButton.title = scrollLabel;
  };

  toggle.addEventListener("click", () => {
    expanded = !expanded;
    updateNews();
    if (!expanded) {
      list.scrollTop = 0;
      updateNews();
      // Keep the collapse button in view when the expanded column becomes shorter.
      const bounds = toggle.getBoundingClientRect();
      if (bounds.top < 100 || bounds.bottom > window.innerHeight) {
        toggle.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }
    updateActiveSection();
  });

  scrollButton.addEventListener("click", () => {
    const atEnd = news.classList.contains("at-end");
    list.scrollTo({
      top: atEnd ? 0 : list.scrollTop + list.clientHeight * 0.8,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  });

  list.addEventListener("scroll", updateNews, { passive: true });
  const newsObserver = new ResizeObserver(updateNews);
  newsObserver.observe(list);
  items.forEach(item => newsObserver.observe(item));
  updateNews();
}
