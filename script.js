// =====================================================================
// PRELOADER
// =====================================================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 500);
    }
});

// =====================================================================
// CUSTOM CURSOR (glow dot + ring, mengikuti mouse dengan efek lag)
// =====================================================================
(function setupCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        if (!hasMoved) {
            ringX = mouseX;
            ringY = mouseY;
            hasMoved = true;
        }
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));

    const hoverTargets = 'a, button, .menu-item, .story-card, .contact-card, input, textarea, .delivery-btn';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) ring.classList.remove('hovering');
    });
})();

// =====================================================================
// NAVBAR: shrink-on-scroll + active link tracking
// =====================================================================
(function setupNavbarBehavior() {
    const nav = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section.section, header.section');
    if (!nav) return;

    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 60);

        let currentId = sections[0] ? sections[0].id : '';
        sections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= 140 && rect.bottom >= 140) {
                currentId = sec.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle('active-link', link.getAttribute('href') === `#${currentId}`);
        });
    }

    window.addEventListener('scroll', onScroll);
    onScroll();
})();

// =====================================================================
// FLOATING WHATSAPP BUTTON (muncul setelah scroll sedikit)
// =====================================================================
(function setupFloatingWA() {
    const fab = document.getElementById('floating-wa');
    if (!fab) return;
    window.addEventListener('scroll', () => {
        fab.classList.toggle('visible', window.scrollY > 300);
    });
})();

// =====================================================================
// 3D TILT EFFECT pada kartu (menu, story, contact)
// =====================================================================
(function setupTiltCards() {
    const tiltSelectors = '.menu-item, .story-card, .contact-card';
    const cards = document.querySelectorAll(tiltSelectors);

    cards.forEach((card) => {
        let rafId = null;

        card.addEventListener('mousemove', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;
                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.style.transform = '';
        });
    });
})();

// =====================================================================
// COUNT-UP ANIMATION untuk angka spesifikasi
// =====================================================================
(function setupCountUp() {
    const specValues = document.querySelectorAll('.spec-value');
    if (!specValues.length) return;

    function animateCount(el) {
        const raw = el.textContent.trim();
        const match = raw.match(/(\d+)/);

        if (!match) {
            // Bukan angka (contoh: teks Arab) -> cukup fade in
            el.classList.add('counted');
            return;
        }

        const targetNum = parseInt(match[1], 10);
        const prefix = raw.slice(0, match.index);
        const suffix = raw.slice(match.index + match[1].length);
        const duration = 900;
        const startTime = performance.now();

        el.classList.add('counted');

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(targetNum * eased);
            el.textContent = `${prefix}${current}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = raw;
            }
        }
        requestAnimationFrame(step);
    }

    const countObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    specValues.forEach((el) => countObserver.observe(el));
})();

// =====================================================================
// MAGNETIC BUTTON EFFECT + RIPPLE CLICK
// =====================================================================
(function setupMagneticButtons() {
    const magneticSelectors = '.btn-card-order, .btn-checkout, .btn-chat, .btn-qty';
    const buttons = document.querySelectorAll(magneticSelectors);

    buttons.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // Ripple effect saat klik tombol
    const rippleSelectors = '.btn-card-order, .btn-checkout, .btn-chat, .btn-cancel';
    document.querySelectorAll(rippleSelectors).forEach((btn) => {
        btn.addEventListener('click', function (e) {
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        });
    });
})();

// =====================================================================
// CONFETTI BURST saat pesanan dikirim ke WhatsApp
// =====================================================================
function fireConfetti(originEl) {
    const colors = ['#ffb703', '#ffffff', '#ff9500'];
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 26; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.left = `${originX}px`;
        piece.style.top = `${originY}px`;
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(piece);

        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 140;
        const destX = Math.cos(angle) * distance;
        const destY = Math.sin(angle) * distance - 40;
        const rotation = Math.random() * 720 - 360;
        const duration = 700 + Math.random() * 500;

        const anim = piece.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) rotate(${rotation}deg)`, opacity: 0 }
        ], {
            duration,
            easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
        });

        anim.onfinish = () => piece.remove();
    }
}

// Mengatur Scroll Progress Bar di bagian atas
window.addEventListener('scroll', () => {
    const scrollPx = document.documentElement.scrollTop;
    const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = `${scrollPx / winHeightPx * 100}%`;

    document.getElementById("scroll-progress").style.width = scrolled;
});

// Intersection Observer otomatis mendeteksi elemen ".hidden" di semua section
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // Memastikan video pada section kontak terputar saat masuk ke area viewport
            const videoInEntry = entry.target.querySelector('video');
            if (videoInEntry && videoInEntry.paused) {
                videoInEntry.play().catch(() => {});
            }
        } else {
            entry.target.classList.remove('show');
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

// =====================================================================
// ORDER BUILDER & WHATSAPP INTEGRATION
// =====================================================================
const WA_NUMBER = "6282299844952"; // Nomor WhatsApp toko

let currentItem = {
    name: '',
    price: 0,
    qty: 1
};

let currentDisplayedTotal = 0;
let priceAnimFrameId = null;

const orderSection   = document.getElementById('order-builder');
const orderWrapper   = orderSection.querySelector('.order-builder-wrapper');
const orderGrid      = orderSection.querySelector('.order-builder-grid');
const obImg          = document.getElementById('ob-img');
const obTitle        = document.getElementById('ob-title');
const obDesc         = document.getElementById('ob-desc');
const obQty          = document.getElementById('ob-qty');
const obTotal        = document.getElementById('ob-total');
const totalBox       = document.querySelector('.total-box');
const obCheckoutWA   = document.getElementById('ob-checkout-wa');
const obMinusBtn     = document.getElementById('ob-minus');
const obPlusBtn      = document.getElementById('ob-plus');
const obCancelBtn    = document.getElementById('ob-cancel');
const allMenuItems   = document.querySelectorAll('.menu-item');

const deliveryRadios = document.querySelectorAll('input[name="deliveryMethod"]');
const addressContainer = document.getElementById('address-container');
const obAddress = document.getElementById('ob-address');

function formatRupiah(number) {
    return 'Rp ' + Math.round(number).toLocaleString('id-ID');
}

function animatePriceValue(start, end, duration = 450) {
    if (priceAnimFrameId) {
        cancelAnimationFrame(priceAnimFrameId);
    }

    const startTime = performance.now();

    obTotal.classList.remove('price-animate');
    if (totalBox) totalBox.classList.remove('price-updating');
    
    void obTotal.offsetWidth;
    
    obTotal.classList.add('price-animate');
    if (totalBox) totalBox.classList.add('price-updating');

    function updateFrame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + (end - start) * easeOut;

        obTotal.textContent = formatRupiah(currentValue);

        if (progress < 1) {
            priceAnimFrameId = requestAnimationFrame(updateFrame);
        } else {
            obTotal.textContent = formatRupiah(end);
            currentDisplayedTotal = end;
            setTimeout(() => {
                if (totalBox) totalBox.classList.remove('price-updating');
            }, 150);
        }
    }

    priceAnimFrameId = requestAnimationFrame(updateFrame);
}

function openOrderBuilder(buttonEl, name, price, desc, img) {
    const wasAlreadyOpen = orderWrapper.classList.contains('open');

    currentItem = { name, price, qty: 1 };

    obImg.src = img;
    obImg.alt = name;
    obTitle.textContent = name.toUpperCase();
    obDesc.textContent = desc;
    obQty.textContent = currentItem.qty;

    document.querySelector('input[value="pickup"]').checked = true;
    addressContainer.style.display = 'none';
    obAddress.value = '';

    currentDisplayedTotal = 0;
    updateOrderSummary(true);
    highlightActiveMenuItem(buttonEl);

    orderSection.setAttribute('aria-hidden', 'false');
    orderWrapper.classList.add('open');

    if (wasAlreadyOpen) {
        orderGrid.classList.remove('pulse');
        void orderGrid.offsetWidth; 
        orderGrid.classList.add('pulse');
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function closeOrderBuilder() {
    orderWrapper.classList.remove('open');
    orderSection.setAttribute('aria-hidden', 'true');
    allMenuItems.forEach((item) => item.classList.remove('active-item'));
}

function changeQty(delta) {
    const newQty = currentItem.qty + delta;
    if (newQty < 1) return; 

    currentItem.qty = newQty;
    obQty.textContent = currentItem.qty;

    obQty.classList.remove('qty-up', 'qty-down');
    void obQty.offsetWidth; 

    if (delta > 0) {
        obQty.classList.add('qty-up');
    } else {
        obQty.classList.add('qty-down');
    }

    updateOrderSummary(true);
}

function highlightActiveMenuItem(buttonEl) {
    allMenuItems.forEach((item) => item.classList.remove('active-item'));
    const parentCard = buttonEl.closest('.menu-item');
    if (parentCard) parentCard.classList.add('active-item');
}

deliveryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'delivery') {
            addressContainer.style.display = 'block';
        } else {
            addressContainer.style.display = 'none';
        }
        updateOrderSummary(false); 
    });
});

obAddress.addEventListener('input', () => updateOrderSummary(false));

function updateOrderSummary(triggerPriceAnimation = true) {
    const targetTotal = currentItem.price * currentItem.qty;

    if (triggerPriceAnimation && targetTotal !== currentDisplayedTotal) {
        animatePriceValue(currentDisplayedTotal, targetTotal, 450);
        currentDisplayedTotal = targetTotal;
    } else if (!triggerPriceAnimation) {
        obTotal.textContent = formatRupiah(targetTotal);
        currentDisplayedTotal = targetTotal;
    }

    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const addressValue = obAddress.value.trim();

    let deliveryText = deliveryMethod === 'pickup' ? 'Ambil Ditempat' : 'Kirim ke Alamatku';
    let addressText = (deliveryMethod === 'delivery' && addressValue) ? `\nAlamat: ${addressValue}` : '';

    const message = 
        `Halo, saya mau pesan:\n\n` +
        `Varian: ${currentItem.name}\n` +
        `Jumlah: ${currentItem.qty}\n` +
        `Pengiriman: ${deliveryText}${addressText}\n` +
        `Total: ${formatRupiah(targetTotal)}\n\n` +
        `Mohon info selanjutnya. Terima kasih!`;

    obCheckoutWA.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

obMinusBtn.addEventListener('click', () => changeQty(-1));
obPlusBtn.addEventListener('click', () => changeQty(1));
obCancelBtn.addEventListener('click', closeOrderBuilder);
obCheckoutWA.addEventListener('click', () => fireConfetti(obCheckoutWA));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && orderWrapper.classList.contains('open')) {
        closeOrderBuilder();
    }
});


// =====================================================================
// HERO & CONTACT VIDEO AUTOPLAY
// =====================================================================
const heroVideo = document.getElementById('hero-video');
const heroContent = document.querySelector('.hero-content');

if (heroVideo && heroContent) {
    const showHeroText = () => {
        setTimeout(() => {
            heroContent.classList.add('slide-in');
        }, 1500);
    };

    if (heroVideo.readyState >= 3 && !heroVideo.paused) {
        showHeroText();
    } else {
        heroVideo.addEventListener('play', showHeroText, { once: true });
    }
}
