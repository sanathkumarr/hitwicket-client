import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Add Link import
import GameBoard from './Gameboard';
import SpectatorView from './SpectatorView';
import GameInstructions from './GameInstructions';
import './index.css'; // Ensure Tailwind CSS is imported

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/game" element={<GameBoard />} />
                <Route path="/spectator" element={<SpectatorView />} />
                <Route path="/instructions" element={<GameInstructions />} />
                <Route path="/" element={
                    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                        <h1 className="text-4xl font-bold mb-4">Welcome to the Game</h1>
                        <p className="text-lg mb-4">Choose an option to proceed:</p>
                        <div className="flex flex-col space-y-4">
                            <Link to="/game" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Play Game
                            </Link>
                            <Link to="/spectator" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Spectator View
                            </Link>
                            <Link to="/instructions" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                                Game Instructions
                            </Link>
                        </div>
                    </div>
                } />
            </Routes>
        </Router>
    );
};

export default App;
