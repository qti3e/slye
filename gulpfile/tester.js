const puppeteer = require("puppeteer");

function tester(url) {
  return async function(cb) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    page.on("console", async msg => {
      const text = msg.text();
      const args = [];
      for (let i = 0; i < msg.args().length; ++i) {
        args.push(await msg.args()[i].jsonValue());
      }
      console.log(...args);
      if (text.indexOf("DONE. Test passed") > -1) {
        await browser.close();
        const index = text.lastIndexOf(" ");
        const n = Number(text.substr(index + 1));
        process.exit(n > 0 ? 1 : 0);
      }
    });
  };
}

module.exports = tester;
