import { GameState, GameStatus as GameStatusEnum } from '../types';

interface GameStatusProps {
  game: GameState;
  onStartGame: () => void;
}

function GameStatus({ game, onStartGame }: GameStatusProps) {
  const playerCount = Object.keys(game.players).length;
  const players = Object.values(game.players);
  const redPlayers = players.filter(p => p.team === 'red');
  const bluePlayers = players.filter(p => p.team === 'blue');
  const hasRedSpymaster = game.spymasters.red !== undefined;
  const hasBlueSpymaster = game.spymasters.blue !== undefined;

  if (game.gameStatus === GameStatusEnum.WAITING) {
    const canStart = playerCount >= 4 && 
                     redPlayers.length > 0 && 
                     bluePlayers.length > 0 && 
                     hasRedSpymaster && 
                     hasBlueSpymaster;

    return (
      <div className="flex flex-col items-end gap-2">
        <div className="text-sm text-gray-600">
          Players: {playerCount} | Red: {redPlayers.length} | Blue: {bluePlayers.length}
        </div>
        {!canStart && (
          <div className="text-xs text-orange-600">
            {playerCount < 4 && '⚠️ Need at least 4 players'}
            {playerCount >= 4 && (redPlayers.length === 0 || bluePlayers.length === 0) && '⚠️ Both teams need players'}
            {playerCount >= 4 && (!hasRedSpymaster || !hasBlueSpymaster) && '⚠️ Both teams need a spymaster'}
          </div>
        )}
        <button
          onClick={onStartGame}
          disabled={!canStart}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (game.gameStatus === GameStatusEnum.COMPLETED) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-green-600">
          🎉 {game.winner?.toUpperCase()} Team Wins!
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-green-600 font-medium">
        Game In Progress
      </span>
    </div>
  );
}

export default GameStatus;