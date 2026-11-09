(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const LAT = 51.0838357, LNG = -115.3401862;
  // Gallery order: exterior, living, kitchen, fireplace, bedroom, then the rest.
  const photos = [
    ['01', 'Whiskey Jack building exterior'],
    ['02', 'Open living area and kitchen island'],
    ['03', 'Kitchen'],
    ['09', 'Living room with electric fireplace'],
    ['11', 'Bedroom'],
    ['04', 'Living area'],
    ['05', 'Living room'],
    ['06', 'Bedroom'],
    ['07', 'Closet and hallway'],
    ['08', 'Bedroom closet'],
    ['10', 'Kitchen island and living room'],
    ['12', 'Bedroom'],
    ['13', 'Bedroom'],
    ['14', 'Bathroom'],
  ].map(([n, alt]) => ({ src: `img/${n}.jpg`, alt }));

  // gallery
  const gallery = $('#gallery');
  photos.slice(0, 5).forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    const more = i === 4 && photos.length > 5;
    b.setAttribute('aria-label', more ? `View all ${photos.length} photos` : `Open photo: ${p.alt}`);
    b.innerHTML = `<img src="${p.src}" alt="" ${i ? 'loading="lazy"' : ''}>` +
      (more ? `<span class="more"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>All ${photos.length} photos</span>` : '');
    b.addEventListener('click', () => openLB(i));
    gallery.append(b);
  });

  // lightbox
  const lb = $('#lightbox');
  let idx = 0;
  photos.forEach((p, k) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.setAttribute('aria-label', `Photo ${k + 1}: ${p.alt}`);
    t.innerHTML = `<img src="${p.src}" alt="" loading="lazy">`;
    t.addEventListener('click', () => show(k));
    $('#lbStrip').append(t);
  });
  function openLB(i) { show(i); lb.showModal(); }
  function show(i) {
    idx = (i + photos.length) % photos.length;
    $('#lbImg').src = photos[idx].src;
    $('#lbImg').alt = photos[idx].alt;
    $('#lbCount').textContent = `Photo ${idx + 1} of ${photos.length}`;
    $$('#lbStrip button').forEach((b, k) => {
      b.setAttribute('aria-current', k === idx ? 'true' : 'false');
      if (k === idx && lb.open) b.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
  }
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb__stage')) lb.close(); });

  // embeds (Google's keyless embed URLs)
  const ll = `${LAT},${LNG}`;
  const srcs = {
    map: `https://maps.google.com/maps?q=${ll}&z=15&output=embed`,
    streetview: `https://maps.google.com/maps?layer=c&cbll=${ll}&cbp=11,0,0,0,0&output=svembed`,
  };

  // tabs
  const tabs = () => $$('.tabs [role="tab"]');
  const tabBar = $('.tabs');
  const ind = $('.tabs__ind');
  function moveIndicator() {
    const t = $('.tabs [aria-selected="true"]');
    if (!t) return;
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = `translateX(${t.offsetLeft}px)`;
    ind.style.top = t.offsetTop + 'px';
    ind.style.height = t.offsetHeight + 'px';
  }
  function selectTab(name, focus) {
    tabs().forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = $('#panel-' + t.dataset.tab);
      panel.classList.toggle('is-active', on);
      panel.inert = !on;
      if (on && focus) t.focus();
    });
    moveIndicator();
    const fr = $(`#panel-${name} iframe[data-src]`);
    if (fr && !fr.getAttribute('src')) fr.src = srcs[fr.dataset.src];
  }
  // place the pill without animating, then enable the slide
  ind.style.transition = 'none';
  moveIndicator();
  tabBar.classList.add('is-ready');
  requestAnimationFrame(() => requestAnimationFrame(() => { ind.style.transition = ''; }));
  window.addEventListener('resize', moveIndicator);
  if (document.fonts) document.fonts.ready.then(moveIndicator);
  tabs().forEach((t) => {
    t.addEventListener('click', () => selectTab(t.dataset.tab));
    t.addEventListener('keydown', (e) => {
      const list = tabs(); const i = list.indexOf(t);
      if (e.key === 'ArrowRight') selectTab(list[(i + 1) % list.length].dataset.tab, true);
      if (e.key === 'ArrowLeft') selectTab(list[(i - 1 + list.length) % list.length].dataset.tab, true);
    });
  });
})();
