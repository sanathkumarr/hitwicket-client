import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';



// Define the type for chat messages
interface ChatMessage {
    player: string;
    text: string;
    timestamp: string;
}

// Define the type for the game state
interface GameState {
    board: string[][];
    currentPlayer: string;
    winner: string | null;
    history: string[];
    chat: ChatMessage[];
}

const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    upgrade: false,
});

const SpectatorView: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        board: [
            ['A-P1', 'A-H1', 'A-H2', 'A-H1', 'A-P1'],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['B-P1', 'B-H1', 'B-H2', 'B-H1', 'B-P1'],
        ],
        currentPlayer: 'A',
        winner: null,
        history: [],
        chat: [],
    });

    useEffect(() => {
        socket.emit('join-spectator');

        socket.on('update-game', (newGameState: GameState) => {
            setGameState(newGameState);
        });

        socket.on('chat-update', (newChat: ChatMessage[]) => {
            setGameState(prevState => ({ ...prevState, chat: newChat }));
        });

        return () => {
            socket.off('update-game');
            socket.off('chat-update');
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="text-white text-2xl mb-4">Spectator View</h1>

                {/* Game Board */}
                <div className="grid grid-cols-5 gap-1">
                    {gameState.board.map((row, x) =>
                        row.map((cell, y) => (
                            <div key={`${x}-${y}`} className={`w-16 h-16 border ${cell.includes('A') ? 'bg-blue-500' : cell.includes('B') ? 'bg-red-500' : 'bg-gray-600'}`}>
                                {cell}
                            </div>
                        ))
                    )}
                </div>

                {/* Move History */}
                <div className="mt-4 w-full text-white">
                    <h2 className="text-xl mb-2">Move History</h2>
                    <ul>
                        {gameState.history.map((move, index) => (
                            <li key={index}>{move}</li>
                        ))}
                    </ul>
                </div>

                {/* Chat Area */}
                <div className="mt-4 bg-gray-800 p-4 w-full h-48 overflow-y-auto">
                    <h2 className="text-xl text-white mb-2">Chat</h2>
                    <div className="flex flex-col">
                        {gameState.chat.map((msg, index) => (
                            <div key={index} className="text-white mb-2">
                                <strong>{msg.player}:</strong> {msg.text} <span className="text-gray-400 text-sm">{msg.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpectatorView;
