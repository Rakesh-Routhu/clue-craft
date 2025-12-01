export interface GameState {
  gameId: string;
  words: string[];
  wordTypes: WordType[];
  currentTeam: Team;
  spymasters: { red?: string; blue?: string };
  players: { [playerId: string]: Player };
  clues: Clue[];
  guesses: Guess[];
  gameStatus: GameStatus;
  winner?: Team;
}

export interface Player {
  id: string;
  name: string;
  team: Team;
  role: PlayerRole;
}

export interface Clue {
  spymaster: string;
  team: Team;
  word: string;
  number: number;
  timestamp: number;
}

export interface Guess {
  player: string;
  wordIndex: number;
  timestamp: number;
  correct: boolean;
}

export enum Team {
  RED = 'red',
  BLUE = 'blue'
}

export enum WordType {
  RED = 'red',
  BLUE = 'blue',
  NEUTRAL = 'neutral',
  ASSASSIN = 'assassin'
}

export enum PlayerRole {
  SPYMASTER = 'spymaster',
  OPERATIVE = 'operative'
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}