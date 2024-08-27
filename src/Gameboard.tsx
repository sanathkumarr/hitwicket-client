import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './index.css';

interface GameState {
    board: string[][]; // 5x5 grid to store the positions of characters
    currentPlayer: string; // 'A' or 'B'
    winner: string | null; // 'A', 'B', or null
    history: string[]; // Track move history
    chat: { player: string, text: string, timestamp: string }[]; // Chat messages
    players: { [key: string]: { id: string, username: string } }; // Player information
}

const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    upgrade: false,
});

const GameBoard: React.FC = () => {
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
        players: {},
    });
    const [selectedCharacter, setSelectedCharacter] = useState<{ x: number, y: number } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<{ x: number, y: number }[]>([]);
    const [message, setMessage] = useState<string>('');
    const [invalidMove, setInvalidMove] = useState<boolean>(false);
    const [username] = useState<string>('');

    useEffect(() => {
        
        socket.on('error', (message: string) => {
            window.alert(message); // Display error as a prompt box
        });
        socket.emit('join-game');

        socket.on('update-game', (newGameState) => {
            setGameState(newGameState);
        });

        socket.on('player-joined', (username) => {
            console.log(`${username} has joined the game.`);
        });

        socket.on('player-left', (playerId) => {
            console.log(`Player with ID ${playerId} has left.`);
        });

        socket.on('chat-update', (newChat) => {
            setGameState(prevState => ({ ...prevState, chat: newChat }));
        });
        return () => {
            socket.off('update-game');
            socket.off('player-joined');
            socket.off('player-left');
            socket.off('chat-update');
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() !== '') {
            socket.emit('chat-message', message);
            setMessage('');
        }
    };

    const handleClick = (x: number, y: number) => {
        if (gameState.winner) return;

        const selectedCell = gameState.board[x][y];

        if (selectedCharacter) {
            if (selectedCell.startsWith(gameState.currentPlayer)) {
                // If the clicked cell is the same team, select the new character
                setSelectedCharacter({ x, y });
                const piece = selectedCell;
                const moves = getPossibleMoves(piece, x, y);
                setPossibleMoves(moves);
            } else {
                const board = [...gameState.board];
                const selectedPiece = board[selectedCharacter.x][selectedCharacter.y];

                if (!isValidMove(selectedPiece, selectedCharacter.x, selectedCharacter.y, x, y)) {
                    setInvalidMove(true);
                    setTimeout(() => setInvalidMove(false), 300); // Shake animation duration
                    return;
                }

                if (selectedCell && selectedCell[0] !== gameState.currentPlayer) {
                    // Combat - opponent's piece eliminated
                    board[x][y] = selectedPiece;
                } else {
                    // Normal move
                    board[x][y] = selectedPiece;
                }

                board[selectedCharacter.x][selectedCharacter.y] = '';
                const newPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
                const newHistory = [...gameState.history, `${selectedPiece}:${selectedCharacter.x}-${selectedCharacter.y} to ${x}-${y}`];
                const newGameState: GameState = {
                    ...gameState,
                    board,
                    currentPlayer: newPlayer,
                    winner: checkWinner(board),
                    history: newHistory,
                };

                setGameState(newGameState);
                setSelectedCharacter(null);
                setPossibleMoves([]);
                socket.emit('move', newGameState);
            }
        } else {
            // Select a character
            if (selectedCell.startsWith(gameState.currentPlayer)) {
                setSelectedCharacter({ x, y });
                const piece = selectedCell;
                const moves = getPossibleMoves(piece, x, y);
                setPossibleMoves(moves);
            }
        }
    };

    const isValidMove = (piece: string, startX: number, startY: number, endX: number, endY: number): boolean => {
        const deltaX = Math.abs(endX - startX);
        const deltaY = Math.abs(endY - startY);

        switch (piece.slice(2)) {
            case 'P1': // Pawn logic
                return (deltaX === 1 && deltaY === 0) || (deltaX === 0 && deltaY === 1);
            case 'H1': // Hero1 logic
                return (deltaX === 2 && deltaY === 0) || (deltaX === 0 && deltaY === 2);
            case 'H2': // Hero2 logic
                return deltaX === 2 && deltaY === 2;
            default:
                return false;
        }
    };

    const getPossibleMoves = (piece: string, startX: number, startY: number): { x: number, y: number }[] => {
        const moves: { x: number, y: number }[] = [];
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
            { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
        ];
    
        switch (piece.slice(2)) {
            case 'P1': // Pawn logic: Move one block in any direction, but not diagonally
                directions.forEach(({ dx, dy }) => {
                    const x = startX + dx;
                    const y = startY + dy;
                    if (x >= 0 && x < 5 && y >= 0 && y < 5 && isValidMove(piece, startX, startY, x, y)) {
                        moves.push({ x, y });
                    }
                });
                break;
    
            case 'H1': // Hero1 logic: Move two blocks in a straight line
                directions.slice(0, 4).forEach(({ dx, dy }) => { // Only straight lines
                    const x = startX + 2 * dx;
                    const y = startY + 2 * dy;
                    if (x >= 0 && x < 5 && y >= 0 && y < 5 && isValidMove(piece, startX, startY, x, y)) {
                        moves.push({ x, y });
                    }
                });
                break;
    
            case 'H2': // Hero2 logic: Move two blocks diagonally
                directions.slice(4).forEach(({ dx, dy }) => { // Only diagonals
                    const x = startX + 2 * dx;
                    const y = startY + 2 * dy;
                    if (x >= 0 && x < 5 && y >= 0 && y < 5 && isValidMove(piece, startX, startY, x, y)) {
                        moves.push({ x, y });
                    }
                });
                break;
    
            default:
                break;
        }
    
        return moves;
    };

    const checkWinner = (board: string[][]): string | null => {
        const flattenBoard = board.flat();
        const remainingA = flattenBoard.some(piece => piece.startsWith('A-'));
        const remainingB = flattenBoard.some(piece => piece.startsWith('B-'));

        if (!remainingA) return 'B';
        if (!remainingB) return 'A';
        return null;
    };

    const handleRestartGame = () => {
        socket.emit('restart-game');
    };

    const renderCell = (x: number, y: number) => {
        const cell = gameState.board[x][y];
        const isPossibleMove = possibleMoves.some(move => move.x === x && move.y === y);
        const isSelected = selectedCharacter?.x === x && selectedCharacter?.y === y;

        return (
            <div
                key={`${x}-${y}`}
                className={`h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center cursor-pointer 
                    ${isSelected ? 'bg-yellow-600' : isPossibleMove ? 'bg-blue-600' : 'bg-gray-700'} 
                    ${cell ? 'border border-white' : ''} 
                    ${invalidMove ? 'invalid-move' : ''} 
                    ${isSelected || isPossibleMove ? 'movable-piece' : ''}`}
                onClick={() => handleClick(x, y)}
            >
                {cell}
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900">
            <div className="flex-1 flex flex-col items-center justify-center lg:w-3/4 lg:mr-4">
                {/* Winner or Current Player Display */}
                {gameState.winner ? (
                    <div className                    ="text-white text-2xl mb-4">
                    <p>Winner: Player {gameState.winner}</p>
                    <button
                        onClick={handleRestartGame}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
                    >
                        Restart Game
                    </button>
                </div>
            ) : (
                <div className="text-red-800 text-2xl mb-4">
                        <p>Current Player: Player {gameState.currentPlayer}</p>
                        <p>Your Username: {username}</p>
                    </div>
            )}

            {/* Game Board */}
            <div className="grid grid-cols-5 gap-1">
                {gameState.board.map((row, x) =>
                    row.map((_, y) => renderCell(x, y))
                )}
            </div>

            {/* Move History */}
            <div className="mt-4 w-full items-center justify-center text-white">
                <h2 className="text-xl mb-2">Move History</h2>
                <ul>
                    {gameState.history.map((move, index) => (
                        <li key={index}>{move}</li>
                    ))}
                </ul>
            </div>
            <button
                    onClick={handleRestartGame}
                    className="mt-4 bg-green-500 text-white p-2 rounded"
                >
                    Restart Game
                </button>
        </div>

        {/* Chat Area */}
        <div className="lg:w-1/4 lg:ml-4 bg-gray-800 p-4 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4">
                <h2 className="text-xl text-white mb-2">Chat</h2>
                <div className="flex flex-col">
                    {gameState.chat.map((msg, index) => (
                        <div key={index} className="text-white mb-2">
                            <strong>{msg.player}:</strong> {msg.text} <span className="text-gray-400 text-sm">{msg.timestamp}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
);
};

export default GameBoard;

