import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";

import Game2048 from "./games/Game2048";
import RockPaperScissors from "./games/RockPaperScissors";
import Sudoku from "./games/Sudoku";
import MemoryMatching from "./games/MemoryMatching";
import TicTacToe from "./games/TicTacToe";
import BrickBreaker from "./games/BrickBreaker";
import DotsAndBoxes from "./games/DotsAndBoxesGame";
import FlappyBrid from "./games/FlappyBird";
import NotFound from "./pages/NotFound";

const App = () => {
  const location = useLocation();
  
  // Define routes where navbar should be shown
  const navbarRoutes = [
    "/",
    "/about",
    "/game2048",
    "/rock-paper-scissor",
    "/sudoku",
    "/memory-matching",
    "/tic-tac-toe",
    "/brick-breaker",
    "/dots-boxes",
    "/flappy-bird"
  ];
  
  // Check if current route should show navbar
  const shouldShowNavbar = navbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/game2048" element={<Game2048 />} />
        <Route path="/rock-paper-scissor" element={<RockPaperScissors />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="/memory-matching" element={<MemoryMatching />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/brick-breaker" element={<BrickBreaker />} />
        <Route path="/dots-boxes" element={<DotsAndBoxes />} />
        <Route path="/flappy-bird" element={<FlappyBrid />} />

        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;