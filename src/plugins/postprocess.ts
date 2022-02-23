import rawEmojiJsonData from "https://unpkg.com/emoji.json@13.1.0/emoji.json" assert {
  type: "json",
};
import rawGitHubEmojiJsonData from "https://gist.githubusercontent.com/oliveratgithub/0bf11a9aff0d6da7b46f1490f86a71eb/raw/d8e4b78cfe66862cf3809443c1dba017f37b61db/emojis.json" assert {
  type: "json",
};
const linkRegExp = /@\[link(?<name>.*?)\]\((?<link>.*?)\)/;
const linkNameRegExp = /^:\s*([^]*?)/;

const linkFunction = (s: string): string => {
  const mch = s.match(linkRegExp);
  if (mch?.groups) {
    const gr = mch.groups;
    const name = gr.name;
    const link = gr.link.startsWith("@") ? `/#${gr.link.slice(1)}` : gr.link;
    if (name === "") {
      // @[link](URL)
      return `<a href="${encodeURI(link)}" target="_blank" rel="noopener">${
        encodeURI(link)
      }</a>`;
    } else if (linkNameRegExp.test(name)) {
      // @[link: title](URL)
      // slice(1) skip `:`
      return `<a href="${encodeURI(link)}" target="_blank" rel="noopener">${
        name.slice(1).trim()
      }</a>`;
    } else {
      throw new Error("Valid Form: @[link](URL) or @[link: `title`](URL)");
    }
  }
  throw new Error("Empty link match");
};

const imageRegExp = /@\[image(?<image>.*?)\]\((?<link>.*?)\)/;
const imageNameRegExp = /^:\s*([^]*?)/;

const imageFunction = (s: string): string => {
  const mch = s.match(imageRegExp);
  if (mch?.groups) {
    const gr = mch.groups;
    const image = gr.image;
    const link = gr.link;

    // convert image
    if (image === "") {
      // @[image](URL)
      return `<img src="${encodeURI(link)}" class="sld-left" width="500"/>`;
    } else if (imageNameRegExp.test(image)) {
      // @[image: title](URL)
      // slice(1) skip `:`
      return `<figure><img src="${
        encodeURI(link)
      }" class="sld-left" width="500" alt="${
        image.slice(1).trim()
      }"/><figcaption>${image.slice(1).trim()}</figcaption></figure>`;
    } else {
      throw new Error("Valid Form: @[image](URL) or @[image: `title`](URL)");
    }
  }
  throw new Error("Empty image match");
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
const emojiRegExp = /@\[:(?<emoji>.*?):\]/;

const convertEmoji = (s: string): string => {
  const ghEmoji = emojiGHJsonData.find((emojiData) =>
    emojiData.shortname === `:${s}:`
  );
  const emoji = emojiJsonData.find((emojiData) => emojiData.name === s);
  if (ghEmoji === undefined) {
    if (emoji === undefined) {
      throw new Error(`:${s}: is not exists in emoji library.`);
    }
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/13.1.0/72x72/${emoji.codes.toLowerCase()}.png`;
  }
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/13.1.0/72x72/${ghEmoji.unicode.toLowerCase()}.png`;
};

const emojiFunction = (s: string): string => {
  const mch = s.match(emojiRegExp);
  if (mch?.groups) {
    const gr = mch.groups;
    const emoji = gr.emoji;
    const link = convertEmoji(emoji);
    return `<img src="${link}" class="sld-emoji-text"/>`;
  }
  throw new Error("Empty emoji match");
};

const replaceElement = (
  input: string,
  regex: RegExp,
  f: (arg: string) => string,
): string => {
  const res = [];
  const mch = input.match(regex);
  // no matches
  if (mch === null) {
    return input;
  }
  if (mch.index === undefined) {
    throw new Error("Error: index is undefined.");
  }
  const start = mch.index;
  const end = mch.index + mch[0].length;
  const [left, middle, rest] = [
    input.slice(0, start),
    input.slice(start, end),
    input.slice(end),
  ];
  res.push(left);
  const compiled = f(middle);
  res.push(compiled);
  const right = replaceElement(rest, regex, f);
  res.push(right);
  return res.join("");
};

const plugin = {
  processAST: function (buffer: string[], _config: Record<string, string>) {
    const input = buffer[0];
    const linked = replaceElement(input, linkRegExp, linkFunction);
    const imaged = replaceElement(linked, imageRegExp, imageFunction);
    const emojied = replaceElement(imaged, emojiRegExp, emojiFunction);
    buffer.shift();
    buffer.push(emojied);
    // console.log("DEBUG:", emojied, buffer);
    return buffer;
  },
};

export { imageFunction, linkFunction, linkRegExp, plugin, replaceElement };
