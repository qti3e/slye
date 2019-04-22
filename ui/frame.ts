import { Remote } from "electron";

const remote: Remote = window.remote;

function bind(): void {
  document.getElementById("min-btn").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  });

  document.getElementById("max-btn").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  });

  document.getElementById("close-btn").addEventListener("click", () => {
    const window = remote.getCurrentWindow();
    window.close();
  });
}

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    bind();
  }
});
