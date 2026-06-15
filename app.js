// Neobrutalism micro-interactions
// Tambah "sticker" tilt effect pada logo-box saat hover
const logoBox = document.getElementById('logo-box');
if (logoBox) {
  logoBox.addEventListener('mousemove', (e) => {
    const rect  = logoBox.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
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
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY  - rect.top  - size/2}px;
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
//  MUSIC PLAYER
//  (Tidak otomatis play, harus di-klik)
// ============================================
const audio = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

let isMusicPlaying = false;

function playMusic() {
  if (!audio) return;
  audio.play()
    .then(() => {
      isMusicPlaying = true;
      if (musicToggle) {
        musicToggle.classList.remove('paused');
        musicToggle.querySelector('.music-icon').textContent = '⏸';
        musicToggle.querySelector('.music-text').textContent = 'PLAYING LOFI';
      }
    })
    .catch((err) => {
      console.log('Gagal memutar audio:', err);
    });
}

function pauseMusic() {
  if (!audio) return;
  audio.pause();
  isMusicPlaying = false;
  if (musicToggle) {
    musicToggle.classList.add('paused');
    musicToggle.querySelector('.music-icon').textContent = '▶';
    musicToggle.querySelector('.music-text').textContent = 'MUSIC PAUSED';
  }
}

// Kontrol manual tombol di pojok kanan bawah
if (musicToggle) {
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });
}

// ============================================
//  GUESTBOOK (Buku Tamu)
// ============================================
const gbForm = document.getElementById('guestbook-form');
const gbMessages = document.getElementById('gb-messages');

// Data default awal jika localStorage kosong
let messages = JSON.parse(localStorage.getItem('gb_messages')) || [
  { name: "ArvenIV", text: "Halo semuanya! Selamat datang di landing page baru saya. Silakan tinggalkan pesan! 🙌", date: "Baru saja" },
  { name: "Sistem", text: "Fitur buku tamu ini berjalan dengan aman menggunakan LocalStorage.", date: "Sistem" }
];

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function renderMessages() {
  if (!gbMessages) return;
  gbMessages.innerHTML = '';
  
  // Render dalam urutan terbalik (pesan terbaru berada di paling atas)
  messages.slice().reverse().forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'gb-msg-item';
    
    // Warna-warni pastel neobrutalis untuk post-it bubble secara acak berdasarkan nama
    const colors = ['#FEFCF8', '#FFF176', '#A7FFEB', '#E1BEE7', '#FF8A80', '#CCFF90'];
    const hash = msg.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = Math.abs(hash) % colors.length;
    item.style.backgroundColor = colors[colorIndex];

    item.innerHTML = `
      <div class="gb-msg-meta">
        <span>👤 ${escapeHTML(msg.name)}</span>
        <span>${msg.date}</span>
      </div>
      <p class="gb-msg-text">${escapeHTML(msg.text)}</p>
    `;
    gbMessages.appendChild(item);
  });
}

if (gbForm) {
  gbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('gb-name');
    const messageInput = document.getElementById('gb-message');

    const name = nameInput.value.trim();
    const text = messageInput.value.trim();

    if (!name || !text) return;

    const newMsg = {
      name: name,
      text: text,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages.push(newMsg);
    localStorage.setItem('gb_messages', JSON.stringify(messages));
    
    // Tampilkan ulang pesan
    renderMessages();

    // Reset input
    nameInput.value = '';
    messageInput.value = '';

    // Tampilkan toast notifikasi
    showToast('✓ Pesan berhasil dikirim!');
  });
}

// Jalankan fungsi tampil pesan pertama kali
renderMessages();
