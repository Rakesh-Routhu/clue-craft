import { GameState, Player, Team, PlayerRole, GameStatus, Clue, Guess, WordType } from '../types';
import { BoardGenerator } from './BoardGenerator';
import { RulesEngine } from './RulesEngine';

export class GameManager {
  private static instance: GameManager;
  private games: Map<string, GameState> = new Map();
  private boardGenerator = new BoardGenerator();
  private rulesEngine = new RulesEngine();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  createGame(playerName: string): GameState {
    const gameId = this.generateGameId();
    const playerId = this.generatePlayerId();
    
    const player: Player = {
      id: playerId,
      name: playerName,
      team: Team.RED, // First player defaults to red team
      role: PlayerRole.OPERATIVE // Defaults to operative, can be changed
    };

    const game: GameState = {
      gameId,
      words: [],
      wordTypes: [],
      currentTeam: Team.RED,
      spymasters: {},
      players: { [playerId]: player },
      clues: [],
      guesses: [],
      gameStatus: GameStatus.WAITING,
    };

    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId: string, playerName: string): { playerId: string; game: GameState } {
    const game = this.getGame(gameId);
    
    if (game.gameStatus !== GameStatus.WAITING) {
      throw new Error('Game already in progress');
    }

    const playerCount = Object.keys(game.players).length;
    if (playerCount >= 8) {
      throw new Error('Game is full (maximum 8 players)');
    }

    const playerId = this.generatePlayerId();
    
    // New players start without a team - they'll choose their own
    const player: Player = {
      id: playerId,
      name: playerName,
      team: Team.RED, // Default to red, can be changed
      role: PlayerRole.OPERATIVE // Default to operative, can be changed
    };

    game.players[playerId] = player;
    
    return { playerId, game };
  }

  switchTeam(gameId: string, playerId: string, newTeam: Team): void {
    const game = this.getGame(gameId);
    
    if (game.gameStatus !== GameStatus.WAITING) {
      throw new Error('Cannot switch teams after game has started');
    }

    const player = game.players[playerId];
    if (!player) {
      throw new Error('Player not found');
    }

    // If player was a spymaster, remove them from spymasters list
    if (player.role === PlayerRole.SPYMASTER) {
      if (player.team === Team.RED && game.spymasters.red === playerId) {
        game.spymasters.red = undefined;
      } else if (player.team === Team.BLUE && game.spymasters.blue === playerId) {
        game.spymasters.blue = undefined;
      }
    }

    player.team = newTeam;
  }

  setRole(gameId: string, playerId: string, newRole: PlayerRole): void {
    const game = this.getGame(gameId);
    
    if (game.gameStatus !== GameStatus.WAITING) {
      throw new Error('Cannot change roles after game has started');
    }

    const player = game.players[playerId];
    if (!player) {
      throw new Error('Player not found');
    }

    // If trying to become spymaster, check if team already has one
    if (newRole === PlayerRole.SPYMASTER) {
      const teamSpymaster = player.team === Team.RED ? game.spymasters.red : game.spymasters.blue;
      if (teamSpymaster && teamSpymaster !== playerId) {
        throw new Error(`${player.team} team already has a spymaster`);
      }
    }

    // Remove from spymasters if changing away from spymaster
    if (player.role === PlayerRole.SPYMASTER && newRole !== PlayerRole.SPYMASTER) {
      if (player.team === Team.RED && game.spymasters.red === playerId) {
        game.spymasters.red = undefined;
      } else if (player.team === Team.BLUE && game.spymasters.blue === playerId) {
        game.spymasters.blue = undefined;
      }
    }

    player.role = newRole;

    // Add to spymasters if becoming spymaster
    if (newRole === PlayerRole.SPYMASTER) {
      if (player.team === Team.RED) {
        game.spymasters.red = playerId;
      } else {
        game.spymasters.blue = playerId;
      }
    }
  }

  startGame(gameId: string): void {
    const game = this.getGame(gameId);
    
    if (game.gameStatus !== GameStatus.WAITING) {
      throw new Error('Game already started');
    }

    const playerCount = Object.keys(game.players).length;
    if (playerCount < 4) {
      throw new Error('Need at least 4 players to start (2 per team)');
    }

    // Check that both teams have at least one player
    const players = Object.values(game.players);
    const redPlayers = players.filter(p => p.team === Team.RED);
    const bluePlayers = players.filter(p => p.team === Team.BLUE);

    if (redPlayers.length === 0 || bluePlayers.length === 0) {
      throw new Error('Both teams need at least one player');
    }

    // Check that both teams have a spymaster
    if (!game.spymasters.red || !game.spymasters.blue) {
      throw new Error('Both teams need a spymaster');
    }

    // Generate board
    const { words, wordTypes } = this.boardGenerator.generateBoard();
    game.words = words;
    game.wordTypes = wordTypes;
    game.gameStatus = GameStatus.IN_PROGRESS;
    
    // Determine starting team based on word distribution
    const redWords = wordTypes.filter(type => type === WordType.RED).length;
    game.currentTeam = redWords === 9 ? Team.RED : Team.BLUE;
  }

  giveClue(gameId: string, playerId: string, word: string, number: number): void {
    const game = this.getGame(gameId);
    
    this.rulesEngine.validateClue(game, playerId, word, number);
    
    const clue: Clue = {
      spymaster: playerId,
      team: game.currentTeam,
      word: word.trim(),
      number,
      timestamp: Date.now()
    };

    game.clues.push(clue);
  }

  makeGuess(gameId: string, playerId: string, wordIndex: number): { correct: boolean; shouldEndTurn: boolean; winner?: Team } {
    const game = this.getGame(gameId);
    
    this.rulesEngine.validateGuess(game, playerId, wordIndex);
    
    const wordType = game.wordTypes[wordIndex];
    const currentTeam = game.currentTeam;
    
    // Determine if guess is correct
    const correct = (wordType === WordType.RED && currentTeam === Team.RED) ||
                   (wordType === WordType.BLUE && currentTeam === Team.BLUE);

    const guess: Guess = {
      player: playerId,
      wordIndex,
      timestamp: Date.now(),
      correct
    };

    game.guesses.push(guess);

    // Check for end turn conditions
    const shouldEndTurn = this.rulesEngine.shouldEndTurn(game, wordIndex);
    
    if (shouldEndTurn) {
      this.switchTurn(game);
    }

    // Check win conditions
    const winner = this.rulesEngine.checkWinCondition(game);
    if (winner) {
      game.winner = winner;
      game.gameStatus = GameStatus.COMPLETED;
    }

    return { correct, shouldEndTurn, winner: winner || undefined };
  }

  endTurn(gameId: string, playerId: string): void {
    const game = this.getGame(gameId);
    const player = game.players[playerId];
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.team !== game.currentTeam) {
      throw new Error('Not your team\'s turn');
    }

    if (game.gameStatus !== GameStatus.IN_PROGRESS) {
      throw new Error('Game is not in progress');
    }

    this.switchTurn(game);
  }

  getGame(gameId: string): GameState {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    return game;
  }

  private switchTurn(game: GameState): void {
    game.currentTeam = game.currentTeam === Team.RED ? Team.BLUE : Team.RED;
  }

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}