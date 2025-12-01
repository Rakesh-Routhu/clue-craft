import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../api/gameAPI';

function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.createGame(playerName.trim());
      if (response.success) {
        localStorage.setItem('playerId', response.playerId);
        localStorage.setItem('playerName', playerName.trim());
        navigate(`/lobby/${response.gameId}`);
      }
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameId.trim()) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.joinGame(gameId.trim(), playerName.trim());
      if (response.success) {
        localStorage.setItem('playerId', response.playerId);
        localStorage.setItem('playerName', playerName.trim());
        navigate(`/lobby/${gameId.trim()}`);
      }
    } catch (error) {
      console.error('Failed to join game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🕵️ clue-craft
        </h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCreateGame}
              disabled={!playerName.trim() || loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </button>

            <div className="text-center text-gray-500">or</div>

            <div>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                placeholder="Game ID"
                maxLength={6}
              />
              <button
                onClick={handleJoinGame}
                disabled={!playerName.trim() || !gameId.trim() || loading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;