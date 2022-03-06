import { emojiGHJsonData, emojiJsonData } from "../../deps.ts";

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
      return `<a href="${
        encodeURI(
          link,
        )
      }" target="_blank" rel="noopener">${encodeURI(link)}</a>`;
    } else if (linkNameRegExp.test(name)) {
      // @[link: title](URL)
      // slice(1) skip `:`
      return `<a href="${encodeURI(link)}" target="_blank" rel="noopener">${
        name
          .slice(1)
          .trim()
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
      return `<img src="${encodeURI(link)}" class="sld-left"/>`;
    } else if (imageNameRegExp.test(image)) {
      // @[image: title](URL)
      // slice(1) skip `:`
      return `<figure><img src="${
        encodeURI(
          link,
        )
      }" class="sld-left" alt="${image.slice(1).trim()}"/><figcaption>${
        image
          .slice(1)
          .trim()
      }</figcaption></figure>`;
    } else {
      throw new Error("Valid Form: @[image](URL) or @[image: `title`](URL)");
    }
  }
  throw new Error("Empty image match");
};

const emojiRegExp = /@\[:(?<emoji>.*?):\]/;

// use `assets/twemoji`, used emoji to `dist/`
const convertEmoji = (s: string): string => {
  const ghEmoji = emojiGHJsonData.find(
    (emojiData) => emojiData.shortname === `:${s}:`,
  );
  const emoji = emojiJsonData.find((emojiData) => emojiData.name === s);
  if (ghEmoji === undefined) {
    if (emoji === undefined) {
      throw new Error(`:${s}: is not exists in emoji library.`);
    }
    const code = emoji.codes.toLowerCase();
    return `./${code}.svg`;
  }
  const code = ghEmoji.unicode.toLowerCase();
  return `./${code}.svg`;
};

const emojiFunction = (config: Record<string, Array<string>>) =>
  (s: string): string => {
    const mch = s.match(emojiRegExp);
    if (mch?.groups) {
      const gr = mch.groups;
      const emoji = gr.emoji;
      const link = convertEmoji(emoji);
      if (config.emojis === undefined) {
        config.emojis = [link];
      } else {
        config.emojis.push(link);
      }
      return `<img src="${link}" class="sld-emoji-text"/>`;
    }
    throw new Error("Empty emoji match");
  };

const emRegExp = /@\[\*(?<em>.*?)\*\]/;

const emFunction = (s: string): string => {
  const mch = s.match(emRegExp);
  if (mch?.groups) {
    const gr = mch.groups;
    const em = gr.em;
    return `<span class="sld-em">${em}</span>`;
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
  processAST: function (
    buffer: string[],
    config: Record<string, Array<string>>,
  ) {
    const input = buffer[0];
    const linked = replaceElement(input, linkRegExp, linkFunction);
    const imaged = replaceElement(linked, imageRegExp, imageFunction);
    const emojied = replaceElement(imaged, emojiRegExp, emojiFunction(config));
    const emed = replaceElement(emojied, emRegExp, emFunction);
    buffer.shift();
    buffer.push(emed);
    return buffer;
  },
};

export {
  emFunction,
  emojiFunction,
  imageFunction,
  linkFunction,
  linkRegExp,
  plugin,
  replaceElement,
};
