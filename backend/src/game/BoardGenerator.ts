import { WordType } from '../types';

export class BoardGenerator {
  private readonly WORDS = [
    'HOLLYWOOD', 'WELL', 'FOOT', 'NEW YORK', 'SPRING', 'COURT', 'TUBE', 'POINT', 'TABLET', 'SLIP',
    'DATE', 'DRILL', 'LEMON', 'BELL', 'SCREEN', 'FAIR', 'TORCH', 'STATE', 'MATCH', 'IRON',
    'BLOCK', 'FRANCE', 'AUSTRALIA', 'LIMOUSINE', 'STREAM', 'GLOVE', 'NURSE', 'WIZARD', 'TOWER', 'BOND',
    'THUMB', 'MICROSCOPE', 'HOTEL', 'SHARK', 'BUTTERFLY', 'SHOVEL', 'WHISTLE', 'TAIL', 'PAINT', 'MOUTH',
    'MILLIONAIRE', 'LONDON', 'BRIDGE', 'APPLE', 'COMPUTER', 'HELICOPTER', 'PLASTIC', 'DUCK', 'STADIUM', 'FLUTE',
    'CAKE', 'TEACHER', 'EAGLE', 'FIRE', 'MOUNTAIN', 'GLASSES', 'GHOST', 'PIANO', 'AMBULANCE', 'BATTERY',
    'GOLD', 'GREECE', 'HOUSE', 'TELEPHONE', 'CHAIR', 'FISH', 'LASER', 'SCALE', 'SOAP', 'STONE',
    'FOREST', 'BANK', 'BOOM', 'CAT', 'SHOT', 'SUIT', 'CHOCOLATE', 'ROULETTE', 'MERCURY', 'MOON',
    'INDIA', 'DIAMOND', 'KNEE', 'PAPER', 'TURKEY', 'ROCK', 'ROBOT', 'GRASS', 'ROME', 'PRINCESS',
    'PIPE', 'LOCK', 'ENGLAND', 'POISON', 'SAND', 'SUNRISE', 'BUG', 'HEART', 'GERMANY', 'KNIFE',
    'MILITARY', 'BACK', 'CROWN', 'FIGHTER', 'MODEL', 'CHINA', 'PYRAMID', 'DANCE', 'FIRE', 'WATER'
  ];

  generateBoard(): { words: string[]; wordTypes: WordType[] } {
    // Select 25 random words
    const shuffled = [...this.WORDS].sort(() => Math.random() - 0.5);
    const words = shuffled.slice(0, 25);

    // Determine starting team (random)
    const startingTeam = Math.random() < 0.5 ? WordType.RED : WordType.BLUE;
    
    // Create word type assignments
    const wordTypes: WordType[] = [];
    
    // Starting team gets 9 words, other team gets 8
    const redWords = startingTeam === WordType.RED ? 9 : 8;
    const blueWords = startingTeam === WordType.BLUE ? 9 : 8;
    
    // Add word types: red words, blue words, 7 neutral, 1 assassin
    for (let i = 0; i < redWords; i++) wordTypes.push(WordType.RED);
    for (let i = 0; i < blueWords; i++) wordTypes.push(WordType.BLUE);
    for (let i = 0; i < 7; i++) wordTypes.push(WordType.NEUTRAL);
    wordTypes.push(WordType.ASSASSIN);

    // Shuffle the word types
    for (let i = wordTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordTypes[i], wordTypes[j]] = [wordTypes[j], wordTypes[i]];
    }

    return { words, wordTypes };
  }
}