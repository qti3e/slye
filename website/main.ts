async function main() {
  const links = { linux: undefined, win32: undefined };

  const req = await fetch("https://api.github.com/repos/qti3e/slye/releases");
  const data = await req.json();

  const { assets, published_at, name } = data[0];
  for (const asset of assets) {
    if (/linux/i.test(asset.name)) {
      links.linux = asset.browser_download_url;
    }
    if (/win/i.test(asset.name)) {
      links.win32 = asset.browser_download_url;
    }
  }

  const version = (name as string)
    .toLocaleLowerCase()
    .replace("version", "")
    .replace("ver", "")
    .trim();

  const versionEl = document.getElementById("version");
  const linuxLink = document.getElementById("link-linux");
  const win32Link = document.getElementById("link-win32");

  linuxLink.setAttribute("href", links.linux);
  win32Link.setAttribute("href", links.win32);
  versionEl.innerText = version;
}

main();
