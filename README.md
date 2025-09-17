<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.rawgit.com/dancpluz/melodix/main/assets/readme-dark.svg">
    <img src="https://cdn.rawgit.com/dancpluz/melodix/main/assets/readme-light.svg">
  </picture>
</p>

## 📚 About

<picture>
  <img src="https://cdn.rawgit.com/dancpluz/melodix/main/assets/screenshot.gif" align="right" width="40%"/>
</picture>

This repository contains **Melodix**, an audio streaming application developed as the final project for the **Computer Networks** course at the **University of Brasília (UnB)**. The project is a functional client–server web application built to explore and demonstrate the practical use of **Sockets** for real-time audio streaming.

Inspired by a certain well-known music streaming service, the system enables users to connect to a server, retrieve a list of available songs, and play them on demand. The core challenge was managing the real-time data transfer, which involved splitting audio files into smaller chunks on the server and efficiently decoding and playing them on the client.

This work was a fantastic hands-on learning experience that solidified our understanding of fundamental network protocols and real-time communication techniques.

## 📌 Features

- **Client–Server Architecture:** A system with a dedicated server for hosting and serving audio files.
- **Real-time Audio Streaming:** Efficient data transfer of `.mp3` files using **Sockets**.
- **User-friendly Interface:** A clean, Spotify-inspired interface for browsing and playing music.
- **Dynamic Content:** The client automatically retrieves a list of available songs from the server's `tracks/` directory.
- **Multi-client Support:** Handles connections from multiple clients simultaneously.
- **Web Audio API Integration:** Decodes and plays audio streams directly in the browser.

## 🛠 Built With

<p align="left">
  <img src="https://skillicons.dev/icons?i=nodejs,express,nextjs,react,js" />
</p>

- **Server:** Node.js, Express, Socket.io
- **Client:** Next.js, React
- **Audio Processing:** FFmpeg
- **Frontend:** Web Audio API

## 👨‍💻 How to Run

### Prerequisites

You need to have **Node.js** installed on your system.

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dancpluz/melodix.git
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd melodix
    ```
3.  **Install dependencies in both client and server directories:**
    ```bash
    cd server
    ```
    ```bash
    npm install
    ```
    ```bash
    cd ../client
    ```
    ```bash
    npm install
    ```
4.  **Prepare your music library:**
    Create a folder named `tracks` inside the `server` directory. Inside `tracks`, create subfolders for each artist or album (e.g., `server/tracks/ArtistName`). Place your `.mp3` files inside these subfolders. The filename will be the song title displayed in the app.
5.  **Run the server:**
    ```bash
    cd ../server
    ```
    ```bash
    npm start
    ```
6.  **Run the client:**
    ```bash
    cd ../client
    ```
    ```bash
    npm run dev
    ```

The application will be accessible at `http://localhost:3000`.

## 👥 Group / Author(s)

This project was developed by:

- **dancpluz (Daniel Luz)** — [GitHub](https://github.com/dancpluz)

## 🤝 Contributions / Acknowledgements

This project was developed for the **Computer Networks** course at the **University of Brasília (UnB)**. A special thank you to the professor Gabriel and teaching assistants for their guidance throughout the semester.

- **Report:** A full technical report detailing the project's architecture, implementation, and challenges is available on Overleaf. You can read it here: [https://www.overleaf.com/read/ynxrvzhmmbcp#321db7](https://www.overleaf.com/read/ynxrvzhmmbcp#321db7).

## ⚠️ Important Note

This is a prototype developed for an academic assignment that was graded at **70%**. While the core functionality works, the music playback may experience minor synchronization issues due to the nature of network streaming.
