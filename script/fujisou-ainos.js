/* ===== PAGE INITIALIZATION, NAVIGATION, REVEALS AND NEWS ===== */
document.documentElement.classList.add('js');
const heroSlider = document.querySelector('[data-hero-slider]');

if (heroSlider) {
  const heroSlides = [...heroSlider.querySelectorAll('.hero__slide')];
  const heroDots = [...heroSlider.querySelectorAll('[data-hero-dot]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeSlide = 0;
  let heroTimer;

  const showHeroSlide = (index) => {
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle('is-active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const startHeroSlider = () => {
    clearInterval(heroTimer);
    if (!reduceMotion.matches) {
      heroTimer = setInterval(() => showHeroSlide(activeSlide + 1), 3700);
    }
  };

  heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showHeroSlide(Number(dot.dataset.heroDot));
      startHeroSlider();
    });
  });
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(heroTimer) : startHeroSlider());
  if ('addEventListener' in reduceMotion) {
    reduceMotion.addEventListener('change', startHeroSlider);
  } else {
    reduceMotion.addListener(startHeroSlider);
  }
  startHeroSlider();
}

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

/* ===== CONTACT AND CONSULTATION FORMS ===== */
function enhanceForms(scope = document) {
  scope.querySelectorAll('form[data-enhanced-form]').forEach((form) => {
    form.addEventListener('submit', () => {
      form.querySelectorAll('button[type="submit"]').forEach((button) => {
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
      });
    });
  });
}


/* ===== HOMEPAGE INTERACTIONS (MOVED FROM INDEX.HTML) ===== */
document.documentElement.classList.add('js')

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
