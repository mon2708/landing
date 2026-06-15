// Neobrutalism micro-interactions
// Tambah "sticker" tilt effect pada logo-box saat hover
const logoBox = document.getElementById('logo-box');
if (logoBox) {
  logoBox.addEventListener('mousemove', (e) => {
    const rect = logoBox.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    logoBox.style.transform = `rotate(${dx * 6}deg) translateY(-2px)`;
  });
  logoBox.addEventListener('mouseleave', () => {
    logoBox.style.transform = '';
  });
}

// Ripple effect pada tombol
document.querySelectorAll('.nb-btn').forEach((btn) => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,0.3);
      border-radius:50%;
      transform:scale(0);
      animation:ripple .4s linear;
      pointer-events:none;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 450);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `@keyframes ripple{to{transform:scale(3);opacity:0}}`;
document.head.appendChild(style);

// ============================================
//  EMAIL — copy to clipboard sebagai fallback
//  (mailto: perlu email client, kalau tidak ada
//   email otomatis disalin ke clipboard)
// ============================================
function showToast(msg) {
  // Hapus toast lama jika ada
  const old = document.getElementById('nb-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'nb-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #111;
    color: #FFE135;
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.65rem 1.25rem;
    border: 2.5px solid #111;
    border-radius: 4px;
    box-shadow: 4px 4px 0 #FFE135;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 9999;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);

  // Animasi masuk
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  // Animasi keluar
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

const emailBtn = document.getElementById('btn-email');
if (emailBtn) {
  emailBtn.addEventListener('click', (e) => {
    const email = emailBtn.href.replace('mailto:', '');

    // Coba copy ke clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email)
        .then(() => showToast('✓ Email disalin ke clipboard!'))
        .catch(() => showToast('Buka: ' + email));
    } else {
      // Fallback untuk browser lama
      const tmp = document.createElement('input');
      tmp.value = email;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
      showToast('✓ Email disalin ke clipboard!');
    }
    // mailto: tetap berjalan normal jika ada email client
  });
}

// ============================================
//  MUSIC PLAYER (YouTube iframe minimal)
//  Setup hanya dari kode: edit `YT_DEFAULT_ID` di bawah.
// ============================================
const musicToggle = document.getElementById('music-toggle');
const ytPlayerContainer = document.getElementById('yt-player');

// Set default YouTube video ID here (ganti dengan ID video Anda)
const YT_DEFAULT_ID = 'BTZMUDKSpSs';
// Nama pemilik/owner situs — jika owner memberi like, tampilkan hati
const OWNER_NAME = 'remon';
// Easter egg image path (ubah path jika ingin pakai file lain)
const EASTER_EGG_IMG = 'custom-ava.png';
let player = null;
let isMusicPlaying = false;
const YT_LOCAL_KEY = 'yt_music_id';

function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
  const m = urlOrId.match(/[?&]v=([A-Za-z0-9_-]{11})/) || urlOrId.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) || urlOrId.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function createYouTubePlayer(videoId) {
  if (!videoId) return;
  if (player && player.loadVideoById) {
    player.loadVideoById(videoId);
    return;
  }
  ytPlayerContainer.innerHTML = '<div id="yt-player-inner"></div>';
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player('yt-player-inner', {
        height: '0', width: '0', videoId: videoId,
        playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3 },
        events: {
          onReady: function () { attemptAutoplayYT(); bindFirstGestureUnmute(); },
          onStateChange: function (e) { if (e.data === 1) { isMusicPlaying = true; updateMusicUI(); } else if (e.data === 2 || e.data === 0) { isMusicPlaying = false; updateMusicUI(); } }
        }
      });
    };
  } else {
    player = new YT.Player('yt-player-inner', {
      height: '0', width: '0', videoId: videoId,
      playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3 },
      events: {
        onReady: function () { attemptAutoplayYT(); bindFirstGestureUnmute(); },
        onStateChange: function (e) { if (e.data === 1) { isMusicPlaying = true; updateMusicUI(); } else if (e.data === 2 || e.data === 0) { isMusicPlaying = false; updateMusicUI(); } }
      }
    });
  }
}

// Saat interaksi pertama dari user, unmute dan play (menghindari kebutuhan klik dua kali)
function bindFirstGestureUnmute() {
  function onFirstGesture() {
    if (!player) return;
    try {
      if (player.isMuted && player.isMuted()) {
        player.unMute && player.unMute();
      } else {
        // ensure unmuted
        player.unMute && player.unMute();
      }
      player.setVolume && player.setVolume(100);
      player.playVideo && player.playVideo();
    } catch (e) {
      // ignore errors
    }
  }
  // Use pointerdown/click as a user gesture; one-time listener
  window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
}

function playMusic() {
  if (!player || !player.playVideo) return;
  try {
    // Pastikan unmuted dan volume naik sebelum play
    try { player.unMute && player.unMute(); } catch (e) { /* ignore */ }
    try { player.setVolume && player.setVolume(100); } catch (e) { /* ignore */ }
    player.playVideo();
    isMusicPlaying = true;
    updateMusicUI();
  } catch (e) {
    console.warn('playVideo error', e);
  }
}

function pauseMusic() {
  if (!player || !player.pauseVideo) return;
  try {
    player.pauseVideo();
    isMusicPlaying = false;
    updateMusicUI();
  } catch (e) {
    console.warn('pauseVideo error', e);
  }
}

function updateMusicUI() {
  if (!musicToggle) return;
  if (isMusicPlaying) {
    musicToggle.classList.remove('paused');
    musicToggle.querySelector('.music-icon').textContent = '⏸';
    musicToggle.querySelector('.music-text').textContent = 'PLAYING';
  } else {
    musicToggle.classList.add('paused');
    musicToggle.querySelector('.music-icon').textContent = '▶';
    musicToggle.querySelector('.music-text').textContent = 'MUSIC PAUSED';
  }
}

if (musicToggle) {
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!player) {
      const stored = localStorage.getItem(YT_LOCAL_KEY);
      const vid = extractYouTubeId(stored) || extractYouTubeId(YT_DEFAULT_ID);
      if (vid) createYouTubePlayer(vid);
      else return showToast('Set YouTube ID di kode (YT_DEFAULT_ID)');
    }
    if (isMusicPlaying) pauseMusic(); else playMusic();
  });
}

// Jika sudah ada setelan di localStorage atau di kode, buat player saat load (tidak autoplay)
window.addEventListener('load', () => {
  const stored = localStorage.getItem(YT_LOCAL_KEY);
  const id = extractYouTubeId(stored) || extractYouTubeId(YT_DEFAULT_ID);
  if (id) createYouTubePlayer(id);
});

// ============================================
//  GUESTBOOK (Buku Tamu) - Supabase Cloud DB
// ============================================
const gbForm = document.getElementById('guestbook-form');
const gbMessages = document.getElementById('gb-messages');

// Ganti URL dan API Key dengan milik Anda dari dashboard Supabase
const SUPABASE_URL = 'https://oikvbvepywlvibkfzorb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pa3ZidmVweXdsdmlia2Z6b3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDAxMzksImV4cCI6MjA5NzExNjEzOX0.QSduuIX5_Wjj4-E2lT9RLwiXXuTvI8Ms6x0AraGBvo0';

let supabaseClient = null;
let useSupabase = false;

// Periksa apakah kredensial default sudah diganti
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    useSupabase = true;
  } catch (e) {
    console.warn('Gagal menginisialisasi Supabase. Menggunakan mode lokal (LocalStorage).', e);
  }
}

// Data lokal default untuk fallback (setiap pesan memiliki `id` dan array `replies`)
let localMessages = JSON.parse(localStorage.getItem('gb_messages')) || [
  { id: String(Date.now()), name: "ArvenIV", text: "Selamat datang! Silakan hubungkan database Supabase kamu agar semua pengunjung bisa melihat pesan satu sama lain.", date: "Baru saja", replies: [] }
];

// (Removed legacy audio/file-upload code; music now uses YouTube iframe only)

// AUTOPLAY helper: coba mainkan video; jika diblokir, fallback ke muted autoplay
function attemptAutoplayYT() {
  if (!player) return;
  try {
    // coba play normal
    player.unMute && player.unMute();
    player.playVideo && player.playVideo();
    // jika tidak berubah ke playing dalam 700ms, coba mute+play
    setTimeout(() => {
      if (!isMusicPlaying) {
        try { player.mute && player.mute(); player.playVideo && player.playVideo(); } catch (e) { /* ignore */ }
      }
    }, 700);
  } catch (e) {
    try { player.mute && player.mute(); player.playVideo && player.playVideo(); } catch (er) { /* ignore */ }
  }
}

// (removed helper for message search)

function escapeHTML(str) {
  return String(str || '').replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Format waktu dari Supabase atau objek lokal
function formatTime(dateStr) {
  if (!dateStr || dateStr === "Baru saja" || dateStr === "Sistem") return dateStr;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr;
  }
}

// EASTER EGG: show creeper GIF overlay once per short interval
let _eeLocked = false;
let _eeLoaded = false;
let _eeImage = null;
// Preload GIF to reduce buffering
function preloadEasterGif() {
  try {
    _eeImage = new Image();
    _eeImage.src = EASTER_EGG_IMG;
    _eeImage.onload = () => { _eeLoaded = true; };
    _eeImage.onerror = () => { _eeLoaded = false; };
  } catch (e) { _eeLoaded = false; }
}
preloadEasterGif();

function showCreeperEasterEgg() {
  if (_eeLocked) return;
  _eeLocked = true;
  const overlay = document.createElement('div');
  overlay.className = 'ee-overlay';

  // spinner shown until image is ready
  const spinner = document.createElement('div');
  spinner.className = 'ee-spinner';
  overlay.appendChild(spinner);
  document.body.appendChild(overlay);

  // ensure CSS initial state applied
  requestAnimationFrame(() => {
    // If image already loaded, swap spinner immediately and animate
    if (_eeLoaded && _eeImage && _eeImage.complete) {
      spinner.remove();
      const img = document.createElement('img');
      img.className = 'ee-img';
      img.src = _eeImage.src;
      img.alt = 'Creeper!';
      overlay.appendChild(img);
      // allow render then start animation by adding .show
      requestAnimationFrame(() => overlay.classList.add('show'));
      // cleanup after duration: remove .show to trigger fade-out, then remove element
      setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => { try { overlay.remove(); } catch(e){} _eeLocked = false; }, 300);
      }, 1300);
    } else {
      // wait for load or timeout
      let settled = false;
      const onLoad = () => {
        if (settled) return; settled = true;
        spinner.remove();
        const img = document.createElement('img');
        img.className = 'ee-img';
        img.src = EASTER_EGG_IMG;
        img.alt = 'Surprise!';
        overlay.appendChild(img);
        requestAnimationFrame(() => overlay.classList.add('show'));
        setTimeout(() => {
          overlay.classList.remove('show');
          setTimeout(() => { try { overlay.remove(); } catch(e){} _eeLocked = false; }, 300);
        }, 1300);
      };
      const onTimeout = () => {
        if (settled) return; settled = true;
        // fallback: play without image
        overlay.classList.add('show');
        setTimeout(() => {
          overlay.classList.remove('show');
          setTimeout(() => { try { overlay.remove(); } catch(e){} _eeLocked = false; }, 300);
        }, 600);
      };
      if (!_eeImage) preloadEasterGif();
      if (_eeImage) {
        _eeImage.onload = onLoad;
        _eeImage.onerror = onLoad; // treat error as loaded to avoid stuck spinner
      }
      setTimeout(onTimeout, 1200);
    }
  });
}

// Click on logo triggers easter egg
if (logoBox) {
  logoBox.addEventListener('click', () => showCreeperEasterEgg());
}

// Render isi pesan ke HTML
// Build threaded message tree from flat list (supports 'reply_to')
function buildThread(flatList) {
  const map = {};
  const roots = [];

  flatList.forEach(m => {
    const msg = Object.assign({}, m);
    msg.id = String(msg.id || msg._local_id || msg._id || msg._uid || Date.now() + Math.random());
    msg.replies = msg.replies || [];
    map[msg.id] = msg;
  });

  Object.values(map).forEach(msg => {
    const parentId = msg.reply_to || msg.parentId || null;
    if (parentId && map[parentId]) {
      map[parentId].replies = map[parentId].replies || [];
      map[parentId].replies.push(msg);
    } else {
      roots.push(msg);
    }
  });

  // Sort by date descending for roots and replies
  const sortFn = (a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0);
  roots.sort(sortFn);
  Object.values(map).forEach(m => { if (m.replies) m.replies.sort(sortFn); });

  return roots;
}

// Render threaded messages recursively
function renderThread(list, container) {
  container.innerHTML = '';
  list.forEach(msg => {
    const item = document.createElement('div');
    item.className = 'gb-msg-item';

    const colors = ['#FEFCF8', '#FFF176', '#A7FFEB', '#E1BEE7', '#FF8A80', '#CCFF90'];
    const hash = String(msg.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    item.style.backgroundColor = colors[Math.abs(hash) % colors.length];

    const displayDate = formatTime(msg.date || msg.created_at || msg.createdAt);

    item.innerHTML = `
      <div class="gb-msg-meta">
        <span>👤 ${escapeHTML(msg.name)}</span>
        <span>${displayDate}</span>
      </div>
      <p class="gb-msg-text">${escapeHTML(msg.text || msg.message)}</p>
      <div class="gb-replies" data-parent="${escapeHTML(msg.id)}" style="margin-top:0.6rem; margin-left:0.6rem;"></div>
    `;

    container.appendChild(item);

    // Render replies recursively under reply container
    const replyContainer = item.querySelector('.gb-replies');
    if (msg.replies && msg.replies.length) {
      renderThread(msg.replies, replyContainer);
    }
  });
}

// Main entry: render messages (flatList may be from Supabase or local)
function renderMessages(flatList) {
  if (!gbMessages) return;
  const tree = buildThread(flatList.slice());
  renderThread(tree, gbMessages);
}

// Ambil data dari database online / lokal
async function loadMessages() {
  if (useSupabase && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      // Supabase returns flat list; renderMessages akan membangun thread
      renderMessages(data || []);
      // Jika ditemukan pesan dari owner, tampilkan easter egg
      try {
        if (Array.isArray(data) && data.some(m => (m.name||'').toLowerCase() === OWNER_NAME.toLowerCase())) {
          showCreeperEasterEgg();
        }
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Gagal mengambil data dari Supabase:', err);
      // Fallback ke lokal
      renderMessages(localMessages.slice());
      try {
        if (localMessages && localMessages.some(m => (m.name||'').toLowerCase() === OWNER_NAME.toLowerCase())) {
          showCreeperEasterEgg();
        }
      } catch (e) { /* ignore */ }
    }
  } else {
    // Mode lokal
    renderMessages(localMessages.slice());
  }
}

// Kirim pesan baru ke database online / lokal
async function sendMessage(name, text) {
  if (useSupabase && supabaseClient) {
    try {
      const payload = { name: name, message: text };
      const { error } = await supabaseClient
        .from('guestbook')
        .insert([payload]);

      if (error) throw error;
      showToast('✓ Pesan berhasil dikirim!');
      loadMessages();
    } catch (err) {
      console.error('Gagal mengirim ke Supabase:', err);
      showToast('❌ Gagal mengirim, dicoba lagi nanti.');
    }
  } else {
    // Mode lokal: simpan sebagai pesan root
    const newMsg = {
      id: String(Date.now()) + Math.random(),
      name: name,
      text: text,
      date: new Date().toISOString(),
      replies: []
    };
    localMessages.push(newMsg);
    localStorage.setItem('gb_messages', JSON.stringify(localMessages));
    showToast('✓ Pesan disimpan di browser lokal!');
    loadMessages();
  }
}

if (gbForm) {
  gbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('gb-name');
    const messageInput = document.getElementById('gb-message');

    const name = nameInput.value.trim();
    const text = messageInput.value.trim();

    if (!name || !text) return;

    sendMessage(name, text);

    // Reset input
    nameInput.value = '';
    messageInput.value = '';
  });
}

// Ambil pesan saat pertama kali halaman dimuat
loadMessages();
