/* JavaScript enhances the embedded navigation behavior. */
(() => {
  'use strict';
  const header = document.querySelector('[data-shared-header]');
  if (!header || header.hasAttribute('data-enhanced')) return;
  const toggle = header.querySelector('.shared-header__toggle');
  const navigation = header.querySelector('.shared-header__nav');
  if (!toggle || !navigation) return;
  const groups = [...navigation.querySelectorAll('details')];
  const mobile = window.matchMedia('(max-width: 1120px)');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const drawer = document.createElement('div');
  drawer.className = 'shared-header__drawer';
  drawer.id = 'shared-mobile-menu';
  const drawerHead = document.createElement('div');
  drawerHead.className = 'shared-header__drawer-head';
  drawerHead.innerHTML = '<span id="shared-menu-title">メニュー</span><button class="shared-header__drawer-close" type="button" aria-label="メニューを閉じる"><span aria-hidden="true">×</span></button>';
  const actions = header.querySelector('.shared-header__actions');
  navigation.before(drawer);
  drawer.append(drawerHead);
  if (actions) drawer.append(actions);
  drawer.append(navigation);
  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'shared-header__backdrop';
  backdrop.tabIndex = -1;
  backdrop.setAttribute('aria-label', 'メニューを閉じる');
  header.append(backdrop);
  const closeButton = drawer.querySelector('.shared-header__drawer-close');
  toggle.setAttribute('aria-controls', drawer.id);
  const blocked = new Map();
  let lockedScroll = null;
  let savedBodyStyles;
  const lockPage = () => {
    if (lockedScroll !== null) return;
    lockedScroll = window.scrollY;
    savedBodyStyles = ['position','top','width'].map(key => [key,document.body.style[key]]);
    Object.assign(document.body.style, {position:'fixed',top:`-${lockedScroll}px`,width:'100%'});
    document.documentElement.classList.add('shared-menu-open');
    for (const child of document.body.children) {
      if (child === header || !(child instanceof HTMLElement)) continue;
      blocked.set(child, child.inert);
      child.inert = true;
    }
  };
  const unlockPage = () => {
    if (lockedScroll === null) return;
    const y = lockedScroll;
    savedBodyStyles.forEach(([key,value]) => { document.body.style[key] = value; });
    document.documentElement.classList.remove('shared-menu-open');
    blocked.forEach((inert,element) => { element.inert = inert; });
    blocked.clear();
    lockedScroll = null;
    window.scrollTo({top:y,behavior:'instant'});
  };
  const syncDrawer = () => {
    drawer.inert = mobile.matches && !header.hasAttribute('data-menu-open');
    if (mobile.matches) {
      drawer.setAttribute('role','dialog');
      drawer.setAttribute('aria-modal','true');
      drawer.setAttribute('aria-labelledby','shared-menu-title');
    } else {
      drawer.removeAttribute('role');
      drawer.removeAttribute('aria-modal');
      drawer.removeAttribute('aria-labelledby');
    }
  };
  let closeTimer;
  const openedByHover=new WeakSet();

  const closeGroups = () => {
    clearTimeout(closeTimer);
    groups.forEach(group => { group.open = false; openedByHover.delete(group); });
  };
  const closeMenu = (restoreFocus = false) => {
    header.removeAttribute('data-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
    closeGroups();
    unlockPage();
    syncDrawer();
    if (restoreFocus) toggle.focus({preventScroll:true});
  };
  toggle.addEventListener('click', () => {
    if (header.hasAttribute('data-menu-open')) {
      closeMenu();
    } else {
      header.setAttribute('data-menu-open', '');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'メニューを閉じる');
      syncDrawer();
      lockPage();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (mobile.matches && header.hasAttribute('data-menu-open')) closeButton.focus({preventScroll:true});
      }));
    }
  });
  closeButton.addEventListener('click', () => closeMenu(true));
  backdrop.addEventListener('click', () => closeMenu(true));
  groups.forEach(group => {
    group.querySelector('summary').addEventListener('click',event=>{
      if(event.detail>0&&!mobile.matches&&hover.matches&&group.open&&openedByHover.has(group)){event.preventDefault();openedByHover.delete(group);}
    });
    group.addEventListener('pointerenter', event => {
      if (mobile.matches || !hover.matches || event.pointerType !== 'mouse') return;
      clearTimeout(closeTimer);
      if(!group.open)openedByHover.add(group);
      groups.forEach(other => { other.open = other === group; });
    });
    group.addEventListener('pointerleave', () => {
      if (mobile.matches || !hover.matches) return;
      closeTimer = setTimeout(() => {
        if (!group.contains(document.activeElement)) group.open = false;
      }, 180);
    });
    group.addEventListener('toggle', () => {
      if (group.open) groups.forEach(other => { if (other !== group) other.open = false; });
    });
    group.addEventListener('focusout', event => {
      if (!mobile.matches && !group.contains(event.relatedTarget) && !group.matches(':hover')) group.open = false;
    });
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Tab' && mobile.matches && header.hasAttribute('data-menu-open')) {
      const items = [...drawer.querySelectorAll('a[href],button,summary')].filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.key !== 'Escape') return;
    const openGroup = groups.find(group => group.open);
    if (openGroup) {
      event.preventDefault();
      openGroup.open = false;
      openGroup.querySelector('summary').focus();
    } else if (header.hasAttribute('data-menu-open')) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  header.addEventListener('focusout', event => {
    if (mobile.matches && event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
  });
  drawer.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) closeMenu(true);
  });
  mobile.addEventListener('change', () => closeMenu());
  window.addEventListener('pagehide', () => closeMenu());
  window.addEventListener('pageshow', () => closeMenu());
  syncDrawer();

  const normalizePath = value => value.replace(/index\.(?:html?|shtml?|php)$/i, '').replace(/\/+$/, '') || '/';
  const current = normalizePath(window.location.pathname);
  navigation.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;
    const route = normalizePath(url.pathname);
    if (current === route) link.setAttribute('aria-current', 'page');
    if (current === route || (route !== '/' && current.startsWith(route + '/'))) {
      (link.closest('details') || link).setAttribute('data-active', '');
    }
  });
  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = document.getElementById('main') ? 'shared-main-content' : 'main';
    header.querySelector('.shared-header__skip').setAttribute('href', '#' + main.id);
  }
  toggle.hidden = false;
  header.setAttribute('data-enhanced', '');
  document.documentElement.classList.add('has-shared-header');
})();
(() => {
  'use strict';
  const footer = document.querySelector('.shared-footer');
  if (!footer || footer.hasAttribute('data-enhanced')) return;
  const normalizePath = value => value.replace(/index\.(?:html?|shtml?|php)$/i, '').replace(/\/+$/, '') || '/';
  const current = normalizePath(window.location.pathname);
  footer.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.origin === window.location.origin && normalizePath(url.pathname) === current) {
      link.setAttribute('aria-current', 'page');
    }
  });
  footer.setAttribute('data-enhanced', '');
})();
