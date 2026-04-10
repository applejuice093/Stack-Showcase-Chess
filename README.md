# ♟️ Stack-Showcase-Chess

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A high-performance Chess engine engineered to demonstrate the utility of **Stack Data Structures** in managing complex game states, move history, and algorithmic backtracking.

---

## 🚀 The Core Concept: Why Stacks?

In chess programming, tracking the progression of a game is just as vital as calculating the next move. This project utilizes a **Last-In, First-Out (LIFO)** approach to handle the "timeline" of the match.

### 🧠 Implementation Details
* **Move History:** Every legal move is pushed onto a `historyStack`. This allows for a linear record of the game that is memory-efficient and easy to traverse.
* **Undo/Redo System:** * **Undo:** Pops the current state from the `historyStack` and pushes it onto a `redoStack`.
    * **Redo:** Pops from the `redoStack` and pushes back onto the `historyStack`.
* **State-Space Management:** During AI pathfinding, stacks are used to manage board evaluations, ensuring the engine can efficiently backtrack during recursive searches.

---

## ✨ Features

- **Functional AI Engine:** Play against a bot that evaluates positions and responds in real-time.
- **State Persistence:** Full support for complex chess rules including castling, en passant, and pawn promotions.
- **Robust Undo/Redo:** Seamlessly navigate back to any point in the game without breaking the engine's logic.
- **Modern UI:** A clean, responsive interface built with Next.js and Tailwind CSS.

---

## 🛠️ Tech Stack

| Tool | Usage |
| :--- | :--- |
| **Next.js 14+** | Application framework and routing |
| **TypeScript** | Type-safe chess logic and state management |
| **Tailwind CSS** | Utility-first styling for the game board and UI |
| **PostCSS** | Advanced CSS processing |

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/applejuice093/Stack-Showcase-Chess.git](https://github.com/applejuice093/Stack-Showcase-Chess.git)
cd Stack-Showcase-Chess
```
### 2. Install dependencies
```
npm install
# or
yarn install
```

### 3. Run the development server
```
npm run dev
```

### 📂 Project Structure
```
├── app/              # Next.js App Router logic
├── public/           # Assets (Chess piece SVGs/Images)
├── components/       # Reusable UI components
├── lib/              # Core Chess Engine & Stack logic
├── next.config.ts    # Next.js configuration
└── tsconfig.json     # TypeScript configuration
```
## 👤 Author
applejuice093

GitHub: @applejuice093
