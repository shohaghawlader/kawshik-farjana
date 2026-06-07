const WEDDING_DATE = new Date('2026-05-16T13:30:00+06:00');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function pad(value) {
  return String(value).padStart(2, '0');
}

function updateTogetherCounter() {
  const now = new Date();
  let diff = Math.max(0, now.getTime() - WEDDING_DATE.getTime());
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000); diff %= 60000;
  const seconds = Math.floor(diff / 1000);

  $('#days').textContent = pad(days);
  $('#hours').textContent = pad(hours);
  $('#minutes').textContent = pad(minutes);
  $('#seconds').textContent = pad(seconds);
}
updateTogetherCounter();
setInterval(updateTogetherCounter, 1000);

const cursorGlow = $('.cursor-glow');
if (cursorGlow) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });
$$('.reveal').forEach((item) => observer.observe(item));

$$('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (window.innerWidth < 980) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -4.5}deg) rotateY(${x * 4.5}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

const toast = $('#toast');
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

$$('[data-copy-link]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Website link copied');
    } catch (error) {
      showToast('Copy failed — copy from browser bar');
    }
  });
});

const lightbox = $('#lightbox');
const lightboxImage = $('#lightboxImage');
function openLightbox(source) {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = source;
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}
$$('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => openLightbox(button.dataset.lightbox));
});
$('#lightboxClose')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

const tasks = [
  'Bride gets unlimited compliments today.',
  'Groom must say: “Yes, you are always right.”',
  'Movie night unlocked for both of them.',
  'One royal blue selfie must be taken today.',
  'Tea or coffee date is officially approved.',
  'Cute argument limit: only two minutes today.',
  'Both must smile and say Alhamdulillah.',
  'Groom gets permission to be dramatic for 5 minutes.',
  'Bride gets VIP treatment for the whole day.'
];
let spinDegree = 0;
$('#spinBtn')?.addEventListener('click', () => {
  const wheel = $('#wheel');
  const result = $('#spinResult');
  if (!wheel || !result) return;
  const randomSpin = 1080 + Math.floor(Math.random() * 720);
  spinDegree += randomSpin;
  wheel.style.transform = `rotate(${spinDegree}deg)`;
  result.textContent = 'Spinning... wait for the cute result.';
  setTimeout(() => {
    result.textContent = tasks[Math.floor(Math.random() * tasks.length)];
    showToast('Love task unlocked');
  }, 1450);
});

$('#blurMessage')?.addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('revealed');
});

function initScratchCard() {
  const canvas = $('#scratchCanvas');
  const surface = $('.scratch-surface');
  if (!canvas || !surface) return;
  const ctx = canvas.getContext('2d');
  let isDrawing = false;

  function drawCover() {
    const rect = surface.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const width = rect.width;
    const height = rect.height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#063d9b');
    gradient.addColorStop(0.35, '#c89b3d');
    gradient.addColorStop(0.65, '#ff7aa7');
    gradient.addColorStop(1, '#087a60');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 250, 241, .92)';
    ctx.font = '900 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scratch to reveal', width / 2, height / 2 - 14);
    ctx.font = '700 13px Inter, sans-serif';
    ctx.fillText('a dua for the couple', width / 2, height / 2 + 20);

    ctx.fillStyle = 'rgba(255,255,255,.22)';
    for (let i = 0; i < 55; i += 1) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.2 + .6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function scratch(event) {
    if (!isDrawing) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(20, rect.width * 0.055), 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener('pointerdown', (event) => {
    isDrawing = true;
    canvas.setPointerCapture?.(event.pointerId);
    scratch(event);
  });
  canvas.addEventListener('pointermove', scratch);
  canvas.addEventListener('pointerup', () => { isDrawing = false; });
  canvas.addEventListener('pointercancel', () => { isDrawing = false; });
  window.addEventListener('resize', drawCover);
  $('#resetScratch')?.addEventListener('click', () => {
    drawCover();
    showToast('Scratch card reset');
  });
  drawCover();
}
window.addEventListener('load', initScratchCard);

$('#letterBtn')?.addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('open');
  $('#letterText')?.classList.toggle('show');
});

const compliments = [
  'Allahumma barik — such a beautiful pair.',
  'Royal blue, soft smiles, perfect match.',
  'Their chemistry looks cinematic and peaceful.',
  'Made for each other, framed for forever.',
  'Every photo looks like a movie poster.',
  'Soft love, premium vibe, royal couple energy.',
  'A beautiful beginning with a calm, classy glow.'
];
$('#complimentBtn')?.addEventListener('click', () => {
  const target = $('#complimentText');
  if (!target) return;
  target.textContent = compliments[Math.floor(Math.random() * compliments.length)];
});

$('#meterBtn')?.addEventListener('click', () => {
  const fill = $('#meterFill');
  const score = $('#meterScore');
  if (!fill || !score) return;
  const value = 96 + Math.floor(Math.random() * 5);
  fill.style.width = `${value}%`;
  score.textContent = `${value}% match — too much cuteness detected.`;
});

$('#weddingVideo')?.addEventListener('play', () => {
  showToast('Wedding film playing');
}, { once: true });

let lastHeartTime = 0;
document.addEventListener('click', (event) => {
  if (event.target.closest('button,a,video,.lightbox')) return;
  const now = Date.now();
  if (now - lastHeartTime < 220) return;
  lastHeartTime = now;
  const heart = document.createElement('span');
  heart.className = 'float-heart';
  heart.textContent = ['❤', '💕', '✨', '🌸', '💙'][Math.floor(Math.random() * 5)];
  heart.style.left = `${event.clientX - 10}px`;
  heart.style.top = `${event.clientY - 10}px`;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1400);
});
