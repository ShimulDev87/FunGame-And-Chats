// ১. Firebase Configuration (আপনার আসল Credentials গুলো দিয়ে রিপ্লেস করে নিন)
const firebaseConfig = {

  apiKey: "AIzaSyC8bpTs6io_EGs7tMipgC6r3J7Gtdn-D9E",

  authDomain: "shimul-s-gaming-platform.firebaseapp.com",

  projectId: "shimul-s-gaming-platform",

  storageBucket: "shimul-s-gaming-platform.firebasestorage.app",

  messagingSenderId: "454191228047",

  appId: "1:454191228047:web:a06b40409cf8dd46dc7cfa",

  measurementId: "G-5R86D91HWT"

};
// ২. Initialize
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// Google Login & Auth State
window.loginWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(error => console.error("Login Error:", error));
};

auth.onAuthStateChanged(user => {
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  if (user) {
    currentUser = user;
    loginBtn.style.display = 'none';
    userInfo.style.display = 'inline-block';
    userInfo.innerText = `👋 ${user.displayName}`;
  } else {
    currentUser = null;
    loginBtn.style.display = 'inline-block';
    userInfo.style.display = 'none';
  }
});

// Realtime Chat
db.collection("global_chat").orderBy("createdAt", "asc").onSnapshot(snapshot => {
  const chatBox = document.getElementById('chat-messages');
  if (!chatBox) return;
  chatBox.innerHTML = '';
  snapshot.forEach(doc => {
    const msg = doc.data();
    const msgDiv = document.createElement('div');
    msgDiv.style.marginBottom = "8px";
    msgDiv.innerHTML = `<strong style="color:#ff4757;">${msg.user || 'User'}:</strong> ${msg.text}`;
    chatBox.appendChild(msgDiv);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Chat Send Logic
const sendBtn = document.getElementById('send-btn');
const chatInput = document.getElementById('chat-input');

if (sendBtn && chatInput) {
  sendBtn.addEventListener('click', () => {
    if (!chatInput.value.trim()) return;
    if (!currentUser) return alert("মেসেজ পাঠাতে প্রথমে গুগল দিয়ে লগইন করুন!");

    db.collection("global_chat").add({
      text: chatInput.value,
      user: currentUser.displayName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    chatInput.value = '';
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
}

// Fullscreen Toggle
window.toggleFullscreen = () => {
  const iframe = document.getElementById('game-frame');
  if (iframe) {
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) { /* Safari */
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) { /* IE11 */
      iframe.msRequestFullscreen();
    }
  }
};

// ৪. Game Catalog with Metadata
const gamesList = [
  {
    id: "game1",
    title: "Candy Rope 2D",
    tag: "2D Puzzle",
    rating: "4.9",
    thumbnail: "https://via.placeholder.com/180x110/ff4757/ffffff?text=Bunny+Blitz",
    path: "games/candy-rope-2d/index.html"
  },
  {
    id: "game2",
    title: "Z-Strike: Zombie Shooter",
    tag: "3D Shooter",
    rating: "4.8",
    thumbnail: "https://via.placeholder.com/180x110/2ed573/ffffff?text=Z-Strike",
    path: "games/z-strike/index.html"
  }
];

function loadGameCatalog() {
  const gameGrid = document.getElementById('game-grid');
  if (!gameGrid) return;

  gameGrid.innerHTML = '';
  gamesList.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-id', game.id);
    card.innerHTML = `
      <img src="${game.thumbnail}" alt="${game.title}">
      <div class="card-info">
        <p>${game.title}</p>
        <div class="meta-tags">
          <span class="tag">${game.tag}</span>
          <span class="rating">★ ${game.rating}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => playGame(game));
    gameGrid.appendChild(card);
  });

  if (gamesList.length > 0) playGame(gamesList[0]);
}

function playGame(game) {
  const iframe = document.getElementById('game-frame');
  const title = document.getElementById('game-title');
  const featuredTitle = document.getElementById('featured-title');

  if (iframe) iframe.src = game.path;
  if (title) title.innerText = game.title;
  if (featuredTitle) featuredTitle.innerText = game.title;

  // Active Glow Animation Update
  document.querySelectorAll('.game-card').forEach(card => card.classList.remove('active-game'));
  const activeCard = document.querySelector(`.game-card[data-id="${game.id}"]`);
  if (activeCard) activeCard.classList.add('active-game');
}

// DOM fully loaded হওয়ার পর গেম ক্যাটালগ রেন্ডার
document.addEventListener('DOMContentLoaded', loadGameCatalog);