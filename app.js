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
