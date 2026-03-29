/**
 * VaneNavigation - Pixel-perfect sidebar matching Vane's design
 */

export class VaneNavigation {
  private container: HTMLElement;
  private navElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  private getActiveRoute(): string {
    const path = window.location.pathname;
    if (path === '/' || path === '') return 'home';
    if (path.includes('discover')) return 'discover';
    if (path.includes('library')) return 'library';
    if (path.includes('portfolio')) return 'portfolio';
    if (path.includes('monitor')) return 'monitor';
    return 'monitor'; // Default to monitor for WorldMonitor
  }

  render(): void {
    const activeRoute = this.getActiveRoute();
    
    // Use relative paths for unified routing through nginx
    const baseUrl = '';

    // Create navigation bar
    this.navElement = document.createElement('div');
    this.navElement.className = 'vane-navigation';
    this.navElement.innerHTML = `
      <div class="vane-nav-content">
        <!-- New Chat Button -->
        <a href="/" class="vane-nav-button" title="New Chat">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </a>

        <!-- Navigation Links Container -->
        <div class="vane-nav-links">
          <!-- Home -->
          <a href="/" class="vane-nav-link ${activeRoute === 'home' ? 'active' : ''}" title="Home">
            <div class="vane-nav-icon-wrapper ${activeRoute === 'home' ? 'active' : ''}">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Home</span>
          </a>

          <!-- Discover -->
          <a href="/discover" class="vane-nav-link ${activeRoute === 'discover' ? 'active' : ''}" title="Discover">
            <div class="vane-nav-icon-wrapper ${activeRoute === 'discover' ? 'active' : ''}">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <span>Discover</span>
          </a>

          <!-- Library -->
          <a href="/library" class="vane-nav-link ${activeRoute === 'library' ? 'active' : ''}" title="Library">
            <div class="vane-nav-icon-wrapper ${activeRoute === 'library' ? 'active' : ''}">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span>Library</span>
          </a>

          <!-- Portfolio -->
          <a href="/portfolio" class="vane-nav-link ${activeRoute === 'portfolio' ? 'active' : ''}" title="Portfolio">
            <div class="vane-nav-icon-wrapper ${activeRoute === 'portfolio' ? 'active' : ''}">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
              </svg>
            </div>
            <span>Portfolio</span>
          </a>

          <!-- Monitor (Current) -->
          <div class="vane-nav-link active" title="World Monitor (Current)">
            <div class="vane-nav-icon-wrapper active">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span>Monitor</span>
          </div>
        </div>

        <!-- Settings Button -->
        <button class="vane-nav-button" title="Settings" id="vane-settings-btn">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    `;

    // Insert at the top of the container
    const firstChild = this.container.firstChild;
    if (firstChild) {
      this.container.insertBefore(this.navElement, firstChild);
    } else {
      this.container.appendChild(this.navElement);
    }

    // Add settings button click handler (placeholder for now)
    const settingsBtn = this.navElement.querySelector('#vane-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        console.log('Settings clicked - implement settings dialog');
        // TODO: Implement settings dialog
      });
    }
  }

  destroy(): void {
    this.navElement?.remove();
    this.navElement = null;
  }
}
