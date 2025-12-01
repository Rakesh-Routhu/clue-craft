import { useState } from 'react';
import { GameState, Player, PlayerRole, Team } from '../types';

interface CluePanelProps {
  game: GameState;
  currentPlayer: Player | null;
  onGiveClue: (word: string, number: number) => void;
  onEndTurn: () => void;
}

function CluePanel({ game, currentPlayer, onGiveClue, onEndTurn }: CluePanelProps) {
  const [clueWord, setClueWord] = useState('');
  const [clueNumber, setClueNumber] = useState(1);

  const canGiveClue = currentPlayer?.role === PlayerRole.SPYMASTER && 
                     currentPlayer?.team === game.currentTeam;

  const canEndTurn = currentPlayer?.team === game.currentTeam;

  const handleGiveClue = () => {
    if (clueWord.trim() && clueNumber >= 0 && clueNumber <= 9) {
      onGiveClue(clueWord.trim(), clueNumber);
      setClueWord('');
      setClueNumber(1);
    }
  };

  const getCurrentClue = () => {
    // Find when this team's turn started by looking for the most recent guess from the OTHER team
    let turnStartTime = 0;
    for (let i = game.guesses.length - 1; i >= 0; i--) {
      const guess = game.guesses[i];
      const guessingPlayer = game.players[guess.player];
      if (guessingPlayer.team !== game.currentTeam) {
        turnStartTime = guess.timestamp;
        break;
      }
    }
    
    // Get the most recent clue for the current team given after the turn started
    return game.clues
      .filter(clue => clue.team === game.currentTeam && clue.timestamp >= turnStartTime)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const getCurrentTurnGuesses = () => {
    const currentClue = getCurrentClue();
    if (!currentClue) return [];
    
    return game.guesses.filter(guess => {
      const guessingPlayer = game.players[guess.player];
      return guess.timestamp > currentClue.timestamp && 
             guessingPlayer.team === game.currentTeam;
    });
  };

  const currentClue = getCurrentClue();
  const currentTurnGuesses = getCurrentTurnGuesses();
  const remainingGuesses = currentClue ? (currentClue.number + 1) - currentTurnGuesses.length : 0;

  return (
    <div className="space-y-4">
      {/* Current Clue */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Current Clue</h2>
        
        {currentClue ? (
          <div className={`p-3 rounded-lg ${game.currentTeam === Team.RED ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border-2`}>
            <div className="text-lg font-bold">
              "{currentClue.word}" - {currentClue.number}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Guesses remaining: {Math.max(0, remainingGuesses)}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No clue given yet
          </div>
        )}
      </div>

      {/* Give Clue (Spymaster only) */}
      {canGiveClue && !currentClue && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-md font-semibold mb-3 text-gray-800">Give Clue</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clue Word
              </label>
              <input
                type="text"
                value={clueWord}
                onChange={(e) => setClueWord(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter clue word"
                maxLength={20}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number
              </label>
              <select
                value={clueNumber}
                onChange={(e) => setClueNumber(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleGiveClue}
              disabled={!clueWord.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Give Clue
            </button>
          </div>
        </div>
      )}

      {/* End Turn */}
      {canEndTurn && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <button
            onClick={onEndTurn}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            End Turn
          </button>
        </div>
      )}

      {/* Clue History */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-md font-semibold mb-3 text-gray-800">Clue History</h3>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {game.clues.length === 0 ? (
            <div className="text-gray-500 italic text-sm">
              No clues given yet
            </div>
          ) : (
            game.clues
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((clue, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    clue.team === Team.RED 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  } border`}
                >
                  <div className="font-medium">
                    "{clue.word}" - {clue.number}
                  </div>
                  <div className="text-xs text-gray-500">
                    {clue.team} team
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CluePanel;