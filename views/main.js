// deno-lint-ignore-file no-window-prefix

const resizeWindow = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  document.querySelector("html").style.setProperty(
    "--font-size",
    `${1.1 * width / 100}px`,
  );
  if (16 * height > 9 * width) {
    document.querySelector("main").style.width = `${width * 0.8}px`;
    document.querySelector("main").style.left = `${width * 0.1}px`;
    document.querySelector("main").style.height = `${width * 0.8 * 9 / 16}px`;
    document.querySelector("main").style.top = `${
      height / 2 - width * 0.8 * 9 / 16 / 2
    }px`;
  } else {
    document.querySelector("main").style.height = `${height * 0.8}px`;
    document.querySelector("main").style.top = `${height * 0.1}px`;
    document.querySelector("main").style.width = `${height * 0.8 * 16 / 9}px`;
    document.querySelector("main").style.left = `${
      width / 2 - height * 0.8 * 16 / 9 / 2
    }px`;
  }
};

/* Simple hash router */
const router = (path) => {
  if (path === "") {
    path = "#1";
  }
  const template = document.querySelector(`#template-${path.replace("#", "")}`);
  if (template !== null) {
    return template.innerHTML;
  } else {
    return `<h1>404</h1><p><a href='/'>Top page</a></p>`;
  }
};
const render = (path) => {
  try {
    document.querySelector("#main")
      .innerHTML = router(path);
  } catch {
    document.querySelector("#main")
      .innerHTML = router("-1"); // 404
  }
};
window.addEventListener("hashchange", function () {
  render(window.location.hash);
});
window.addEventListener("DOMContentLoaded", function (_ev) {
  resizeWindow();
  render(window.location.hash);
});

/* Keydown left/right arrow then change route hash */
const right = (s) => {
  if (s === "") {
    s = "#1";
  }
  const num = parseInt(s.replace("#", ""));
  const template = document.querySelector(`#template-${num}`);
  const template2 = document.querySelector(`#template-${num + 1}`);
  if (template === null || template2 === null) {
    return s;
  }
  return `#${num + 1}`;
};

const left = (s) => {
  const num = parseInt(s.replace("#", ""));
  const template = document.querySelector(`#template-${num}`);
  const template2 = document.querySelector(`#template-${num - 1}`);
  if (template === null || template2 === null) {
    return s;
  }
  return `#${num - 1}`;
};

document.addEventListener("keydown", function logKey(e) {
  if (e.code == "ArrowRight") {
    window.location.hash = right(window.location.hash);
  }
});

document.addEventListener("keydown", function logKey(e) {
  if (e.code == "ArrowLeft") {
    window.location.hash = left(window.location.hash);
  }
});

document.addEventListener("click", function (e) {
  const width = window.innerWidth;
  const x = e.pageX;
  if (x < width / 10) {
    window.location.hash = left(window.location.hash);
  }
  if (x > width * 9 / 10) {
    window.location.hash = right(window.location.hash);
  }
});

/* resize slide */
function resize(_e) {
  resizeWindow();
}
window.onresize = resize;
