const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, 'public')));

// Store room data: { roomId: { users: [ { id, name, linkedin } ] } }
const rooms = {};

// Debug endpoint to check rooms
app.get('/debug-rooms', (req, res) => {
    res.json(rooms);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('create-room', (callback) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomId] = { users: [] };
        socket.join(roomId);
        callback(roomId);
        console.log(`Room created: ${roomId}`);
    });

    socket.on('join-room', ({ roomId, name }, callback) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            const user = { id: socket.id, name, linkedin: '' };
            rooms[roomId].users.push(user);

            // Notify others in the room
            socket.to(roomId).emit('user-joined', user);

            // Send current room state to the new user
            callback({ success: true, users: rooms[roomId].users });
            console.log(`${name} joined room ${roomId}`);
        } else {
            callback({ success: false, message: 'Room not found' });
        }
    });

    socket.on('share-profile', ({ roomId, linkedin }) => {
        if (rooms[roomId]) {
            const user = rooms[roomId].users.find(u => u.id === socket.id);
            if (user) {
                user.linkedin = linkedin;
                io.to(roomId).emit('update-profile', user);
            }
        }
    });

    socket.on('chat-message', ({ roomId, message }) => {
        if (rooms[roomId]) {
            const user = rooms[roomId].users.find(u => u.id === socket.id);
            if (user) {
                io.to(roomId).emit('chat-message', {
                    userId: user.id,
                    userName: user.name,
                    text: message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from all rooms they were in
        for (const roomId in rooms) {
            const index = rooms[roomId].users.findIndex(u => u.id === socket.id);
            if (index !== -1) {
                const user = rooms[roomId].users[index];
                rooms[roomId].users.splice(index, 1);
                io.to(roomId).emit('user-left', user.id);

                // If room is empty, maybe delete it? Keeping it simple for now.
                if (rooms[roomId].users.length === 0) {
                    // delete rooms[roomId]; // Optional cleanup
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
