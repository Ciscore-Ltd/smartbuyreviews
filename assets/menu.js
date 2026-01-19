/**
 * Smart Navigation Menu v4.0
 * Clean Minimal theme - light background styling
 * URL structure: /regions/{lang}/reviews/{file}.html
 */
class SmartNavigationMenu {
  constructor(options = {}) {
    this.menuContainerId = options.menuContainerId || 'dynamic-menu';
    this.menuDataUrl = options.menuDataUrl || '/data/menu.json';
    this.menuData = null;
    this.currentLang = this.detectLanguage();
    this.closeTimeout = null;
    this.init();
  }

  detectLanguage() {
    const pathMatch = window.location.pathname.match(/\/regions\/([a-z]{2})\//);
    if (pathMatch) return pathMatch[1];
    const stored = localStorage.getItem('preferredLanguage');
    if (stored) return stored;
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

  getLocalizedUrl(url) {
    return url.replace(/\/regions\/[a-z]{2}\//, `/regions/${this.currentLang}/`);
  }

  buildMenuHtml() {
    if (!this.menuData) return this.buildFallbackHtml();

    const reviews = this.menuData.reviews || [];
    const languages = this.menuData.languages || [];

    let html = '<nav class="flex items-center gap-6">';

    // Home link
    html += '<a href="/" class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors no-underline">Home</a>';

    // Reviews dropdown
    if (reviews.length > 0) {
      html += `<div class="relative group">
        <button class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-1">
          Reviews
          <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <div class="menu-dropdown absolute top-full right-0 pt-2 hidden z-50">
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[260px]">`;

      for (const review of reviews) {
        const localizedUrl = this.getLocalizedUrl(review.url);
        html += `<a href="${localizedUrl}" class="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm no-underline transition-colors">${review.label}</a>`;
      }

      html += '</div></div></div>';
    }

    // About link
    html += '<a href="/about.html" class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors no-underline">About</a>';

    // Language selector (simplified - just show current)
    if (languages.length > 1) {
      html += this.buildLanguageDropdown(languages);
    }

    html += '</nav>';
    return html;
  }

  buildLanguageDropdown(languages) {
    const currentLangData = languages.find(l => l.code === this.currentLang) || languages[0];
    const flagEmoji = this.getCountryFlag(currentLangData.code);

    let html = `<div class="relative group ml-2">
      <button class="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:border-gray-300">
        <span>${flagEmoji}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <div class="menu-dropdown absolute top-full right-0 pt-2 hidden z-50">
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px]">`;

    for (const lang of languages) {
      const isActive = lang.code === this.currentLang;
      const activeClass = isActive ? ' bg-gray-50 font-medium' : '';
      const flag = this.getCountryFlag(lang.code);
      html += `<a href="#" class="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm no-underline transition-colors${activeClass}" data-lang="${lang.code}">${flag} ${lang.label}</a>`;
    }

    html += '</div></div></div>';
    return html;
  }

  getCountryFlag(langCode) {
    const flags = {
      'en': '🇬🇧',
      'de': '🇩🇪',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'it': '🇮🇹',
      'nl': '🇳🇱',
      'pt': '🇵🇹'
    };
    return flags[langCode] || '🌐';
  }

  buildFallbackHtml() {
    return `
      <nav class="flex items-center gap-6">
        <a href="/" class="text-gray-600 hover:text-gray-900 text-sm font-medium no-underline">Home</a>
        <a href="/about.html" class="text-gray-600 hover:text-gray-900 text-sm font-medium no-underline">About</a>
      </nav>
    `;
  }

  attachEventListeners() {
    const self = this;

    document.querySelectorAll('.group').forEach(item => {
      const button = item.querySelector('button');
      const dropdown = item.querySelector('.menu-dropdown');

      if (!button || !dropdown) return;

      item.addEventListener('mouseenter', () => {
        if (self.closeTimeout) {
          clearTimeout(self.closeTimeout);
          self.closeTimeout = null;
        }
        document.querySelectorAll('.menu-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.add('hidden');
        });
        dropdown.classList.remove('hidden');
      });

      item.addEventListener('mouseleave', () => {
        self.closeTimeout = setTimeout(() => {
          dropdown.classList.add('hidden');
        }, 300);
      });

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isHidden = dropdown.classList.contains('hidden');
        document.querySelectorAll('.menu-dropdown').forEach(d => d.classList.add('hidden'));
        if (isHidden) dropdown.classList.remove('hidden');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.group')) {
        document.querySelectorAll('.menu-dropdown').forEach(d => d.classList.add('hidden'));
      }
    });

    document.querySelectorAll('[data-lang]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = el.dataset.lang;
        this.switchLanguage(newLang);
      });
    });
  }

  switchLanguage(newLang) {
    localStorage.setItem('preferredLanguage', newLang);
    const currentPath = window.location.pathname;
    if (currentPath.includes('/regions/')) {
      const newPath = currentPath.replace(/\/regions\/[a-z]{2}\//, `/regions/${newLang}/`);
      window.location.href = newPath;
    } else {
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

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SmartNavigationMenu());
} else {
  new SmartNavigationMenu();
}
