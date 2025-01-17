import {
  judge,
  judgeByPartialMatch,
  pushWord,
  suggestWords,
  suggestWordsByPartialMatch,
  type WordsByFirstLetter,
} from "./suggester";
import { describe, expect } from "@jest/globals";
import type { IndexedWords } from "../ui/AutoCompleteSuggest";

describe("pushWord", () => {
  const createWordsByFirstLetter = (): WordsByFirstLetter => ({
    a: [
      { value: "aaa", type: "currentFile", createdPath: "" },
      { value: "aa", type: "currentFile", createdPath: "" },
    ],
  });

  test("add", () => {
    const wordsByFirstLetter = createWordsByFirstLetter();
    pushWord(wordsByFirstLetter, "u", {
      value: "uuu",
      type: "currentFile",
      createdPath: "",
    });
    expect(wordsByFirstLetter).toStrictEqual({
      a: [
        { value: "aaa", type: "currentFile", createdPath: "" },
        { value: "aa", type: "currentFile", createdPath: "" },
      ],
      u: [{ value: "uuu", type: "currentFile", createdPath: "" }],
    });
  });

  test("push", () => {
    const wordsByFirstLetter = createWordsByFirstLetter();
    pushWord(wordsByFirstLetter, "a", {
      value: "a",
      type: "currentFile",
      createdPath: "",
    });
    expect(wordsByFirstLetter).toStrictEqual({
      a: [
        { value: "aaa", type: "currentFile", createdPath: "" },
        { value: "aa", type: "currentFile", createdPath: "" },
        { value: "a", type: "currentFile", createdPath: "" },
      ],
    });
  });
});

describe.each`
  word                                                                   | query   | queryStartWithUpper | expected
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"bc"} | ${false}            | ${{ word: { value: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", aliases: ["ab"], type: "customDictionary" }}       | ${"ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", aliases: ["ab"], type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "internalLink" }}                            | ${"ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "internalLink" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"Ab"} | ${true}             | ${{ value: "Abcde", word: { value: "Abcde", hit: "Abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"Bc"} | ${true}             | ${{ word: { value: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "internalLink" }}                            | ${"Ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "internalLink" }, alias: false }}
  ${{ value: "ce", aliases: ["abc", "abab"], type: "customDictionary" }} | ${"Ab"} | ${true}             | ${{ value: "abc", word: { value: "ce", hit: "abc", aliases: ["abc", "abab"], type: "customDictionary" }, alias: true }}
  ${{ value: "ce", aliases: ["abc", "abab"], type: "customDictionary" }} | ${"Bc"} | ${true}             | ${{ word: { value: "ce", aliases: ["abc", "abab"], type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"ce"} | ${false}            | ${{ word: { value: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${""}   | ${true}             | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${""}   | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
`("judge", ({ word, query, queryStartWithUpper, expected }) => {
  test(`judge(${JSON.stringify(
    word
  )}, ${query}, ${queryStartWithUpper}) = ${JSON.stringify(expected)}`, () => {
    expect(judge(word, query, queryStartWithUpper)).toStrictEqual(expected);
  });
});

describe.each`
  word                                                                   | query   | queryStartWithUpper | expected
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"bc"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", aliases: ["ab"], type: "customDictionary" }}       | ${"ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", aliases: ["ab"], type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "internalLink" }}                            | ${"ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "internalLink" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"Ab"} | ${true}             | ${{ value: "Abcde", word: { value: "Abcde", hit: "Abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"Bc"} | ${true}             | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "internalLink" }}                            | ${"Ab"} | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "internalLink" }, alias: false }}
  ${{ value: "ce", aliases: ["abc", "abab"], type: "customDictionary" }} | ${"Ab"} | ${true}             | ${{ word: { value: "ce", hit: "abc", aliases: ["abc", "abab"], type: "customDictionary" }, value: "abc", alias: true }}
  ${{ value: "ce", aliases: ["abc", "abab"], type: "customDictionary" }} | ${"Bc"} | ${true}             | ${{ word: { value: "ce", hit: "abc", aliases: ["abc", "abab"], type: "customDictionary" }, value: "abc", alias: true }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${"ce"} | ${false}            | ${{ word: { value: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${""}   | ${true}             | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
  ${{ value: "abcde", type: "customDictionary" }}                        | ${""}   | ${false}            | ${{ value: "abcde", word: { value: "abcde", hit: "abcde", type: "customDictionary" }, alias: false }}
`("judgeByPartialMatch", ({ word, query, queryStartWithUpper, expected }) => {
  test(`judgeByPartialMatch(${JSON.stringify(
    word
  )}, ${query}, ${queryStartWithUpper}) = ${JSON.stringify(expected)}`, () => {
    expect(judgeByPartialMatch(word, query, queryStartWithUpper)).toStrictEqual(
      expected
    );
  });
});

describe("suggestWords", () => {
  const createIndexedWords = (): IndexedWords => ({
    currentFile: {
      a: [
        { value: "ai", type: "currentFile", createdPath: "" },
        { value: "aiUEO", type: "currentFile", createdPath: "" },
      ],
    },
    currentVault: {},
    customDictionary: {
      a: [
        {
          value: "uwaa",
          aliases: ["aaa"],
          type: "customDictionary",
          createdPath: "",
        },
        { value: "aiUEO", type: "customDictionary", createdPath: "" },
      ],
      A: [{ value: "AWS", type: "customDictionary", createdPath: "" }],
      u: [
        {
          value: "uwaa",
          aliases: ["aaa"],
          type: "customDictionary",
          createdPath: "",
        },
      ],
      U: [
        {
          value: "UFO",
          aliases: ["Unidentified flying object"],

          createdPath: "",
          type: "customDictionary",
        },
      ],
    },
    internalLink: {
      a: [
        { value: "aiUEO", type: "internalLink", createdPath: "" },
        {
          value: "あいうえお",
          type: "internalLink",
          aliases: ["aiueo"],
          createdPath: "",
        },
      ],
      A: [
        { value: "AWS", type: "internalLink", createdPath: "" },
        { value: "AI", type: "internalLink", createdPath: "" },
      ],
      あ: [
        {
          value: "あいうえお",
          type: "internalLink",
          aliases: ["aiueo"],
          createdPath: "",
        },
      ],
    },
    frontMatter: {}, // TODO: Add value
  });

  test("Query: a", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "a", 10, null)).toStrictEqual([
      {
        value: "AI",
        type: "internalLink",
        hit: "AI",
        createdPath: "",
      },
      {
        value: "ai",
        type: "currentFile",
        hit: "ai",
        createdPath: "",
      },
      {
        value: "AWS",
        type: "internalLink",
        hit: "AWS",
        createdPath: "",
      },
      {
        value: "uwaa",
        aliases: ["aaa"],
        hit: "aaa",
        type: "customDictionary",
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "internalLink",
        hit: "aiUEO",
        createdPath: "",
      },
      {
        value: "あいうえお",
        aliases: ["aiueo"],
        hit: "aiueo",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "customDictionary",
        hit: "aiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: ai", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "ai", 10, null)).toStrictEqual([
      {
        value: "AI",
        hit: "AI",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "ai",
        hit: "ai",
        type: "currentFile",
        createdPath: "",
      },
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "あいうえお",
        aliases: ["aiueo"],
        hit: "aiueo",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("Query: aiu", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "aiu", 10, null)).toStrictEqual([
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "あいうえお",
        aliases: ["aiueo"],
        hit: "aiueo",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("Query: A", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "A", 10, null)).toStrictEqual([
      {
        value: "AI",
        hit: "AI",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "Ai",
        hit: "Ai",
        type: "currentFile",
        createdPath: "",
      },
      {
        value: "AWS",
        hit: "AWS",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "AWS",
        hit: "AWS",
        type: "customDictionary",
        createdPath: "",
      },
      {
        value: "uwaa",
        type: "customDictionary",
        aliases: ["aaa"],
        hit: "aaa",
        createdPath: "",
      },
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        hit: "AiUEO",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("Query: Ai", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "Ai", 10, null)).toStrictEqual([
      {
        value: "AI",
        hit: "AI",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "Ai",
        hit: "Ai",
        type: "currentFile",
        createdPath: "",
      },
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "あいうえお",
        hit: "aiueo",
        type: "internalLink",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        hit: "AiUEO",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("Query: AI", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "AI", 10, null)).toStrictEqual([
      {
        value: "AI",
        hit: "AI",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "Ai",
        hit: "Ai",
        type: "currentFile",
        createdPath: "",
      },
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "あいうえお",
        hit: "aiueo",
        type: "internalLink",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        hit: "AiUEO",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("Query: AIU", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "AIU", 10, null)).toStrictEqual([
      {
        value: "aiUEO",
        hit: "aiUEO",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "あいうえお",
        hit: "aiueo",
        type: "internalLink",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        hit: "AiUEO",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("Query: u", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "u", 10, null)).toStrictEqual([
      {
        value: "uwaa",
        hit: "uwaa",
        type: "customDictionary",
        aliases: ["aaa"],
        createdPath: "",
      },
    ]);
  });

  test("Query: U", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "U", 10, null)).toStrictEqual([
      {
        value: "UFO",
        hit: "UFO",
        type: "customDictionary",
        aliases: ["Unidentified flying object"],
        createdPath: "",
      },
      {
        value: "Uwaa",
        hit: "Uwaa",
        type: "customDictionary",
        aliases: ["aaa"],
        createdPath: "",
      },
    ]);
  });

  test("max: 3", () => {
    const indexedWords = createIndexedWords();
    expect(suggestWords(indexedWords, "a", 3, null)).toStrictEqual([
      {
        value: "AI",
        hit: "AI",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "ai",
        hit: "ai",
        type: "currentFile",
        createdPath: "",
      },
      {
        value: "AWS",
        hit: "AWS",
        type: "internalLink",
        createdPath: "",
      },
      // --- hidden ---
      // { value: "uwaa", type: "customDictionary", aliases: ["aaa"] },
      // { value: "aiUEO", type: "internalLink" },
      // { value: "あいうえお", type: "internalLink", aliases: ["aiueo"] },
      // { value: "aiUEO", type: "customDictionary" },
      // { value: "aiUEO", type: "currentFile" },
    ]);
  });

  const indexedWords2: IndexedWords = {
    frontMatter: {
      tags: {
        a: [
          { key: "tags", value: "a", type: "frontMatter", createdPath: "" },
          { key: "tags", value: "a", type: "frontMatter", createdPath: "" },
        ],
      },
      alias: {
        a: [
          { key: "alias", value: "a", type: "frontMatter", createdPath: "" },
          { key: "alias", value: "a", type: "frontMatter", createdPath: "" },
        ],
      },
      aliases: {
        a: [
          { key: "aliases", value: "a", type: "frontMatter", createdPath: "" },
          { key: "aliases", value: "a", type: "frontMatter", createdPath: "" },
        ],
      },
    },
    internalLink: {
      a: [
        { value: "a", type: "internalLink", createdPath: "" },
        { value: "a", type: "internalLink", createdPath: "" },
      ],
    },
    customDictionary: {
      a: [
        { value: "a", type: "customDictionary", createdPath: "" },
        { value: "a", type: "customDictionary", createdPath: "" },
      ],
    },
    currentFile: {
      a: [
        { value: "a", type: "currentFile", createdPath: "" },
        { value: "a", type: "currentFile", createdPath: "" },
      ],
    },
    currentVault: {
      a: [
        { value: "a", type: "currentVault", createdPath: "" },
        { value: "a", type: "currentVault", createdPath: "" },
      ],
    },
  };

  test("word type priority order in front matter tags", () => {
    expect(suggestWords(indexedWords2, "a", 10, "tags")).toStrictEqual([
      {
        key: "tags",
        value: "a",
        hit: "a",
        type: "frontMatter",
        createdPath: "",
      },
    ]);
  });

  test("word type priority order not in front matter", () => {
    expect(suggestWords(indexedWords2, "a", 10, null)).toStrictEqual([
      {
        value: "a",
        hit: "a",
        type: "internalLink",
        createdPath: "",
      },
      {
        value: "a",
        hit: "a",
        type: "customDictionary",
        createdPath: "",
      },
    ]);
  });

  test("empty in front matter alias", () => {
    expect(suggestWords(indexedWords2, "a", 10, "alias")).toStrictEqual([]);
  });

  test("empty in front matter aliases", () => {
    expect(suggestWords(indexedWords2, "a", 10, "aliases")).toStrictEqual([]);
  });

  const indexedWords3: IndexedWords = {
    frontMatter: {},
    internalLink: {},
    customDictionary: {},
    currentFile: {
      a: [
        { value: "a", type: "currentFile", createdPath: "" },
        { value: "a", type: "currentFile", createdPath: "" },
      ],
    },
    currentVault: {
      a: [
        { value: "a", type: "currentVault", createdPath: "" },
        { value: "a", type: "currentVault", createdPath: "" },
      ],
    },
  };

  test("word type priority order (currentFile & currentVault)", () => {
    expect(suggestWords(indexedWords3, "a", 10, null)).toStrictEqual([
      {
        value: "a",
        hit: "a",
        type: "currentFile",
        createdPath: "",
      },
    ]);
  });
});

describe("suggestWordsByPartialMatch", () => {
  const createIndexedWords = (): IndexedWords => ({
    currentFile: {
      a: [
        { value: "ai", type: "currentFile", createdPath: "" },
        { value: "aiUEO", type: "currentFile", createdPath: "" },
      ],
    },
    currentVault: {},
    customDictionary: {
      a: [
        {
          value: "uwaa",
          aliases: ["aaa"],
          type: "customDictionary",
          createdPath: "",
        },
        { value: "aiUEO", type: "customDictionary", createdPath: "" },
      ],
      A: [{ value: "AWS", type: "customDictionary", createdPath: "" }],
      u: [
        {
          value: "uwaa",
          aliases: ["aaa"],
          type: "customDictionary",
          createdPath: "",
        },
      ],
      U: [
        {
          value: "UFO",
          aliases: ["Unidentified flying object"],
          createdPath: "",
          type: "customDictionary",
        },
      ],
    },
    internalLink: {
      a: [
        { value: "aiUEO", type: "internalLink", createdPath: "" },
        {
          value: "あいうえお",
          type: "internalLink",
          aliases: ["aiueo"],
          createdPath: "",
        },
      ],
      A: [
        { value: "AWS", type: "internalLink", createdPath: "" },
        { value: "AI", type: "internalLink", createdPath: "" },
      ],
      あ: [
        {
          value: "あいうえお",
          type: "internalLink",
          aliases: ["aiueo"],
          createdPath: "",
        },
      ],
    },
    frontMatter: {}, // TODO: Add value
  });

  test("Query: a", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "a", 10, null)
    ).toStrictEqual([
      { value: "AI", type: "internalLink", hit: "AI", createdPath: "" },
      { value: "ai", type: "currentFile", hit: "ai", createdPath: "" },
      { value: "AWS", type: "internalLink", hit: "AWS", createdPath: "" },
      { value: "AWS", type: "customDictionary", hit: "AWS", createdPath: "" },
      {
        value: "uwaa",
        type: "customDictionary",
        hit: "aaa",
        aliases: ["aaa"],
        createdPath: "",
      },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "customDictionary",
        hit: "aiUEO",
        createdPath: "",
      },
      // ??? currentFile
    ]);
  });

  test("Query: ai", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "ai", 10, null)
    ).toStrictEqual([
      { value: "AI", type: "internalLink", hit: "AI", createdPath: "" },
      { value: "ai", type: "currentFile", hit: "ai", createdPath: "" },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "customDictionary",
        hit: "aiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: aiu", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "aiu", 10, null)
    ).toStrictEqual([
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "customDictionary",
        hit: "aiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: A", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "A", 10, null)
    ).toStrictEqual([
      { value: "AI", type: "internalLink", hit: "AI", createdPath: "" },
      { value: "Ai", type: "currentFile", hit: "Ai", createdPath: "" },
      { value: "AWS", type: "internalLink", hit: "AWS", createdPath: "" },
      { value: "AWS", type: "customDictionary", hit: "AWS", createdPath: "" },
      {
        value: "uwaa",
        type: "customDictionary",
        hit: "aaa",
        aliases: ["aaa"],
        createdPath: "",
      },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        type: "customDictionary",
        hit: "AiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: Ai", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "Ai", 10, null)
    ).toStrictEqual([
      { value: "AI", type: "internalLink", hit: "AI", createdPath: "" },
      { value: "Ai", type: "currentFile", hit: "Ai", createdPath: "" },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        type: "customDictionary",
        hit: "AiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: AI", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "AI", 10, null)
    ).toStrictEqual([
      { value: "AI", type: "internalLink", hit: "AI", createdPath: "" },
      { value: "Ai", type: "currentFile", hit: "Ai", createdPath: "" },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        type: "customDictionary",
        hit: "AiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: AIU", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "AIU", 10, null)
    ).toStrictEqual([
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "AiUEO",
        type: "customDictionary",
        hit: "AiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: u", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "u", 10, null)
    ).toStrictEqual([
      {
        value: "UFO",
        type: "customDictionary",
        hit: "UFO",
        aliases: ["Unidentified flying object"],
        createdPath: "",
      },
      {
        value: "uwaa",
        type: "customDictionary",
        hit: "uwaa",
        aliases: ["aaa"],
        createdPath: "",
      },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "customDictionary",
        hit: "aiUEO",
        createdPath: "",
      },
    ]);
  });

  test("Query: U", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "U", 10, null)
    ).toStrictEqual([
      {
        value: "UFO",
        type: "customDictionary",
        hit: "UFO",
        aliases: ["Unidentified flying object"],
        createdPath: "",
      },
      {
        value: "Uwaa",
        type: "customDictionary",
        hit: "Uwaa",
        aliases: ["aaa"],
        createdPath: "",
      },
      { value: "aiUEO", type: "internalLink", hit: "aiUEO", createdPath: "" },
      {
        value: "あいうえお",
        type: "internalLink",
        hit: "aiueo",
        aliases: ["aiueo"],
        createdPath: "",
      },
      {
        value: "aiUEO",
        type: "customDictionary",
        hit: "aiUEO",
        createdPath: "",
      },
    ]);
  });

  test("max: 3", () => {
    const indexedWords = createIndexedWords();
    expect(
      suggestWordsByPartialMatch(indexedWords, "a", 3, null)
    ).toStrictEqual([
      { value: "AI", type: "internalLink", hit: "AI", createdPath: "" },
      { value: "ai", type: "currentFile", hit: "ai", createdPath: "" },
      { value: "AWS", type: "internalLink", hit: "AWS", createdPath: "" },
    ]);
  });

  const indexedWords2: IndexedWords = {
    frontMatter: {
      tags: {
        a: [
          { key: "tags", value: "a", type: "frontMatter", createdPath: "" },
          { key: "tags", value: "a", type: "frontMatter", createdPath: "" },
        ],
      },
      alias: {
        a: [
          { key: "alias", value: "a", type: "frontMatter", createdPath: "" },
          { key: "alias", value: "a", type: "frontMatter", createdPath: "" },
        ],
      },
      aliases: {
        a: [
          { key: "aliases", value: "a", type: "frontMatter", createdPath: "" },
          { key: "aliases", value: "a", type: "frontMatter", createdPath: "" },
        ],
      },
    },
    internalLink: {
      a: [
        { value: "a", type: "internalLink", createdPath: "" },
        { value: "a", type: "internalLink", createdPath: "" },
      ],
    },
    customDictionary: {
      a: [
        { value: "a", type: "customDictionary", createdPath: "" },
        { value: "a", type: "customDictionary", createdPath: "" },
      ],
    },
    currentFile: {
      a: [
        { value: "a", type: "currentFile", createdPath: "" },
        { value: "a", type: "currentFile", createdPath: "" },
      ],
    },
    currentVault: {
      a: [
        { value: "a", type: "currentVault", createdPath: "" },
        { value: "a", type: "currentVault", createdPath: "" },
      ],
    },
  };

  test("word type priority order in front matter tags", () => {
    expect(
      suggestWordsByPartialMatch(indexedWords2, "a", 10, "tags")
    ).toStrictEqual([
      {
        key: "tags",
        value: "a",
        type: "frontMatter",
        hit: "a",
        createdPath: "",
      },
    ]);
  });

  test("word type priority order not in front matter", () => {
    expect(
      suggestWordsByPartialMatch(indexedWords2, "a", 10, null)
    ).toStrictEqual([
      { value: "a", type: "internalLink", hit: "a", createdPath: "" },
      { value: "a", type: "customDictionary", hit: "a", createdPath: "" },
    ]);
  });

  test("empty in front matter alias", () => {
    expect(
      suggestWordsByPartialMatch(indexedWords2, "a", 10, "alias")
    ).toStrictEqual([]);
  });

  test("empty in front matter aliases", () => {
    expect(
      suggestWordsByPartialMatch(indexedWords2, "a", 10, "alias")
    ).toStrictEqual([]);
  });

  const indexedWords3: IndexedWords = {
    frontMatter: {},
    internalLink: {},
    customDictionary: {},
    currentFile: {
      a: [
        { value: "a", type: "currentFile", createdPath: "" },
        { value: "a", type: "currentFile", createdPath: "" },
      ],
    },
    currentVault: {
      a: [
        { value: "a", type: "currentVault", createdPath: "" },
        { value: "a", type: "currentVault", createdPath: "" },
      ],
    },
  };

  test("word type priority order (currentFile & currentVault)", () => {
    expect(
      suggestWordsByPartialMatch(indexedWords3, "a", 10, null)
    ).toStrictEqual([
      { value: "a", type: "currentFile", hit: "a", createdPath: "" },
    ]);
  });
});
