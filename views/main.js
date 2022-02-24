/* Simple hash router */
const router = (path) => {
  console.log(path);
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
      .innerHTML = router("-1");
  }
};
window.addEventListener("hashchange", function () {
  render(window.location.hash);
});
window.addEventListener("DOMContentLoaded", function (_ev) {
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
  const width = window.outerWidth;
  const x = e.pageX;
  if (x < width / 3) {
    window.location.hash = left(window.location.hash);
  }
  if (x > width * 2 / 3) {
    window.location.hash = right(window.location.hash);
  }
});
