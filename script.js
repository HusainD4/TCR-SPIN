let participants = [];
const track = document.getElementById('track');
const gachaBox = document.getElementById('gachaBox');
const spinBtn = document.getElementById('spinBtn');
const winnerOverlay = document.getElementById('winnerOverlay');
const winnerCard = document.getElementById('winnerCard');
const winnerNameEl = document.getElementById('winnerName');
const closePopupBtn = document.getElementById('closePopupBtn');

// Audio Elements
const spinAudio = document.getElementById('spinAudio');
const winAudio = document.getElementById('winAudio');

const ITEM_HEIGHT = 60; 
let isIdle = true;
let idleTimeout;

// ==========================================
// INISIALISASI EFEK KEREN (PARTIKEL & 3D TILT)
// ==========================================
function initCoolEffects() {
    // 1. Setup Particles.js Background (Jaring/Rasi Bintang)
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#ffffff" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": false, "anim": { "enable": false } },
            "size": { "value": 3, "random": true, "anim": { "enable": false } },
            "line_linked": { "enable": true, "distance": 150, "color": "#38B6FF", "opacity": 0.4, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "window",
            "events": {
                "onhover": { "enable": true, "mode": "grab" },
                "onclick": { "enable": true, "mode": "push" },
                "resize": true
            },
            "modes": {
                "grab": { "distance": 200, "line_linked": { "opacity": 1 } },
                "push": { "particles_nb": 4 }
            }
        },
        "retina_detect": true
    });

    // 2. Setup Vanilla Tilt (Efek Box Parallax 3D)
    VanillaTilt.init(document.querySelector(".gacha-container"), {
        max: 10,           // Maksimal kemiringan (derajat)
        speed: 400,        // Kecepatan animasi
        glare: true,       // Pantulan cahaya kaca
        "max-glare": 0.4,  // Maksimal terang pantulan
        scale: 1.02        // Membesar sedikit saat di-hover
    });
}


// ==========================================
// LOGIKA GACHA
// ==========================================
function getSecureRandomIndex(max) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
}

function fireEpicConfetti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

function runIdleAnimation() {
    if (!isIdle || participants.length === 0) return;

    const idleItems = 100;
    let idleSequence = [];
    
    for (let i = 0; i < idleItems; i++) {
        idleSequence.push(participants[getSecureRandomIndex(participants.length)]);
    }

    track.innerHTML = idleSequence.map(name => `<div class="name-item">${name}</div>`).join('');
    
    track.style.transition = 'none';
    track.style.transform = `translateY(0px)`;
    track.offsetHeight; 

    track.style.transition = 'transform 30s linear';
    const targetY = -(idleItems - 3) * ITEM_HEIGHT;
    track.style.transform = `translateY(${targetY}px)`;

    idleTimeout = setTimeout(() => {
        if (isIdle) runIdleAnimation();
    }, 30000); 
}

async function loadData() {
    try {
        const response5K = await fetch('data/peserta5K.json');
        const data5K = await response5K.json();
        
        const response10K = await fetch('data/peserta10K.json');
        const data10K = await response10K.json();

        const names5K = data5K.map(item => item["NAME"]).filter(name => name);
        const names10K = data10K.map(item => item["NAME"]).filter(name => name);

        participants = [...names5K, ...names10K];

        if (participants.length > 0) {
            spinBtn.disabled = false;
            spinBtn.innerText = "MULAI SPIN";
            isIdle = true;
            runIdleAnimation();
        } else {
            track.innerHTML = `<div class="name-item">Data kosong!</div>`;
        }
    } catch (error) {
        console.error("Error loading JSON:", error);
        track.innerHTML = `<div class="name-item" style="color:red;">Gagal Muat Data</div>`;
        spinBtn.innerText = "ERROR";
    }
}

function startSpin() {
    if (participants.length === 0) return;

    isIdle = false;
    clearTimeout(idleTimeout);

    // Aktifkan Mode Ketegangan (Glow Emas)
    gachaBox.classList.add('tension-mode');
    spinBtn.disabled = true;
    spinBtn.innerText = "MENGUNDI...";
    
    spinAudio.currentTime = 0;
    spinAudio.play().catch(e => console.log("Audio diblokir browser."));

    const winnerIndex = getSecureRandomIndex(participants.length);
    const finalWinner = participants[winnerIndex];

    const spinDurationItems = 250; 
    let spinSequence = [];
    spinSequence.push(participants[getSecureRandomIndex(participants.length)]);

    for (let i = 0; i < spinDurationItems; i++) {
        spinSequence.push(participants[getSecureRandomIndex(participants.length)]);
    }

    spinSequence.push(finalWinner);
    spinSequence.push(participants[getSecureRandomIndex(participants.length)]);
    spinSequence.push(participants[getSecureRandomIndex(participants.length)]);

    track.innerHTML = spinSequence.map(name => `<div class="name-item">${name}</div>`).join('');

    track.style.transition = 'none';
    track.style.transform = `translateY(0px)`;
    track.offsetHeight; 

    // Putar selamaDetik
    track.style.transition = 'transform 12s cubic-bezier(0.1, 0.7, 0.1, 1)';
    const targetY = -(spinDurationItems * ITEM_HEIGHT);
    track.style.transform = `translateY(${targetY}px)`;

    // Setelahdetik
    setTimeout(() => {
        gachaBox.classList.remove('tension-mode');
        spinAudio.pause();
        winAudio.currentTime = 0;
        winAudio.play().catch(e => console.log(e));

        winnerNameEl.innerText = finalWinner;
        winnerOverlay.classList.add('show');
        fireEpicConfetti();
    }, 11500); 
}

closePopupBtn.addEventListener('click', () => {
    winnerOverlay.classList.remove('show');
    spinBtn.disabled = false;
    spinBtn.innerText = "SPIN LAGI";
    
    isIdle = true;
    runIdleAnimation();
});

// Efek Parallax 3D pada Popup Pemenang
document.addEventListener('mousemove', (e) => {
    if (winnerOverlay.classList.contains('show')) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40; 
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40; 
        winnerCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});
document.addEventListener('mouseleave', () => {
    if (winnerOverlay.classList.contains('show')) {
        winnerCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
});

// Start Inisialisasi
spinBtn.addEventListener('click', startSpin);
window.addEventListener('DOMContentLoaded', () => {
    initCoolEffects(); // Panggil efek partikel & 3D Tilt
    loadData();
});