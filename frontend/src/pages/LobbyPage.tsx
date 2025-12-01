import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameState, Team, PlayerRole, GameStatus } from '../types';
import { gameAPI } from '../api/gameAPI';
import { socketService } from '../api/socketService';

function LobbyPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingGame, setStartingGame] = useState(false);
  
  const playerId = localStorage.getItem('playerId');

  useEffect(() => {
    if (!gameId || !playerId) {
      navigate('/');
      return;
    }

    // Connect to socket and join room
    socketService.connect();
    socketService.joinRoom(gameId);

    // Listen for game updates
    socketService.onGameUpdated((data) => {
      setGame(data.game);
      
      // If game has started, navigate to game page
      if (data.game.gameStatus === GameStatus.IN_PROGRESS) {
        navigate(`/game/${gameId}`);
      }
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
  }, [gameId, playerId, navigate]);

  const loadGameState = async () => {
    if (!gameId) return;
    
    try {
      const response = await gameAPI.getGameState(gameId);
      if (response.success) {
        setGame(response.game);
        
        // If game is already in progress, redirect to game page
        if (response.game.gameStatus === GameStatus.IN_PROGRESS) {
          navigate(`/game/${gameId}`);
        }
      } else {
        setError('Failed to load game');
      }
    } catch (error) {
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTeam = async (team: Team) => {
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

  const handleSetRole = async (role: PlayerRole) => {
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

  const handleStartGame = async () => {
    if (!gameId) return;
    
    setStartingGame(true);
    setError(null);
    
    try {
      const response = await gameAPI.startGame(gameId);
      if (!response.success) {
        setError(response.error || 'Failed to start game');
      }
    } catch (error) {
      setError('Failed to start game');
    } finally {
      setStartingGame(false);
    }
  };

  const currentPlayer = game && playerId ? game.players[playerId] : null;
  const redPlayers = game ? Object.values(game.players).filter(p => p.team === Team.RED) : [];
  const bluePlayers = game ? Object.values(game.players).filter(p => p.team === Team.BLUE) : [];
  
  const canStartGame = game && Object.keys(game.players).length >= 4 && 
                       redPlayers.length > 0 && bluePlayers.length > 0 &&
                       game.spymasters.red && game.spymasters.blue;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading lobby...</div>
      </div>
    );
  }

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Game not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🕵️ clue-craft Lobby</h1>
              <p className="text-gray-600 mt-1">Game ID: <span className="font-mono font-bold">{gameId}</span></p>
            </div>
            <button
              onClick={handleStartGame}
              disabled={!canStartGame || startingGame}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
              title={!canStartGame ? 'Need at least 4 players (2 per team) and both teams need spymasters' : 'Start the game'}
            >
              {startingGame ? 'Starting...' : 'Start Game'}
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {!canStartGame && (
            <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              {Object.keys(game.players).length < 4 && 'Need at least 4 players to start. '}
              {(!game.spymasters.red || !game.spymasters.blue) && 'Both teams need a spymaster. '}
              {(redPlayers.length === 0 || bluePlayers.length === 0) && 'Both teams need at least one player.'}
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Red Team */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-red-500 text-white p-4">
              <h2 className="text-2xl font-bold">Red Team ({redPlayers.length})</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {redPlayers.length === 0 ? (
                  <p className="text-gray-500 italic">No players yet</p>
                ) : (
                  redPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border-2 ${
                        player.id === playerId 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{player.name}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          player.role === PlayerRole.SPYMASTER
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {player.role === PlayerRole.SPYMASTER ? '🕵️ Spymaster' : 'Operative'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {currentPlayer.team === Team.RED ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your role:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetRole(PlayerRole.OPERATIVE)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        currentPlayer.role === PlayerRole.OPERATIVE
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Operative
                    </button>
                    <button
                      onClick={() => handleSetRole(PlayerRole.SPYMASTER)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        currentPlayer.role === PlayerRole.SPYMASTER
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={!!(game.spymasters.red && game.spymasters.red !== playerId)}
                      title={game.spymasters.red && game.spymasters.red !== playerId ? 'Team already has a spymaster' : ''}
                    >
                      🕵️ Spymaster
                    </button>
                  </div>
                  <button
                    onClick={() => handleSwitchTeam(Team.BLUE)}
                    className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Switch to Blue Team
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSwitchTeam(Team.RED)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Join Red Team
                </button>
              )}
            </div>
          </div>

          {/* Blue Team */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h2 className="text-2xl font-bold">Blue Team ({bluePlayers.length})</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {bluePlayers.length === 0 ? (
                  <p className="text-gray-500 italic">No players yet</p>
                ) : (
                  bluePlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border-2 ${
                        player.id === playerId 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{player.name}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          player.role === PlayerRole.SPYMASTER
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {player.role === PlayerRole.SPYMASTER ? '🕵️ Spymaster' : 'Operative'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {currentPlayer.team === Team.BLUE ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your role:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetRole(PlayerRole.OPERATIVE)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        currentPlayer.role === PlayerRole.OPERATIVE
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Operative
                    </button>
                    <button
                      onClick={() => handleSetRole(PlayerRole.SPYMASTER)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        currentPlayer.role === PlayerRole.SPYMASTER
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={!!(game.spymasters.blue && game.spymasters.blue !== playerId)}
                      title={game.spymasters.blue && game.spymasters.blue !== playerId ? 'Team already has a spymaster' : ''}
                    >
                      🕵️ Spymaster
                    </button>
                  </div>
                  <button
                    onClick={() => handleSwitchTeam(Team.RED)}
                    className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Switch to Red Team
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSwitchTeam(Team.BLUE)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Join Blue Team
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Rules Info */}
        <div className="mt-6 bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">How to Play</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Each team needs at least one player and one spymaster</li>
            <li>• Spymasters give one-word clues to help their team guess the correct words</li>
            <li>• Operatives make guesses based on the clues</li>
            <li>• First team to reveal all their words wins!</li>
            <li>• Avoid the assassin word - it's an instant loss!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LobbyPage;
