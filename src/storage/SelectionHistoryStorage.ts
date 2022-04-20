import type { Word } from "../model/Word";
import type { PartialRequired } from "../types";

export type HitWord = PartialRequired<Word, "hit" | "completionDistance">;
export type SelectionHistory = {
  count: number;
  lastUpdated: number;
};

export type SelectionHistoryTree = {
  [hit: string]: {
    [value: string]: {
      [type: string]: SelectionHistory;
    };
  };
};

const SEC = 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

function calcScore(history: SelectionHistory | undefined): number {
  if (!history) {
    return 0;
  }

  const behind = Date.now() - history.lastUpdated;

  if (behind < MIN) {
    return 8 * history.count;
  } else if (behind < HOUR) {
    return 4 * history.count;
  } else if (behind < DAY) {
    return 2 * history.count;
  } else if (behind < WEEK) {
    return 0.5 * history.count;
  } else {
    return 0.25 * history.count;
  }
}

export class SelectionHistoryStorage {
  data: SelectionHistoryTree;

  constructor(data: SelectionHistoryTree = {}) {
    this.data = data;
  }

  getSelectionHistory(word: HitWord): SelectionHistory | undefined {
    return this.data[word.hit]?.[word.value]?.[word.type];
  }

  increment(word: HitWord): void {
    if (!this.data[word.hit]) {
      this.data[word.hit] = {};
    }
    if (!this.data[word.hit][word.value]) {
      this.data[word.hit][word.value] = {};
    }

    if (this.data[word.hit][word.value][word.type]) {
      this.data[word.hit][word.value][word.type] = {
        count: this.data[word.hit][word.value][word.type].count + 1,
        lastUpdated: Date.now(),
      };
    } else {
      this.data[word.hit][word.value][word.type] = {
        count: 1,
        lastUpdated: Date.now(),
      };
    }
  }

  compare(w1: HitWord, w2: HitWord): -1 | 0 | 1 {
    const score1 = calcScore(this.getSelectionHistory(w1));
    const score2 = calcScore(this.getSelectionHistory(w2));

    if (score1 === score2) {
      return 0;
    }

    return score1 > score2 ? -1 : 1;
  }
}