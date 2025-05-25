import React, { useEffect, useState, useRef } from "react";

export default function MazeGame() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [timer, setTimer] = useState(30);
  const [playing, setPlaying] = useState(true);
  const [moves, setMoves] = useState(0);
  const timerRef = useRef(null);

  // Start countdown timer
  useEffect(() => {
    if (!playing) return;

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPlaying(false);
          openModal("Game Over");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [playing]);

  // Keyboard controls example - replace with your maze logic
  useEffect(() => {
    function handleKeyDown(e) {
      if (!playing) return;

      const validKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
      ];
      if (validKeys.includes(e.key)) {
        e.preventDefault();
        // Example: Increment moves on valid move keys
        setMoves((m) => m + 1);

        // Example win condition (placeholder)
        if (moves + 1 >= 20) {
          setPlaying(false);
          openModal("Congrats! You Win");
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playing, moves]);

  function openModal(message) {
    setModalMessage(message);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }
  function playAgain() {
    setMoves(0);
    setTimer(30);
    setPlaying(true);
    setModalOpen(false);
  }

  // Helper to format timer as MM:SS
  const formatTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden flex flex-col items-center p-4">
      {/* Navbar */}
      <nav className="w-full max-w-4xl flex justify-between items-center bg-black px-6 py-4 rounded-md mb-6">
        <div className="flex items-center space-x-4">
          <img
            src="../../assets/images/LOGO.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border border-white object-contain"
          />
          <h1 className="text-3xl font-bold">Lost Path</h1>
        </div>
        <ul className="flex space-x-6">
          <li>
            <a
              href="../../index.html"
              className="flex items-center space-x-2 text-white hover:text-green-400"
            >
              <i className="fas fa-home"></i>
              <span>Home</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Game Heading and Instructions */}
      <div className="w-full max-w-4xl text-center mb-4">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Find the way out of Maze in 30 seconds!
        </h2>
      </div>

      {/* Moves and Timer */}
      <div className="w-full max-w-4xl flex justify-between text-lg mb-4 px-6">
        <div className="font-semibold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded px-4 py-2">
          Moves: {moves}
        </div>
        <div className="font-semibold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded px-4 py-2">
          {playing ? `Game ends in ${formatTimer(timer)}` : modalMessage}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-lg p-4 shadow-lg flex justify-center">
        <canvas
          id="canvas"
          width="523"
          height="523"
          className="bg-slate-100 rounded-md"
          // Your maze drawing logic hooks into this canvas
        >
          Your browser does not support HTML5 Canvas.
        </canvas>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-lg w-96 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header p-4 text-white text-center text-xl font-bold rounded-t-lg">
              {modalMessage}
              <button
                onClick={closeModal}
                className="float-right text-2xl font-bold hover:text-black cursor-pointer"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div
              className="modal-footer p-4 text-white text-center rounded-b-lg cursor-pointer hover:bg-green-700"
              onClick={playAgain}
            >
              Play Again?
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
