const firebaseConfig = {
    apiKey: "AIzaSyCAdnfu2R82xbC7H85n_9mvQBE58X3TjbA",
    authDomain: "the-5k-elite-legacy.firebaseapp.com",
    projectId: "the-5k-elite-legacy",
    databaseURL: "https://the-5k-elite-legacy-default-rtdb.firebaseio.com/",
    storageBucket: "the-5k-elite-legacy.firebasestorage.app",
    messagingSenderId: "440824313752",
    appId: "1:440824313752:web:2c93344dcfe2ba0a4c5ded"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas'), ctx = cv.getContext('2d');
const mover = document.getElementById('mover'), viewport = document.getElementById('viewport');
const tooltip = document.getElementById('legacy-tooltip');
const blockW = 40, blockH = 25, cols = 100, rows = 50; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.22, pX = 0, pY = 0, pixels = {};
const imgCache = {};

function render() {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#eee"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke(); }

    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            if (!imgCache[p.imageUrl]) {
                const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
                img.onload = () => { imgCache[p.imageUrl] = img; render(); };
            } else { ctx.drawImage(imgCache[p.imageUrl], p.x, p.y, blockW, blockH); }
        }
    });
}

function searchPlot() {
    const id = parseInt(document.getElementById('searchInput').value);
    if (!id || id < 1 || id > 5000) return alert("Select Plot 1-5000");
    const r = Math.floor((id-1)/cols), c = (id-1)%cols;
    scale = 3.5;
    pX = (viewport.clientWidth/2) - (c*blockW*scale) - (blockW*scale/2);
    pY = (viewport.clientHeight/2) - (r*blockH*scale) - (blockH*scale/2);
    mover.style.transition = "transform 1.2s cubic-bezier(0.19, 1, 0.22, 1)";
    mover.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`;
}

cv.addEventListener('mousemove', (e) => {
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / cv.width);
    const y = (e.clientY - rect.top) / (rect.height / cv.height);
    let found = false;
    Object.values(pixels).forEach(p => {
        if (x >= p.x && x <= p.x + blockW && y >= p.y && y <= p.y + blockH) {
            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY + 15) + 'px';
            tooltip.innerHTML = `<strong>${p.name}</strong><br>${p.link}`;
            cv.style.cursor = 'pointer';
            found = true;
        }
    });
    if (!found) { tooltip.style.display = 'none'; cv.style.cursor = 'default'; }
});

cv.addEventListener('click', (e) => {
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / cv.width);
    const y = (e.clientY - rect.top) / (rect.height / cv.height);
    Object.values(pixels).forEach(p => {
        if (x >= p.x && x <= p.x + blockW && y >= p.y && y <= p.y + blockH) {
            if (p.link && p.link !== "#") window.open(p.link, '_blank');
        }
    });
});

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(pixels).length;
    document.getElementById('rem-count').innerText = 5000 - Object.keys(pixels).length;
    render();
});
function copyVal(v) { navigator.clipboard.writeText(v).then(()=>alert("Copied!")); }
