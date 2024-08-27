import React from 'react';
import { Link } from 'react-router-dom';

const GameInstructions: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-6">Game Instructions</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4">Characters and Movements</h2>
                <ul className="list-disc pl-5 mb-6">
                    <li>
                        <strong>Pawn:</strong> Moves one block in any direction (Left, Right, Forward, or Backward).
                        <br />Move commands: <code>L</code> (Left), <code>R</code> (Right), <code>F</code> (Forward), <code>B</code> (Backward)
                    </li>
                    <li>
                        <strong>Hero1:</strong> Moves two blocks straight in any direction. Kills any opponent's character in its path.
                        <br />Move commands: <code>L</code> (Left), <code>R</code> (Right), <code>F</code> (Forward), <code>B</code> (Backward)
                    </li>
                    <li>
                        <strong>Hero2:</strong> Moves two blocks diagonally in any direction. Kills any opponent's character in its path.
                        <br />Move commands: <code>FL</code> (Forward-Left), <code>FR</code> (Forward-Right), <code>BL</code> (Backward-Left), <code>BR</code> (Backward-Right)
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mb-4">Game Flow</h2>
                <ul className="list-disc pl-5 mb-6">
                    <li>
                        <strong>Initial Setup:</strong> Players deploy all 5 characters on their starting row in any order.
                        Character positions are input as a list of character names, placed from left to right.
                    </li>
                    <li>
                        <strong>Turns:</strong> Players alternate turns, making one move per turn.
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mb-4">Combat</h2>
                <p className="mb-6">
                    If a character moves to a space occupied by an opponent's character, the opponent's character is removed from the game.
                    For Hero1 and Hero2, any opponent's character in their path is removed, not just the final destination.
                </p>

                <h2 className="text-2xl font-semibold mb-4">Invalid Moves</h2>
                <ul className="list-disc pl-5 mb-6">
                    <li>The specified character doesn't exist.</li>
                    <li>The move would take the character out of bounds.</li>
                    <li>The move is not valid for the given character type.</li>
                    <li>The move targets a friendly character.</li>
                </ul>

                <h2 className="text-2xl font-semibold mb-4">Game State Display</h2>
                <p className="mb-6">
                    After each turn, the 5x5 grid is displayed with all character positions.
                    Character names are prefixed with the player's identifier and character type (e.g., A-P1, B-H1, A-H2).
                </p>

                <h2 className="text-2xl font-semibold mb-4">Winning the Game</h2>
                <p className="mb-6">
                    The game ends when one player eliminates all of their opponent's characters. The winning player is announced, and players can choose to start a new game.
                </p>

                <div className="mt-8">
                    <Link to="/game" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                        Start New Game
                    </Link>
                    <Link to="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GameInstructions;
