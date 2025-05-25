import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";

import Game2048 from "./games/Game2048";
import RockPaperScissors from "./games/RockPaperScissors";
import Sudoku from "./games/Sudoku";
import MemoryMatching from "./games/MemoryMatching";
import TicTacToe from "./games/TicTacToe";
import MazeGame from "./games/MazeGame";
import BrickBreaker from "./games/BrickBreaker";
import DotsAndBoxes from "./games/DotsAndBoxesGame";
import SnakeLadder from "./games/SnakeLadder";
import MineSwipper from "./games/MineSwipper";
import FlappyBrid from "./games/FlappyBird";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/game2048" element={<Game2048 />} />
        <Route path="/rock-paper-scissor" element={<RockPaperScissors />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="/memory-matching" element={<MemoryMatching />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/maze-game" element={<MazeGame />} />
        <Route path="/brick-breaker" element={<BrickBreaker />} />
        <Route path="/dots-boxes" element={<DotsAndBoxes />} />
        <Route path="/flappy-bird" element={<FlappyBrid />} />
        <Route path="/minesweeper" element={<MineSwipper />} />
        <Route path="/snake-ladder" element={<SnakeLadder />} />
      </Routes>
    </>
  );
};

export default App;
