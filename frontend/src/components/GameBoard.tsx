import { GameState, Player, WordType, PlayerRole } from '../types';

interface GameBoardProps {
  game: GameState;
  currentPlayer: Player | null;
  onWordClick: (wordIndex: number) => void;
}

function GameBoard({ game, currentPlayer, onWordClick }: GameBoardProps) {
  const getWordCardClass = (wordIndex: number) => {
    const wordType = game.wordTypes[wordIndex];
    const isGuessed = game.guesses.some(guess => guess.wordIndex === wordIndex);
    const isSpymaster = currentPlayer?.role === PlayerRole.SPYMASTER;

    let baseClass = "w-full h-20 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-105 cursor-pointer";
    
    if (isGuessed) {
      // Revealed words show their true colors
      switch (wordType) {
        case WordType.RED:
          return `${baseClass} bg-red-team border-red-600`;
        case WordType.BLUE:
          return `${baseClass} bg-blue-team border-blue-600`;
        case WordType.NEUTRAL:
          return `${baseClass} bg-neutral border-gray-500`;
        case WordType.ASSASSIN:
          return `${baseClass} bg-assassin border-black`;
        default:
          return `${baseClass} bg-gray-500`;
      }
    } else if (isSpymaster) {
      // Spymaster sees color hints
      switch (wordType) {
        case WordType.RED:
          return `${baseClass} bg-red-400 border-red-500 border-2`;
        case WordType.BLUE:
          return `${baseClass} bg-blue-400 border-blue-500 border-2`;
        case WordType.NEUTRAL:
          return `${baseClass} bg-gray-400 border-gray-500 border-2`;
        case WordType.ASSASSIN:
          return `${baseClass} bg-gray-800 border-black border-2`;
        default:
          return `${baseClass} bg-gray-500`;
      }
    } else {
      // Operatives see neutral cards
      return `${baseClass} bg-amber-100 border-amber-300 border-2 hover:bg-amber-200 text-yellow-700`;
    }
  };

  const canClickWord = (wordIndex: number) => {
    if (!currentPlayer) return false;
    if (currentPlayer.role !== PlayerRole.OPERATIVE) return false;
    if (currentPlayer.team !== game.currentTeam) return false;
    
    const isGuessed = game.guesses.some(guess => guess.wordIndex === wordIndex);
    return !isGuessed;
  };

  const handleWordClick = (wordIndex: number) => {
    if (canClickWord(wordIndex)) {
      onWordClick(wordIndex);
    }
  };

  if (!game.words.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Waiting to start game...
        </h2>
        <p className="text-gray-500">
          The game board will appear once the game starts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-5 gap-2 h-96">
        {game.words.map((word, index) => (
          <button
            key={index}
            onClick={() => handleWordClick(index)}
            disabled={!canClickWord(index)}
            className={getWordCardClass(index)}
          >
            <span className="text-sm font-bold uppercase tracking-wide">
              {word}
            </span>
          </button>
        ))}
      </div>
      
      {currentPlayer?.role === PlayerRole.SPYMASTER && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Spymaster Legend:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-team rounded"></div>
              <span>Red Team</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-team rounded"></div>
              <span>Blue Team</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-neutral rounded"></div>
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-assassin rounded"></div>
              <span>Assassin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;