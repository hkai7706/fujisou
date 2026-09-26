/* ===== PAGE INITIALIZATION, NAVIGATION, REVEALS AND NEWS ===== */
document.documentElement.classList.add('js');

const items = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visibleItems = entries.filter((entry) => entry.isIntersecting);
    if (!visibleItems.length) return;
    requestAnimationFrame(() => {
      visibleItems.forEach((entry) => {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px' });

  items.forEach((item) => observer.observe(item));
} else {
  items.forEach((item) => item.classList.add('is-visible'));
}

const newsTabs = document.querySelectorAll('[data-news-tab]');
const newsCards = document.querySelectorAll('[data-news-category]');
const newsMoreLink = document.querySelector('[data-news-more]');

const newsCategories = {
  blog: {
    label: 'ブログをもっと見る',
    url: 'https://www.fujisou-ainos.com/staffblog/'
  },
  event: {
    label: 'イベント情報をもっと見る',
    url: 'https://www.fujisou-ainos.com/eventinfo/'
  }
};

newsTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedCategory = tab.dataset.newsTab;

    newsTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle('is-current', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });

    newsCards.forEach((card) => {
      card.hidden = card.dataset.newsCategory !== selectedCategory;
    });

    if (newsMoreLink && newsCategories[selectedCategory]) {
      const category = newsCategories[selectedCategory];
      newsMoreLink.href = category.url;
      newsMoreLink.firstChild.textContent = `${category.label} `;
    }
  });
});

const blogFilters = document.querySelectorAll('[data-blog-filter]');
const blogCards = document.querySelectorAll('[data-blog-category]');

blogFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const selected = filter.dataset.blogFilter;
    blogFilters.forEach((button) => {
      const active = button === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    blogCards.forEach((card) => {
      card.hidden = selected !== 'all' && card.dataset.blogCategory !== selected;
    });
  });
});

/* ===== HOMEPAGE INTERACTIONS ===== */

const hybridSlider=document.querySelector('[data-hybrid-slider]');
    if(hybridSlider){
      const scenes=[...hybridSlider.querySelectorAll('.hybrid-hero__scene')];
      const dots=[...hybridSlider.querySelectorAll('[data-hybrid-dot]')];
      const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
      let activeScene=0,hybridTimer,touchStart=0;
      const showScene=(index)=>{
        activeScene=(index+scenes.length)%scenes.length;
        scenes.forEach((scene,i)=>{const active=i===activeScene;scene.classList.toggle('is-active',active);scene.setAttribute('aria-hidden',String(!active))});
        dots.forEach((dot,i)=>{const active=i===activeScene;dot.classList.toggle('is-active',active);if(active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});
      };
      const stopSlider=()=>clearTimeout(hybridTimer);
      const startSlider=()=>{
        stopSlider();
        if(!reduceMotion.matches&&!document.hidden){
          hybridTimer=setTimeout(()=>{
            showScene((activeScene+1)%scenes.length);
            startSlider();
          },3700);
        }
      };
      dots.forEach(dot=>dot.addEventListener('click',()=>{showScene(Number(dot.dataset.hybridDot));startSlider()}));
      hybridSlider.addEventListener('touchstart',event=>{touchStart=event.changedTouches[0].clientX},{passive:true});
      hybridSlider.addEventListener('touchend',event=>{const distance=event.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>50){showScene(activeScene+(distance<0?1:-1));startSlider()}},{passive:true});
      document.addEventListener('visibilitychange',()=>document.hidden?stopSlider():startSlider());
      reduceMotion.addEventListener?.('change',startSlider);
      const queueSlider=()=>window.setTimeout(startSlider,5000);
      if(document.readyState==='complete')queueSlider();
      else window.addEventListener('load',queueSlider,{once:true});
    }
    const buildingSteps=[
      ['話','まずは気軽にご相談','希望の暮らし、予算、土地の有無、不安に感じていることを伺います。','費用：無料相談'],
      ['任','家づくりの業務依頼','方向性を確認し、土地・資金・設計を具体化するパートナー契約へ進みます。','設計業務契約金：¥330,000（税込・公開前要確認）'],
      ['地','土地と資金計画','土地探し、住宅ローン、諸費用を含めた無理のない総予算を整えます。','成果：土地候補・資金計画'],
      ['設','設計と建築請負契約','間取り、仕様、性能、金額、工期を確認し、納得いただいてから契約します。','成果：最終図面・仕様書・見積書'],
      ['建','着工・上棟','自社大工を中心とした職人が、安全と品質を管理しながら施工します。','共有：工程と現場の進捗'],
      ['検','複数段階の品質検査','施工中検査、第三者検査、完了検査、自社完工検査で品質を確認します。','確認：検査記録・是正内容'],
      ['家','お引渡しとアフターサービス','設備とお手入れ方法をご案内し、入居後も点検と相談窓口で支えます。','継続：点検・保証・365日相談窓口']
    ];
    document.querySelectorAll('.step-tab').forEach((tab)=>tab.addEventListener('click',()=>{
      const item=buildingSteps[Number(tab.dataset.step)];
      document.querySelectorAll('.step-tab').forEach((button)=>button.setAttribute('aria-selected','false'));
      tab.setAttribute('aria-selected','true');
      document.querySelector('#step-mark').textContent=item[0];
      document.querySelector('#step-title').textContent=item[1];
      document.querySelector('#step-copy').textContent=item[2];
      document.querySelector('#step-note').textContent=item[3];
    }));

// Responsive landing header; native details also work without JavaScript.
{
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.header-toggle');
  const navigation = header?.querySelector('.header-nav');
  if (toggle && navigation) {
    const groups = [...navigation.querySelectorAll('.header-group')];
    const mobile = window.matchMedia('(max-width: 960px)');
    const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let dropdownCloseTimer;
    const closeGroups = () => groups.forEach(group => { group.open = false; });
    const closeMenu = (restoreFocus = false) => {
      clearTimeout(dropdownCloseTimer);
      navigation.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      closeGroups();
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      navigation.classList.toggle('is-open', opening);
      toggle.setAttribute('aria-expanded', String(opening));
      if (!opening) closeGroups();
    });
    groups.forEach(group => {
      group.addEventListener('mouseenter', () => {
        if (mobile.matches || !hoverPointer.matches) return;
        clearTimeout(dropdownCloseTimer);
        groups.forEach(other => { other.open = other === group; });
      });
      group.addEventListener('mouseleave', () => {
        if (mobile.matches || !hoverPointer.matches) return;
        dropdownCloseTimer = setTimeout(() => {
          if (!group.contains(document.activeElement)) group.open = false;
        }, 180);
      });
      group.addEventListener('toggle', () => {
        if (group.open) groups.forEach(other => { if (other !== group) other.open = false; });
      });
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) closeMenu();
    });
    header.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const openGroup = groups.find(group => group.open);
      if (openGroup) {
        openGroup.open = false;
        openGroup.querySelector('summary').focus();
      } else if (navigation.classList.contains('is-open')) closeMenu(true);
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a') && mobile.matches) closeMenu();
    });
    mobile.addEventListener('change', () => closeMenu());
  }
}
