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
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    if (header.hasAttribute('data-menu-open')) {
      closeMenu();
    } else {
      header.setAttribute('data-menu-open', '');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'メニューを閉じる');
    }
  });
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
  navigation.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) closeMenu(true);
  });
  mobile.addEventListener('change', () => closeMenu());

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
