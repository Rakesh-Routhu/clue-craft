import { GameState, Team, WordType, GameStatus, PlayerRole } from '../types';

export class RulesEngine {
  
  checkWinCondition(game: GameState): Team | null {
    // Check if assassin was hit
    const assassinGuess = game.guesses.find(guess => 
      game.wordTypes[guess.wordIndex] === WordType.ASSASSIN
    );
    if (assassinGuess) {
      const guessingPlayer = game.players[assassinGuess.player];
      // Team that hit assassin loses, other team wins
      return guessingPlayer.team === Team.RED ? Team.BLUE : Team.RED;
    }

    // Count remaining words for each team
    const redIndices = game.wordTypes.map((type, index) => 
      type === WordType.RED ? index : -1
    ).filter(index => index !== -1);
    
    const blueIndices = game.wordTypes.map((type, index) => 
      type === WordType.BLUE ? index : -1
    ).filter(index => index !== -1);

    const guessedIndices = game.guesses.map(guess => guess.wordIndex);
    
    const redRemaining = redIndices.filter(index => !guessedIndices.includes(index));
    const blueRemaining = blueIndices.filter(index => !guessedIndices.includes(index));

    if (redRemaining.length === 0) return Team.RED;
    if (blueRemaining.length === 0) return Team.BLUE;

    return null;
  }

  validateClue(game: GameState, playerId: string, word: string, number: number): void {
    const player = game.players[playerId];
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.role !== PlayerRole.SPYMASTER) {
      throw new Error('Only spymasters can give clues');
    }

    if (player.team !== game.currentTeam) {
      throw new Error('Not your team\'s turn');
    }

    if (game.gameStatus !== GameStatus.IN_PROGRESS) {
      throw new Error('Game is not in progress');
    }

    // Check if team has already given a clue this turn
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
    
    const currentTurnClues = game.clues.filter(clue => 
      clue.team === game.currentTeam && 
      clue.timestamp >= turnStartTime
    );
    
    if (currentTurnClues.length > 0) {
      throw new Error('Clue already given this turn');
    }

    if (number < 0 || number > 9) {
      throw new Error('Number must be between 0 and 9');
    }

    if (!word || word.trim().length === 0) {
      throw new Error('Clue word cannot be empty');
    }

    // Check if clue word matches any board word
    const lowerClue = word.toLowerCase().trim();
    const matchesBoard = game.words.some(boardWord => 
      boardWord.toLowerCase().includes(lowerClue) || lowerClue.includes(boardWord.toLowerCase())
    );
    
    if (matchesBoard) {
      throw new Error('Clue word cannot be related to words on the board');
    }
  }

  validateGuess(game: GameState, playerId: string, wordIndex: number): void {
    const player = game.players[playerId];
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.role !== PlayerRole.OPERATIVE) {
      throw new Error('Only operatives can make guesses');
    }

    if (player.team !== game.currentTeam) {
      throw new Error('Not your team\'s turn');
    }

    if (game.gameStatus !== GameStatus.IN_PROGRESS) {
      throw new Error('Game is not in progress');
    }

    if (wordIndex < 0 || wordIndex >= 25) {
      throw new Error('Invalid word index');
    }

    // Check if word already guessed
    const alreadyGuessed = game.guesses.some(guess => guess.wordIndex === wordIndex);
    if (alreadyGuessed) {
      throw new Error('Word already guessed');
    }

    // Check if team has exceeded guess limit
    const currentClue = this.getCurrentClue(game);
    if (!currentClue) {
      throw new Error('No clue given yet');
    }

    const currentTurnGuesses = this.getCurrentTurnGuesses(game);
    const maxGuesses = currentClue.number + 1; // Clue number + 1 bonus guess
    
    if (currentTurnGuesses.length >= maxGuesses) {
      throw new Error('Maximum guesses exceeded');
    }
  }

  shouldEndTurn(game: GameState, wordIndex: number): boolean {
    const wordType = game.wordTypes[wordIndex];
    const currentTeam = game.currentTeam;

    // End turn if wrong team's word, neutral, or assassin
    if (wordType === WordType.ASSASSIN) return true;
    if (wordType === WordType.NEUTRAL) return true;
    if (wordType === WordType.RED && currentTeam === Team.BLUE) return true;
    if (wordType === WordType.BLUE && currentTeam === Team.RED) return true;

    return false;
  }

  private getCurrentClue(game: GameState) {
    // Find the most recent clue for the current team
    // We need to find clues that were given during this turn (after the last turn switch)
    
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
  }

  private getCurrentTurnGuesses(game: GameState) {
    const currentClue = this.getCurrentClue(game);
    if (!currentClue) return [];

    return game.guesses.filter(guess => 
      guess.timestamp > currentClue.timestamp &&
      game.players[guess.player].team === game.currentTeam
    );
  }
}