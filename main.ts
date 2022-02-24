import {
  basename,
  extname,
  getConfig,
  parseToml,
  plugin,
  render,
  renderFile,
  walk,
} from "./deps.ts";

const decoder = new TextDecoder("utf-8");
const tomlObject = parseToml(
  decoder.decode(Deno.readFileSync("./example/slide.toml")),
);

type RawSlide = {
  title?: string;
  text?: string;
};
type RawSlideToml = {
  meta: {
    title: string;
    og_url?: string;
    og_title?: string;
    og_image?: string;
    og_image_width?: string;
    og_image_height?: string;
    og_image_description?: string;
    twitter_card?: string;
    twitter_creator?: string;
    twitter_image?: string;
    icon?: string;
  };
  slide: RawSlide[];
};

const rawToml = tomlObject as RawSlideToml;

const viewPath = `${Deno.cwd()}/views/`;

const config = getConfig({
  views: viewPath,
  replaceData: rawToml,
});

const templateResult = await renderFile("./template.eta", rawToml, config);
const postConfig = getConfig({
  plugins: [plugin],
  views: viewPath,
  replaceData: rawToml,
  emojis: [],
});

const renderTwice = await render(templateResult, {}, postConfig);

console.log("DEBUG: ", renderTwice);

// there's no dist/, error
const write = Deno.writeTextFile(
  `${Deno.cwd()}/dist/index.html`,
  renderTwice as string,
);

write.then(() => console.log("File written to dist/"));

// copy assets
const files = walk("example");
for await (const file of files) {
  if (
    file.isFile && /[png|jpg|ico|svg|PNG|JPG|ICO|SVG]$/.test(extname(file.path))
  ) {
    const dest = file.path.slice(8); // skip 'example/'
    await Deno.copyFileSync(file.path, `dist/${dest}`);
    console.log(`Copy to dist/: ${file.path}`);
  }
}
// https://raw.githubusercontent.com/uta8a/tomlide/main/assets/twemoji/1f004.svg
const getEmoji = async (code: string) => {
  const files = walk("assets/twemoji");
  for await (const file of files) {
    if (basename(file.path).startsWith(code)) {
      const dest = basename(file.path);
      await Deno.copyFileSync(file.path, `dist/${dest}`);
      return;
    }
  }
  throw new Error("cannot get emoji from assets/");
};
for (const emojiPath of postConfig.emojis) {
  await getEmoji(emojiPath.slice(2, -4));
}
