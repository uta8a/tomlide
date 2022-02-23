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
      return `<img src="${encodeURI(link)}" align="left" width="500"/>`;
    } else if (imageNameRegExp.test(image)) {
      // @[image: title](URL)
      // slice(1) skip `:`
      return `<figure><img src="${
        encodeURI(link)
      }" align="left" width="500" alt="${image.slice(1).trim()}"/><figcaption>${
        image.slice(1).trim()
      }</figcaption></figure>`;
    } else {
      throw new Error("Valid Form: @[image](URL) or @[image: `title`](URL)");
    }
  }
  throw new Error("Empty image match");
};

const replaceElement = (
  input: string,
  regex: RegExp,
  f: Function,
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
    buffer.shift();
    buffer.push(imaged);
    console.log("DEBUG:", imaged, buffer);
    return buffer;
  },
};

export { imageFunction, linkFunction, linkRegExp, plugin, replaceElement };
