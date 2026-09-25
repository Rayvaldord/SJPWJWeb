// ================================
// 1. NAVBAR SCROLL & HAMBURGER
// ================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => { navLinks.classList.toggle('active'); });
    navItems.forEach(item => { item.addEventListener('click', () => { navLinks.classList.remove('active'); }); });
}

// ================================
// 2. ANIMASI MUNCUL SAAT SCROLL (REVEAL)
// ================================
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); 
        }
    });
}, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });

reveals.forEach(reveal => { revealObserver.observe(reveal); });

// ================================
// ================================
// 3. COLOR BLENDING & DARK MODE TOGGLE
// ================================
const sections = document.querySelectorAll('section, footer');
let currentActiveSection = null;

// Fungsi untuk menerapkan warna latar berdasarkan tema dan section yang sedang aktif
function applyThemeColor(section) {
    if(!section) return;
    const isDark = document.body.classList.contains('dark-mode');
    const bgColorLight = section.getAttribute('data-bg-light');
    const bgColorDark = section.getAttribute('data-bg-dark');
    const bgStatic = section.getAttribute('data-bg'); // Untuk footer yang konstan
    
    if (bgStatic) {
        document.body.style.backgroundColor = bgStatic;
    } else if (isDark && bgColorDark) {
        document.body.style.backgroundColor = bgColorDark;
    } else if (!isDark && bgColorLight) {
        document.body.style.backgroundColor = bgColorLight;
    }
}

// Observer mendeteksi saat user melakukan scroll
// Observer mendeteksi saat user melakukan scroll
const colorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            currentActiveSection = entry.target;
            applyThemeColor(entry.target);
        }
    });
}, { rootMargin: "-30% 0px -30% 0px" }); // <-- INI SOLUSI BUG SCROLL-NYA

sections.forEach(section => { colorObserver.observe(section); });

// Logika Tombol Toggle Dark/Light Mode
const themeToggleBtn = document.getElementById('theme-toggle');
if(themeToggleBtn) {
    // Cek memori browser, jika user sebelumnya menggunakan dark mode
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Simpan preferensi tema
        if(document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        
        // Langsung ubah background dengan halus mengikuti section yang sedang dilihat
        applyThemeColor(currentActiveSection);
    });
}

// ================================
// 4. LIGHTBOX GALERI FOTO
// ================================
const modalLightbox = document.getElementById("lightbox-modal");
const imgLightbox = document.getElementById("lightbox-img");
const tombolClose = document.querySelector(".close-lightbox");

if (modalLightbox) {
    const fotoGaleri = document.querySelectorAll(".galeri-item img");
    fotoGaleri.forEach(foto => {
        foto.addEventListener("click", function() {
            modalLightbox.style.display = "block";
            imgLightbox.src = this.src;
        });
    });
    tombolClose.addEventListener("click", function() { modalLightbox.style.display = "none"; });
    window.addEventListener("click", function(event) { if (event.target === modalLightbox) { modalLightbox.style.display = "none"; } });
}

// ================================
// 5. INTERACTIVE HERO SLIDER 
// ================================
const heroSection = document.getElementById('beranda');
const slidesContainer = document.querySelector('.slides');

if (heroSection && slidesContainer) {
    const slideItems = slidesContainer.querySelectorAll('.slide');
    const totalSlides = slideItems.length;
    let currentSlide = 0;
    let autoSlideTimer;

    function updateSlidePosition() {
        const percentage = -(currentSlide * (100 / totalSlides));
        slidesContainer.style.transform = `translateX(${percentage}%)`;
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateSlidePosition(); }
    function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateSlidePosition(); }
    function startAutoSlide() { autoSlideTimer = setInterval(nextSlide, 4000); }
    function resetAutoSlide() { clearInterval(autoSlideTimer); startAutoSlide(); }

    heroSection.addEventListener('click', function(event) {
        if (event.target.closest('.hero-content')) return;
        const rect = heroSection.getBoundingClientRect();
        const clickX = event.clientX - rect.left; 
        if (clickX < rect.width / 2) { prevSlide(); } else { nextSlide(); }
        resetAutoSlide(); 
    });
    startAutoSlide();
}

// ================================
// 6. FILTER RUTE TUJUAN
// ================================
const filterButtons = document.querySelectorAll('.filter-btn');
const ruteTags = document.querySelectorAll('.rute-tag');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Hapus kelas aktif dari semua tombol
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Tambahkan ke tombol yg diklik
        button.classList.add('active');

        const target = button.getAttribute('data-target');

        ruteTags.forEach(tag => {
            if (target === 'all' || tag.getAttribute('data-wilayah') === target) {
                tag.style.display = 'inline-flex';
            } else {
                tag.style.display = 'none';
            }
        });
    });
});

// ================================
// 6b. FILTER GALERI MASONRY & LOAD MORE
// ================================
const galeriFilterBtns = document.querySelectorAll('.g-filter-btn');
const galeriItems = document.querySelectorAll('.galeri-item');
const galeriActions = document.getElementById('galeri-actions');
const btnLoadMore = document.getElementById('btn-load-more');
const btnShowLess = document.getElementById('btn-show-less');

let currentLimit = 9; // Batas awal 9 gambar
const itemsPerPage = 9; // Penambahan tiap klik
let currentFilter = 'all';

function updateGalleryDisplay() {
    let visibleCount = 0;
    let matchCount = 0;

    galeriItems.forEach(item => {
        const itemCategory = item.getAttribute('data-kategori');
        const isMatch = currentFilter === 'all' || itemCategory === currentFilter;

        if (isMatch) {
            matchCount++;
            // Jika filter 'all', gunakan sistem limit. Jika bukan 'all', tampilkan semua
            if (currentFilter === 'all') {
                if (visibleCount < currentLimit) {
                    showItem(item);
                    visibleCount++;
                } else {
                    hideItem(item);
                }
            } else {
                showItem(item);
                visibleCount++;
            }
        } else {
            hideItem(item);
        }
    });

    // Mengatur visibilitas tombol Load More / Show Less
    if (currentFilter === 'all') {
        galeriActions.style.display = 'block'; // Tampilkan area tombol
        
        // Atur tombol Tampilkan Lebih Banyak
        if (currentLimit >= matchCount) {
            btnLoadMore.style.display = 'none'; // Sembunyikan jika mentok
        } else {
            btnLoadMore.style.display = 'inline-flex';
        }

        // Atur tombol Tampilkan Lebih Sedikit
        if (currentLimit > itemsPerPage) {
            btnShowLess.style.display = 'inline-flex'; // Muncul jika sudah ada penambahan
        } else {
            btnShowLess.style.display = 'none';
        }
    } else {
        galeriActions.style.display = 'none'; // Sembunyikan tombol jika menggunakan filter selain 'Semua'
    }
}

function showItem(item) {
    item.style.display = 'block';
    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
}

function hideItem(item) {
    item.style.opacity = '0'; item.style.transform = 'scale(0.8)';
    setTimeout(() => { 
        if(item.style.opacity === '0') item.style.display = 'none'; 
    }, 400);
}

if(galeriFilterBtns.length > 0 && galeriItems.length > 0) {
    updateGalleryDisplay(); // Render saat pertama dimuat

    galeriFilterBtns.forEach(button => {
        button.addEventListener('click', () => {
            galeriFilterBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentFilter = button.getAttribute('data-filter');
            // Reset limit gambar ke 9 setiap kali klik tab "Semua"
            if(currentFilter === 'all') currentLimit = itemsPerPage; 
            updateGalleryDisplay();
        });
    });

    if(btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            currentLimit += itemsPerPage;
            updateGalleryDisplay();
        });
    }

    if(btnShowLess) {
        btnShowLess.addEventListener('click', () => {
            currentLimit = Math.max(itemsPerPage, currentLimit - itemsPerPage);
            updateGalleryDisplay();
            // Kembalikan layar ke atas area galeri dengan halus agar pandangan user tidak hilang
            document.getElementById('galeri').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}

// ================================
// 7. FAQ ACCORDION INTERAKTIF
// ================================
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Tutup yang lain jika ingin hanya 1 yang terbuka (opsional, baris di bawah bisa dihapus)
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        // Toggle yang diklik
        item.classList.toggle('active');
    });
});

// ================================
// 8. FLOATING WHATSAPP BUTTON LOGIC
// ================================
const btnUtama = document.querySelector('.btn-utama'); // Tombol "Hubungi Kami" di Hero
const floatingWa = document.getElementById('floating-wa');

if (btnUtama && floatingWa) {
    const waObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Jika tombol Hubungi Kami sudah TIDAK terlihat di layar
            if (!entry.isIntersecting) {
                floatingWa.classList.add('show');
            } else {
                // Jika masih terlihat, sembunyikan balon WA melayang
                floatingWa.classList.remove('show');
            }
        });
    }, {
        threshold: 0 // Bereaksi sekecil apa pun saat tombol keluar viewport
    });

    waObserver.observe(btnUtama);
}