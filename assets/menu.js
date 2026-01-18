/**
 * Smart Navigation Menu v3.1
 * Simple flat menu with Reviews dropdown and language switching
 * URL structure: /regions/{lang}/reviews/{file}.html
 */
class SmartNavigationMenu {
  constructor(options = {}) {
    this.menuContainerId = options.menuContainerId || 'dynamic-menu';
    this.menuDataUrl = options.menuDataUrl || '/data/menu.json';
    this.menuData = null;
    this.currentLang = this.detectLanguage();
    this.init();
  }

  detectLanguage() {
    // Check URL path first: /regions/en/reviews/...
    const pathMatch = window.location.pathname.match(/\/regions\/([a-z]{2})\//);
    if (pathMatch) return pathMatch[1];

    // Check localStorage
    const stored = localStorage.getItem('preferredLanguage');
    if (stored) return stored;

    // Default to English
    return 'en';
  }

  init() {
    this.loadMenuData();
  }

  loadMenuData() {
    fetch(this.menuDataUrl)
      .then(response => response.json())
      .then(data => {
        this.menuData = data;
        this.renderMenu();
      })
      .catch(error => {
        console.warn('Failed to load menu data:', error);
        this.renderFallbackMenu();
      });
  }

  renderMenu() {
    const container = document.getElementById(this.menuContainerId);
    if (!container) return;
    container.innerHTML = this.buildMenuHtml();
    this.attachEventListeners();
  }

  // Adjust review URLs for current language
  getLocalizedUrl(url) {
    // Replace /regions/en/ with /regions/{currentLang}/
    return url.replace(/\/regions\/[a-z]{2}\//, `/regions/${this.currentLang}/`);
  }

  buildMenuHtml() {
    if (!this.menuData) return this.buildFallbackHtml();

    const reviews = this.menuData.reviews || [];
    const languages = this.menuData.languages || [];

    let html = '<ul class="menu-list flex flex-wrap items-center gap-4 lg:gap-6">';

    // Home link
    html += '<li class="menu-item"><a href="/" class="menu-link text-white hover:text-slate-200 transition-colors">Home</a></li>';

    // Reviews dropdown (only if there are reviews)
    if (reviews.length > 0) {
      html += `<li class="menu-item menu-item--with-children relative">
        <button class="menu-link menu-link--parent text-white hover:text-slate-200 transition-colors flex items-center gap-1">
          Reviews
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <ul class="menu-submenu absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-xl py-2 min-w-[250px] hidden z-50">`;

      for (const review of reviews) {
        const localizedUrl = this.getLocalizedUrl(review.url);
        html += `<li class="menu-submenu-item">
          <a href="${localizedUrl}" class="menu-submenu-link block px-4 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">${review.label}</a>
        </li>`;
      }

      html += '</ul></li>';
    }

    // About link
    html += '<li class="menu-item"><a href="/about.html" class="menu-link text-white hover:text-slate-200 transition-colors">About</a></li>';

    // Privacy Policy link
    html += '<li class="menu-item"><a href="/privacy-policy.html" class="menu-link text-white hover:text-slate-200 transition-colors">Privacy Policy</a></li>';

    // Language dropdown (if multiple languages)
    if (languages.length > 1) {
      html += this.buildLanguageDropdown(languages);
    }

    html += '</ul>';
    return html;
  }

  buildLanguageDropdown(languages) {
    const currentLangData = languages.find(l => l.code === this.currentLang) || languages[0];

    let html = `<li class="menu-item menu-item--with-children relative ml-4">
      <button class="menu-link menu-link--parent text-white hover:text-slate-200 transition-colors flex items-center gap-1 border border-white/20 rounded px-3 py-1">
        <span class="text-sm">${currentLangData.flag} ${currentLangData.code.toUpperCase()}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <ul class="menu-submenu absolute top-full right-0 mt-2 bg-slate-800 rounded-lg shadow-xl py-2 min-w-[140px] hidden z-50">`;

    for (const lang of languages) {
      const isActive = lang.code === this.currentLang;
      const activeClass = isActive ? ' bg-slate-700' : '';
      html += `<li class="menu-submenu-item">
        <a href="#" class="menu-submenu-link block px-4 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors${activeClass}" data-lang="${lang.code}">${lang.flag} ${lang.label}</a>
      </li>`;
    }

    html += '</ul></li>';
    return html;
  }

  buildFallbackHtml() {
    return `
      <ul class="menu-list flex flex-wrap items-center gap-4 lg:gap-6">
        <li class="menu-item"><a href="/" class="menu-link text-white hover:text-slate-200">Home</a></li>
        <li class="menu-item"><a href="/about.html" class="menu-link text-white hover:text-slate-200">About</a></li>
        <li class="menu-item"><a href="/privacy-policy.html" class="menu-link text-white hover:text-slate-200">Privacy Policy</a></li>
      </ul>
    `;
  }

  attachEventListeners() {
    // Dropdown toggle on click
    document.querySelectorAll('.menu-item--with-children').forEach(item => {
      const button = item.querySelector('.menu-link--parent');
      const submenu = item.querySelector('.menu-submenu');

      if (button && submenu) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Close other open menus
          document.querySelectorAll('.menu-submenu').forEach(sm => {
            if (sm !== submenu) sm.classList.add('hidden');
          });

          submenu.classList.toggle('hidden');
        });
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-item--with-children')) {
        document.querySelectorAll('.menu-submenu').forEach(sm => {
          sm.classList.add('hidden');
        });
      }
    });

    // Language switching
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = el.dataset.lang;
        this.switchLanguage(newLang);
      });
    });
  }

  switchLanguage(newLang) {
    // Save preference
    localStorage.setItem('preferredLanguage', newLang);

    const currentPath = window.location.pathname;

    // If on a region page, swap the language code
    if (currentPath.includes('/regions/')) {
      const newPath = currentPath.replace(/\/regions\/[a-z]{2}\//, `/regions/${newLang}/`);
      window.location.href = newPath;
    } else {
      // On home/about/etc - just update preference and re-render menu
      this.currentLang = newLang;
      this.renderMenu();
    }
  }

  renderFallbackMenu() {
    const container = document.getElementById(this.menuContainerId);
    if (container) {
      container.innerHTML = this.buildFallbackHtml();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SmartNavigationMenu();
  });
} else {
  new SmartNavigationMenu();
}
