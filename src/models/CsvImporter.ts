import parse from "csv-parse";
import Match, { MatchData } from "./Match";
import Season from "./Season";
import { readFile } from "../utils/electronUtils";

class CsvImporter {
  path: string;
  season: Season;
  accountID: string;

  constructor(path: string, season: Season, accountID: string) {
    this.path = path;
    this.season = season;
    this.accountID = accountID;
  }

  readFile = (): Promise<string> => {
    return readFile(this.path);
  };

  parseCsv = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      this.readFile().then(lines => {
        const options: parse.Options = { columns: true };
        const callback: parse.Callback = (err, data) => {
          if (err) {
            console.error("failed to parse CSV file", this.path, err);
            reject(err);
          } else {
            resolve(data);
          }
        };
        parse(lines, options, callback);
      });
    });
  };

  normalizeData = (hash: any) => {
    const keys = Object.keys(hash);

    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      let value = hash[key];

      if (typeof value === "string") {
        const lowerValue = value.toLowerCase();

        if (lowerValue === "y") {
          value = true;
        } else if (lowerValue === "n") {
          value = false;
        }
      }

      hash[lowerKey] = value;
    }

    return hash;
  };

  importMatch = async (rawData: any) => {
    const data = this.normalizeData(rawData);
    const matchData: MatchData = {
      accountID: this.accountID,
      season: this.season.number,
      openQueue: data.openQueue,
      rank: data.rank,
      role: data.role,
      comment: data.comment,
      map: data.map,
      isPlacement: data.placement,
      result: data.placement ? data.result : null,
      group: data.group,
      groupSize: data["group size"],
      heroes: data.heroes,
      playedAt: data.date,
      dayOfWeek: data.day,
      timeOfDay: data.time,
      enemyThrower: data["enemy thrower"],
      allyThrower: data["ally thrower"],
      enemyLeaver: data["enemy leaver"],
      allyLeaver: data["ally leaver"],
      playOfTheGame: data["play of the game"],
      joinedVoice: data["joined voice"]
    };
    const match = new Match(matchData);
    return match.save();
  };

  async import(onSave: (match: Match) => void) {
    const rows: any[] = await this.parseCsv();
    const matches = [];

    for (const row of rows) {
      const match = await this.importMatch(row);
      onSave(match);
      matches.push(match);
    }

    return matches;
  }
}

export default CsvImporter;
