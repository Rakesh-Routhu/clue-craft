import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GameState } from '../types';
import { gameAPI } from '../api/gameAPI';
import { socketService } from '../api/socketService';
import GameBoard from '../components/GameBoard';
import PlayersList from '../components/PlayersList';
import CluePanel from '../components/CluePanel';
import GameStatus from '../components/GameStatus';

function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');

  useEffect(() => {
    if (!gameId || !playerId) return;

    // Connect to socket and join room
    // const socket = socketService.connect();
    socketService.joinRoom(gameId);

    // Listen for game updates
    socketService.onGameUpdated((data) => {
      setGame(data.game);
    });

    socketService.onError((error) => {
      setError(error.message);
    });

    // Load initial game state
    loadGameState();

    return () => {
      socketService.leaveRoom(gameId);
      socketService.offGameUpdated();
    };
  }, [gameId, playerId]);

  const loadGameState = async () => {
    if (!gameId) return;
    
    try {
      const response = await gameAPI.getGameState(gameId);
      if (response.success) {
        setGame(response.game);
      } else {
        setError('Failed to load game');
      }
    } catch (error) {
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;
    
    try {
      await gameAPI.startGame(gameId);
    } catch (error) {
      setError('Failed to start game');
    }
  };

  const handleSwitchTeam = async (team: any) => {
    if (!gameId || !playerId) return;
    
    try {
      socketService.emitGameAction(gameId, 'switch-team', {
        playerId,
        team
      });
    } catch (error) {
      setError('Failed to switch team');
    }
  };

  const handleSetRole = async (role: any) => {
    if (!gameId || !playerId) return;
    
    try {
      socketService.emitGameAction(gameId, 'set-role', {
        playerId,
        role
      });
    } catch (error) {
      setError('Failed to set role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error || 'Game not found'}</div>
      </div>
    );
  }

  const currentPlayer = playerId ? game.players[playerId] : null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Game {game.gameId}
              </h1>
              <p className="text-gray-600">
                Playing as: {playerName} ({currentPlayer?.team} {currentPlayer?.role})
              </p>
              {game.gameStatus === 'waiting' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1 max-w-md"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                  >
                    📋 Copy Link
                  </button>
                </div>
              )}
            </div>
            <GameStatus game={game} onStartGame={handleStartGame} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left sidebar - Players */}
          <div className="lg:col-span-1">
            <PlayersList 
              game={game} 
              currentPlayerId={playerId || ''} 
              onSwitchTeam={handleSwitchTeam}
              onSetRole={handleSetRole}
            />
          </div>

          {/* Main game area */}
          <div className="lg:col-span-2">
            <GameBoard 
              game={game} 
              currentPlayer={currentPlayer}
              onWordClick={(wordIndex) => {
                if (playerId) {
                  socketService.emitGameAction(game.gameId, 'make-guess', {
                    playerId,
                    wordIndex
                  });
                }
              }}
            />
          </div>

          {/* Right sidebar - Clues */}
          <div className="lg:col-span-1">
            <CluePanel 
              game={game}
              currentPlayer={currentPlayer}
              onGiveClue={(word, number) => {
                if (playerId) {
                  socketService.emitGameAction(game.gameId, 'give-clue', {
                    playerId,
                    word,
                    number
                  });
                }
              }}
              onEndTurn={() => {
                if (playerId) {
                  socketService.emitGameAction(game.gameId, 'end-turn', {
                    playerId
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;