import { GameState, Team, PlayerRole, GameStatus } from '../types';

interface PlayersListProps {
  game: GameState;
  currentPlayerId: string;
  onSwitchTeam?: (team: Team) => void;
  onSetRole?: (role: PlayerRole) => void;
}

function PlayersList({ game, currentPlayerId, onSwitchTeam, onSetRole }: PlayersListProps) {
  const players = Object.values(game.players);
  const redPlayers = players.filter(p => p.team === Team.RED);
  const bluePlayers = players.filter(p => p.team === Team.BLUE);

  const getPlayerClass = (playerId: string, team: Team) => {
    const baseClass = "p-2 rounded-lg flex justify-between items-center";
    const isCurrentPlayer = playerId === currentPlayerId;
    const teamClass = team === Team.RED ? "bg-red-100 border-red-300" : "bg-blue-100 border-blue-300";
    const currentPlayerClass = isCurrentPlayer ? "ring-2 ring-yellow-400" : "";
    
    return `${baseClass} ${teamClass} ${currentPlayerClass} border-2`;
  };

  const currentPlayer = game.players[currentPlayerId];
  const isWaiting = game.gameStatus === GameStatus.WAITING;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Players</h2>
      
      {/* Team Selection for Current Player in Lobby */}
      {isWaiting && currentPlayer && onSwitchTeam && onSetRole && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Your Settings</h3>
          
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 block mb-1">Team</label>
            <div className="flex gap-2">
              <button
                onClick={() => onSwitchTeam(Team.RED)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  currentPlayer.team === Team.RED
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔴 Red
              </button>
              <button
                onClick={() => onSwitchTeam(Team.BLUE)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  currentPlayer.team === Team.BLUE
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔵 Blue
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Role</label>
            <div className="flex gap-2">
              <button
                onClick={() => onSetRole(PlayerRole.OPERATIVE)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  currentPlayer.role === PlayerRole.OPERATIVE
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👤 Operative
              </button>
              <button
                onClick={() => onSetRole(PlayerRole.SPYMASTER)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  currentPlayer.role === PlayerRole.SPYMASTER
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🕵️ Spymaster
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Red Team */}
      <div className="mb-4">
        <h3 className="text-md font-medium text-red-600 mb-2 flex items-center">
          🔴 Red Team
          {game.currentTeam === Team.RED && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Current Turn
            </span>
          )}
        </h3>
        <div className="space-y-2">
          {redPlayers.map(player => (
            <div key={player.id} className={getPlayerClass(player.id, Team.RED)}>
              <div className="font-medium">{player.name}</div>
              <div className="text-sm text-gray-600">
                {player.role === PlayerRole.SPYMASTER ? '🕵️ Spymaster' : '👤 Operative'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blue Team */}
      <div>
        <h3 className="text-md font-medium text-blue-600 mb-2 flex items-center">
          🔵 Blue Team
          {game.currentTeam === Team.BLUE && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Current Turn
            </span>
          )}
        </h3>
        <div className="space-y-2">
          {bluePlayers.map(player => (
            <div key={player.id} className={getPlayerClass(player.id, Team.BLUE)}>
              <div className="font-medium">{player.name}</div>
              <div className="text-sm text-gray-600">
                {player.role === PlayerRole.SPYMASTER ? '🕵️ Spymaster' : '👤 Operative'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <div>Game ID: <span className="font-mono font-medium">{game.gameId}</span></div>
          <div>Status: <span className="font-medium">{game.gameStatus}</span></div>
        </div>
      </div>
    </div>
  );
}

export default PlayersList;