# Who Is Most Likely To... (Imposter Edition)

An online multiplayer social deduction party game inspired by **Gartic Phone** and **Jackbox Games**. Players join a room lobby from their browsers (phones, tablets, or computers), answer "Who is most likely to..." questions with one hidden imposter receiving a completely different prompt, deliberate on suspicious answers, and vote to uncover the imposter!

---

## How To Play

1. **Create or Join a Lobby**:
   - The host creates a room and gets a 4-letter Room Code (e.g. `ABCD`).
   - Other players join by entering their nickname and room code, or simply clicking the host's **Copy Link** button (`http://<ip>:5173/?room=ABCD`).
   - Works on phones, laptops, and tablets on the same Wi-Fi network or across the internet!
   - Minimum 3 players required to start.

2. **Phase 1: Secret Prompts & Answering**:
   - $n-1$ players receive the **True Question** (e.g. *"Who is most likely to survive a zombie apocalypse?"*).
   - 1 secret **Imposter** receives a different prompt (e.g. *"Who is most likely to die first in a horror movie?"*).
   - Each player selects one person from the lobby who best fits the description on their screen.

3. **Phase 2: Stage 1 - Reveal Answers**:
   - All player picks are revealed on screen (e.g. *"Alice voted for Bob"*, *"Charlie voted for Alice"*).
   - The True Question is **kept hidden** during this stage so everyone can examine who picked whom!

4. **Phase 3: Stage 2 - Reveal True Question**:
   - The **True Question** is dramatically unveiled to all players!
   - Everyone compares the True Question to the choices made in Stage 1—and the Imposter realizes their prompt was different!

5. **Phase 4: Deliberation & Interrogation**:
   - Players debate, question weird choices, and defend themselves.
   - Built-in live text chat for remote players who aren't on voice call.
   - Host can skip to voting once discussion is finished.

6. **Phase 5: Accusation & Voting**:
   - Each player secretly casts a vote for the person they believe is the Imposter.

7. **Phase 6: The Verdict & Scoring**:
   - Votes are tallied. The player with the majority of votes is accused.
   - **If the accused was the Imposter**: **Crew Wins!** (+150 pts for correct voters, +75 pts for other crew).
   - **If the accused was Innocent (or a tie occurred)**: **Imposter Wins!** (+250 pts for the Imposter).
   - The real Imposter and their secret prompt are revealed to everyone!
   - Host can start the Next Round or return to Lobby.

---

## Quick Start

### 1. Run Development Mode
To start both backend (port `3001`) and frontend (port `5173`) concurrently:

```bash
npm run dev
```

- Open your browser to: **`http://localhost:5173`**
- Other devices on the same local Wi-Fi can join via your computer's local IP (e.g. `http://192.168.1.X:5173`).

### 2. Run / Test Production Mode Locally
To build both client and server and run the production server:

```bash
npm run build
npm start
```
Then visit **`http://localhost:3001`**. The single Express server will serve both the React app and WebSockets.

### 3. Deploy to the Cloud (Render / Railway)
1. Push repository to GitHub.
2. In Render or Railway, create a new **Web Service**.
3. Set **Build Command**: `npm run install:all && npm run build`
4. Set **Start Command**: `npm start`
5. Set environment variable: `NODE_ENV=production`
6. Deploy! Friends can now join from anywhere using your public deployment URL.

---

## 🛠️ Tech Stack & Features

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.IO, TypeScript.
- **Real-Time WebSockets**: Instant synchronization, reconnect resilience, countdown timers.
- **Web Audio API Synth**: Procedural sound effects (countdown ticks, dramatic gongs, chords, win fanfare, and buzzers) with zero external audio assets.
- **Mobile-Responsive**: Designed specifically for party play across mobile browsers and desktop displays.
- **Curated Question Library**: 50+ question pairs across Survival, Ambition, Party, Dating/Spicy, and Chaos categories.

