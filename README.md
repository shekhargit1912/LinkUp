# LinkUp - Instant Networking for Meetups 🚀

LinkUp is a real-time web application designed to streamline networking at events, meetups, and conferences. It allows organizers to create a temporary digital room where attendees can instantly join, share their LinkedIn profiles, and chat with everyone in the room.

![LinkUp Preview](https://via.placeholder.com/800x400?text=LinkUp+Preview+Image) 
*(Replace with actual screenshot if available)*

## ✨ Features

*   **📱 Scan & Join**: Organizers generate a QR code that attendees can scan to join the room instantly.
*   **👥 Real-time Participant List**: See who is in the room in real-time.
*   **🔗 Instant Profile Sharing**: Share your LinkedIn profile with a single click.
*   **💬 Group Chat**: Open discussion channel for everyone in the room.
*   **🎨 Premium UI**: Modern "Glassmorphism" design with a clean, white/transparent aesthetic.
*   **🔒 Privacy Focused**: Rooms and data are temporary and cleared when the session ends.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3 (Vanilla), JavaScript
*   **Backend**: Node.js, Express.js
*   **Real-time Communication**: Socket.io
*   **Utilities**: QRCode.js

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or higher)
*   npm (Node Package Manager)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/shekhargit1912/LinkUp.git
    cd LinkUp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the server**
    ```bash
    npm start
    ```

4.  **Open in Browser**
    Visit `http://localhost:3000`

### 📱 Testing on Mobile (Localhost)

To test with mobile devices on the same network or remotely during development, you can use a tunnel service like `localtunnel`:

```bash
npx localtunnel --port 3000
```
Use the provided URL to access the app from your phone.

## 📖 How to Use

1.  **Organizer**: Open the app on a laptop/screen and click **"Create New Room"**. Enter your name.
2.  **Attendees**: Scan the QR code displayed on the Organizer's screen.
3.  **Connect**: Enter your name to join.
4.  **Share**: Go to the "Share" tab and paste your LinkedIn URL to share it with the room.
5.  **Chat**: Use the "Chat" tab to send messages to the group.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ for the Community.*