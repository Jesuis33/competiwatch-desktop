import Database from "./Database";
import Season from "./Season";
import { Map } from "./Map";
import {
  HeroesByRole,
  HeroRole,
  Hero,
  HeroesByType,
  HeroDetailedRole
} from "./Hero";
import DayTimeApproximator, {
  DayOfWeek,
  TimeOfDay
} from "./DayTimeApproximator";

export type MatchResult = "win" | "loss" | "draw";

const roleFor = (hero: Hero): HeroDetailedRole | null => {
  if (HeroesByType.DPS.includes(hero)) {
    return "DPS";
  }
  if (HeroesByType["Main Healer"].includes(hero)) {
    return "Main Healer";
  }
  if (HeroesByType["Off-healer"].includes(hero)) {
    return "Off-healer";
  }
  if (HeroesByType.Flanker.includes(hero)) {
    return "Flanker";
  }
  if (HeroesByType.Defense.includes(hero)) {
    return "Defense";
  }
  if (HeroesByType.Hitscan.includes(hero)) {
    return "Hitscan";
  }
  if (HeroesByType["Main Tank"].includes(hero)) {
    return "Main Tank";
  }
  if (HeroesByType["Off-tank"].includes(hero)) {
    return "Off-tank";
  }
  return null;
};

const getPriorMatch = (match: Match, prevMatches: Match[]) => {
  if (match.season >= Season.roleQueueSeasonStart) {
    const prevMatchesInRole = prevMatches.filter(m => m.role === match.role);
    return prevMatchesInRole[prevMatchesInRole.length - 1];
  }

  return prevMatches[prevMatches.length - 1];
};

const matchRankChange = (match: Match, prevMatches: Match[]) => {
  if (!match || prevMatches.length < 1) {
    return;
  }
  const priorMatch = getPriorMatch(match, prevMatches);
  if (!priorMatch) {
    return;
  }
  if (typeof match.rank === "number" && typeof priorMatch.rank === "number") {
    return match.rank - priorMatch.rank;
  }
};

const matchResult = (match: Match, prevMatches: Match[]) => {
  if (match.result) {
    return match.result;
  }

  if (prevMatches.length > 0) {
    const priorMatch = getPriorMatch(match, prevMatches);
    if (!priorMatch) {
      return;
    }
    if (match.rank && priorMatch.rank && match.rank > priorMatch.rank) {
      return "win";
    }

    if (match.rank === priorMatch.rank) {
      return "draw";
    }

    return "loss";
  }
};

const cleanupCommaList = (str?: string) => {
  if (!str) {
    return "";
  }

  const items = str
    .split(",")
    .map(str => str.trim())
    .filter(str => str && str.length > 0);
  items.sort();
  return items.join(",");
};

const getWinStreak = (
  index: number,
  matches: Match[],
  count: number
): number => {
  const match = matches[index];
  if (!match || !match.isWin()) {
    return count;
  }

  const prevMatch = matches[index - 1];
  if (prevMatch && prevMatch.isWin()) {
    return getWinStreak(index - 1, matches, count + 1);
  }

  return getWinStreak(index - 1, matches, count);
};

const getLossStreak = (
  index: number,
  matches: Match[],
  count: number
): number => {
  const match = matches[index];
  if (!match || !match.isLoss()) {
    return count;
  }

  const prevMatch = matches[index - 1];
  if (prevMatch && prevMatch.isLoss()) {
    return getLossStreak(index - 1, matches, count + 1);
  }

  return getLossStreak(index - 1, matches, count);
};

const defaultSort = { playedAt: 1, createdAt: 1 };

function guessRoleFromHeroesPlayed(season: number, heroList: Hero[]) {
  if (season < Season.roleQueueSeasonStart) {
    return null;
  }
  if (heroList.length < 1) {
    return null;
  }
  let playedSupport = false;
  let playedDamage = false;
  let playedTank = false;
  for (const hero of heroList) {
    if (HeroesByRole.Tank.indexOf(hero) > -1) {
      playedTank = true;
    } else if (HeroesByRole.Support.indexOf(hero) > -1) {
      playedSupport = true;
    } else if (HeroesByRole.Damage.indexOf(hero) > -1) {
      playedDamage = true;
    }
  }
  if (playedSupport && !playedDamage && !playedTank) {
    return "Support";
  }
  if (playedDamage && !playedSupport && !playedTank) {
    return "Damage";
  }
  if (playedTank && !playedDamage && !playedSupport) {
    return "Tank";
  }
  return null;
}

interface MatchConditions {
  isPlacement?: boolean;
  season?: number;
  accountID?: string;
  role?: HeroRole | null;
}

export interface MatchData {
  _id?: string;
  accountID: string;
  comment?: string;
  season: string | number;
  openQueue?: boolean;
  map?: Map;
  isPlacement?: boolean;
  result?: MatchResult;
  rank?: number | string;
  groupSize?: number | string;
  group?: string;
  heroes?: string;
  role?: HeroRole | null;
  createdAt?: string | Date;
  playedAt?: string | Date;
  dayOfWeek?: DayOfWeek;
  timeOfDay?: TimeOfDay;
  enemyThrower?: boolean;
  allyThrower?: boolean;
  enemyLeaver?: boolean;
  allyLeaver?: boolean;
  enemyCheater?: boolean;
  allyCheater?: boolean;
  playOfTheGame?: boolean;
  joinedVoice?: boolean;
}

class Match {
  result?: MatchResult;
  rank?: number;
  season: number;
  openQueue: boolean;
  accountID: string;
  _id?: string;
  createdAt?: Date;
  rankChange?: number;
  comment?: string;
  map?: Map;
  isPlacement?: boolean;
  winStreak?: number;
  lossStreak?: number;
  groupSize?: number;
  group?: string;
  heroes?: string;
  heroList: Hero[];
  groupList: string[];
  role: HeroRole | null;
  playedAt?: Date;
  dayOfWeek?: DayOfWeek;
  timeOfDay?: TimeOfDay;
  enemyThrower?: boolean;
  allyThrower?: boolean;
  enemyLeaver?: boolean;
  allyLeaver?: boolean;
  enemyCheater?: boolean;
  allyCheater?: boolean;
  playOfTheGame?: boolean;
  joinedVoice?: boolean;

  static async wipeSeason(accountID: string, season: Season) {
    const matches = await Match.findAll(accountID, season);
    const promises = matches.map(match => match._id && Match.delete(match._id));
    return Promise.all(promises);
  }

  static totalInSeason(season: Season) {
    return season.totalMatches();
  }

  static async find(id: string) {
    const data: MatchData = await Database.find("matches", id);
    return new Match(data);
  }

  static async findAll(accountID: string, season: Season, openQueue?: boolean) {
    const conditions: any = { accountID, season: season.number };
    if (typeof openQueue === 'boolean') {
      conditions.openQueue = openQueue;
    }
    let rows: MatchData[] = await Database.findAll("matches",
      defaultSort, conditions);
    if (season.number < Season.openQueueSeasonStart && rows.length < 1) {
      const moreRows: MatchData[] = await Database.findAll("matches", defaultSort, {
        accountID, season: season.number
      });
      rows = rows.concat(moreRows);
    }
    const matches: Match[] = rows.map(data => new Match(data));

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const prevMatches = matches.slice(0, i);

      match.rankChange = matchRankChange(match, prevMatches);

      if (!match.result) {
        match.result = matchResult(match, prevMatches);
      }

      if (match.isWin()) {
        match.winStreak = getWinStreak(i, matches, 1);
      } else if (match.isLoss()) {
        match.lossStreak = getLossStreak(i, matches, 1);
      }
    }

    return matches;
  }

  constructor(data: MatchData) {
    this.accountID = data.accountID;
    if (data._id) {
      this._id = data._id;
    }
    this.comment = data.comment;

    if (typeof data.season === "number") {
      this.season = data.season;
    } else {
      this.season = parseInt(data.season, 10);
    }
    if (typeof data.openQueue === "boolean") {
      this.openQueue = data.openQueue;
    } else {
      this.openQueue = this.season < Season.roleQueueSeasonStart;
    }

    this.map = data.map;
    this.isPlacement = data.isPlacement;
    this.result = data.result;

    if (typeof data.groupSize === "number" && !isNaN(data.groupSize)) {
      this.groupSize = data.groupSize;
    } else if (typeof data.groupSize === "string") {
      this.groupSize = parseInt(data.groupSize, 10);
    }

    if (typeof data.rank === "number" && !isNaN(data.rank)) {
      this.rank = data.rank;
    } else if (typeof data.rank === "string") {
      this.rank = parseInt(data.rank, 10);
    }

    this.group = cleanupCommaList(data.group);
    this.groupList = [];
    if (this.group.length > 0) {
      this.groupList = this.group.split(",");
    }

    if (typeof this.groupSize !== "number") {
      this.groupSize = this.groupList.length + 1;
    }

    this.heroes = cleanupCommaList(data.heroes);
    this.heroList = [];
    if (this.heroes.length > 0) {
      this.heroList = this.heroes.split(",").map(str => str as Hero);
    }

    this.role =
      data.role || guessRoleFromHeroesPlayed(this.season, this.heroList);
    if (typeof this.role === "string" && this.role.length < 1) {
      this.role = null;
    }

    if (typeof data.playedAt === "string") {
      this.playedAt = new Date(data.playedAt);
    } else if (
      data.playedAt &&
      typeof data.playedAt === "object" &&
      data.playedAt.constructor.name === "Date"
    ) {
      this.playedAt = data.playedAt;
    }

    if (this.playedAt) {
      this.dayOfWeek = DayTimeApproximator.dayOfWeek(this.playedAt);
      this.timeOfDay = DayTimeApproximator.timeOfDay(this.playedAt);
    }
    if (data.dayOfWeek) {
      this.dayOfWeek = data.dayOfWeek;
    }
    if (data.timeOfDay) {
      this.timeOfDay = data.timeOfDay;
    }

    this.enemyThrower = data.enemyThrower;
    this.allyThrower = data.allyThrower;
    this.enemyLeaver = data.enemyLeaver;
    this.allyLeaver = data.allyLeaver;
    this.enemyCheater = data.enemyCheater;
    this.allyCheater = data.allyCheater;

    this.playOfTheGame = data.playOfTheGame;
    this.joinedVoice = data.joinedVoice;

    if (typeof data.createdAt === "string") {
      this.createdAt = new Date(data.createdAt);
    } else if (
      data.createdAt &&
      typeof data.createdAt === "object" &&
      data.createdAt.constructor.name === "Date"
    ) {
      this.createdAt = data.createdAt;
    }
  }

  hasBadActor() {
    return this.hasThrower() || this.hasLeaver() || this.hasCheater();
  }

  hasThrower() {
    return this.allyThrower || this.enemyThrower;
  }

  hasLeaver() {
    return this.allyLeaver || this.enemyLeaver;
  }

  hasCheater() {
    return this.allyCheater || this.enemyCheater;
  }

  isWin() {
    return this.result === "win";
  }

  isDraw() {
    return this.result === "draw";
  }

  isLoss() {
    return this.result === "loss";
  }

  detailedRoles() {
    if (this.heroList.length < 1) {
      return [];
    }
    const detailedRoles: HeroDetailedRole[] = [];
    for (const hero of this.heroList) {
      const role = roleFor(hero);
      if (role) {
        detailedRoles.push(role);
      }
    }
    return detailedRoles;
  }

  async isLastPlacement() {
    if (!this.isPlacement) {
      return false;
    }

    const conditions: MatchConditions = {
      isPlacement: true,
      season: this.season,
      accountID: this.accountID
    };
    let totalPlacementMatches = 10;
    if (this.season >= Season.roleQueueSeasonStart) {
      totalPlacementMatches = 5;
      conditions.role = this.role;
    }
    const placementRows = await Database.findAll(
      "matches",
      defaultSort,
      conditions
    );

    if (placementRows.length < totalPlacementMatches) {
      return false;
    }

    const lastPlacement = placementRows[totalPlacementMatches - 1];
    return lastPlacement && lastPlacement._id === this._id;
  }

  async save() {
    const data: MatchData = {
      rank: this.rank,
      comment: this.comment,
      map: this.map,
      group: this.group,
      groupSize: this.groupSize,
      heroes: this.heroes,
      accountID: this.accountID,
      playedAt: this.playedAt,
      timeOfDay: this.timeOfDay,
      dayOfWeek: this.dayOfWeek,
      isPlacement: this.isPlacement,
      enemyThrower: this.enemyThrower,
      allyThrower: this.allyThrower,
      enemyLeaver: this.enemyLeaver,
      allyLeaver: this.allyLeaver,
      allyCheater: this.allyCheater,
      enemyCheater: this.enemyCheater,
      playOfTheGame: this.playOfTheGame,
      joinedVoice: this.joinedVoice,
      season: this.season,
      result: this.result,
      role: this.role,
      openQueue: this.openQueue
    };

    const record = await Database.upsert("matches", data, this._id);
    const newMatch: Match = record as Match;
    this._id = newMatch._id;
    if (newMatch.createdAt) {
      this.createdAt = newMatch.createdAt;
    }
    return this;
  }

  static delete(id: string) {
    return Database.delete("matches", id);
  }
}

export default Match;
