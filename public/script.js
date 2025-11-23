const socket = io();

// DOM Elements
const landingScreen = document.getElementById('landing-screen');
const joinScreen = document.getElementById('join-screen');
const roomScreen = document.getElementById('room-screen');

const btnCreateRoom = document.getElementById('btn-create-room');
const btnEnterCode = document.getElementById('btn-enter-code');
const btnJoin = document.getElementById('btn-join');
const btnBackHome = document.getElementById('btn-back-home');
const btnShare = document.getElementById('btn-share');
const btnSendChat = document.getElementById('btn-send-chat');

const inputName = document.getElementById('input-name');
const inputRoomId = document.getElementById('input-room-id');
const inputLinkedin = document.getElementById('input-linkedin');
const inputChat = document.getElementById('input-chat');

const roomIdDisplay = document.getElementById('room-id-display');
const userList = document.getElementById('user-list');
const qrCodeContainer = document.getElementById('qrcode');
const scanHint = document.getElementById('scan-hint');
const chatMessages = document.getElementById('chat-messages');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// State
let currentRoomId = null;
let myName = '';

// Helper: Show specific screen
function showScreen(screenId) {
    [landingScreen, joinScreen, roomScreen].forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Check URL for room code
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
if (roomParam) {
    inputRoomId.value = roomParam;
    showScreen('join-screen');
}

// Tab Switching Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        // Hide all contents
        tabContents.forEach(c => c.classList.add('hidden'));
        // Show target content
        const targetId = `tab-${btn.dataset.tab}`;
        document.getElementById(targetId).classList.remove('hidden');
    });
});

// Event Listeners
btnCreateRoom.addEventListener('click', () => {
    const name = prompt("Enter your name to host:");
    if (!name) return;

    socket.emit('create-room', (roomId) => {
        currentRoomId = roomId;
        myName = name;

        // Organizer must also join as a user to chat/share
        socket.emit('join-room', { roomId, name }, (response) => {
            if (response.success) {
                enterRoom(roomId, true); // true = isOrganizer
                response.users.forEach(addUserToUI);
            }
        });
    });
});

btnEnterCode.addEventListener('click', () => {
    showScreen('join-screen');
});

btnBackHome.addEventListener('click', () => {
    showScreen('landing-screen');
});

btnJoin.addEventListener('click', () => {
    const name = inputName.value.trim();
    const roomId = inputRoomId.value.trim().toUpperCase();

    if (!name || !roomId) {
        alert('Please enter your name and room code.');
        return;
    }

    if (!socket.connected) {
        alert('Connection to server lost. Please refresh the page.');
        return;
    }

    btnJoin.textContent = 'Joining...';
    btnJoin.disabled = true;

    myName = name;
    currentRoomId = roomId;

    socket.emit('join-room', { roomId, name }, (response) => {
        btnJoin.textContent = 'Join Now';
        btnJoin.disabled = false;

        if (response.success) {
            enterRoom(roomId, false);
            // Populate existing users
            response.users.forEach(addUserToUI);
        } else {
            alert(response.message || 'Failed to join room');
        }
    });
});

btnShare.addEventListener('click', () => {
    const link = inputLinkedin.value.trim();
    if (link) {
        socket.emit('share-profile', { roomId: currentRoomId, linkedin: link });
        updateUserUI({ id: socket.id, linkedin: link });

        btnShare.textContent = 'Shared!';
        setTimeout(() => btnShare.textContent = 'Share Profile', 2000);
    }
});

// Chat Logic
function sendChat() {
    const msg = inputChat.value.trim();
    if (msg && currentRoomId) {
        socket.emit('chat-message', { roomId: currentRoomId, message: msg });
        inputChat.value = '';
    }
}

btnSendChat.addEventListener('click', sendChat);
inputChat.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
});

// Socket Events
socket.on('user-joined', (user) => {
    addUserToUI(user);
});

socket.on('update-profile', (user) => {
    updateUserUI(user);
});

socket.on('user-left', (userId) => {
    const el = document.getElementById(`user-${userId}`);
    if (el) el.remove();
});

socket.on('chat-message', (msgData) => {
    addChatMessage(msgData);
});

// Logic
function enterRoom(roomId, isOrganizer) {
    showScreen('room-screen');
    roomIdDisplay.textContent = `Room: ${roomId}`;

    // Generate QR Code
    qrCodeContainer.innerHTML = '';
    const joinUrl = `${window.location.origin}/?room=${roomId}`;

    if (isOrganizer) {
        qrCodeContainer.classList.remove('hidden');
        scanHint.classList.remove('hidden');
        new QRCode(qrCodeContainer, {
            text: joinUrl,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

function addUserToUI(user) {
    if (document.getElementById(`user-${user.id}`)) return;

    const div = document.createElement('div');
    div.className = 'user-card animate-fade-in';
    div.id = `user-${user.id}`;

    div.innerHTML = `
        <div class="user-info">
            <span class="user-name">${user.name} ${user.id === socket.id ? '(You)' : ''}</span>
            <a href="${user.linkedin || '#'}" target="_blank" class="user-link ${user.linkedin ? '' : 'hidden'}">Connect on LinkedIn</a>
        </div>
    `;

    userList.appendChild(div);
}

function updateUserUI(user) {
    const card = document.getElementById(`user-${user.id}`);
    if (card) {
        const linkEl = card.querySelector('.user-link');
        if (user.linkedin) {
            linkEl.href = user.linkedin;
            linkEl.classList.remove('hidden');
            card.style.borderColor = '#8b5cf6';
            setTimeout(() => card.style.borderColor = 'transparent', 1000);
        }
    }

    // Update "My Shared Link" display if it's me
    if (user.id === socket.id && user.linkedin) {
        const displayEl = document.getElementById('current-link-display');
        const linkEl = displayEl.querySelector('a');
        if (displayEl && linkEl) {
            linkEl.href = user.linkedin;
            linkEl.textContent = user.linkedin;
            displayEl.classList.remove('hidden');
        }
    }
}


function addChatMessage(data) {
    const div = document.createElement('div');
    const isMine = data.userId === socket.id;

    div.className = `message ${isMine ? 'mine' : 'others'}`;
    div.innerHTML = `
        <span class="message-sender">${isMine ? 'You' : data.userName}</span>
        ${data.text}
    `;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Terms Modal Logic
const termsModal = document.getElementById('terms-modal');
const linkTerms = document.getElementById('link-terms');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnAcceptTerms = document.getElementById('btn-accept-terms');

linkTerms.addEventListener('click', () => {
    termsModal.classList.remove('hidden');
});

function closeTerms() {
    termsModal.classList.add('hidden');
}

btnCloseModal.addEventListener('click', closeTerms);
btnAcceptTerms.addEventListener('click', closeTerms);
termsModal.addEventListener('click', (e) => {
    if (e.target === termsModal) closeTerms();
});
