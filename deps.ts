import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.126.0/testing/asserts.ts";

import {
  getConfig,
  render,
  renderFile,
} from "https://deno.land/x/eta@v1.11.0/mod.ts";

import { parse as parseToml } from "https://deno.land/std@0.126.0/encoding/toml.ts";
import { walk } from "https://deno.land/std@0.126.0/fs/walk.ts";
import { plugin } from "./src/plugins/postprocess.ts";
import { basename, extname } from "https://deno.land/std@0.126.0/path/mod.ts";

import rawEmojiJsonData from "https://unpkg.com/emoji.json@13.1.0/emoji.json" assert {
  type: "json",
};

import rawGitHubEmojiJsonData from "https://gist.githubusercontent.com/oliveratgithub/0bf11a9aff0d6da7b46f1490f86a71eb/raw/d8e4b78cfe66862cf3809443c1dba017f37b61db/emojis.json" assert {
  type: "json",
};

// {"codes":"1F600","char":"😀","name":"grinning face","category":"Smileys & Emotion (face-smiling)","group":"Smileys & Emotion","subgroup":"face-smiling"}
type Emoji = {
  codes: string;
  char: string;
  name: string;
  category: string;
  group: string;
  subgroup: string;
};
// {"emoji": "👩‍👩‍👧‍👧", "name": "family: woman, woman, girl, girl", "shortname": ":woman_woman_girl_girl:", "unicode": "1F469 200D 1F469 200D 1F467 200D 1F467", "html": "&#128105;&zwj;&#128105;&zwj;&#128103;&zwj;&#128103;", "category": "People & Body (family)", "order": ""}
type GHEmoji = {
  emoji: string;
  name: string;
  shortname: string;
  unicode: string;
  html: string;
  category: string;
};

const emojiJsonData = rawEmojiJsonData as Emoji[];
const emojiGHJsonData = rawGitHubEmojiJsonData.emojis as GHEmoji[];

export {
  assertEquals,
  assertThrows,
  basename,
  emojiGHJsonData,
  emojiJsonData,
  extname,
  getConfig,
  parseToml,
  plugin,
  render,
  renderFile,
  walk,
};
