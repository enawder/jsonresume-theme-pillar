const puppeteer = require('puppeteer');
const path = require("path");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const env = process.env.ENV;
  await page.goto(
    "file://" + path.join(process.cwd(),
    path.join("public", env, "index.html")), {
      waitUntil: "load"
    })

  const htmlTag = await page.$eval("head", (element) => {
    return element.innerHTML;
  })
  const resume = await page.$eval('#resume', (element) => {
    return element.innerHTML 
  })
  await page.setContent(htmlTag + resume)
  await page.emulateMediaType('print');

  const pdf = await page.pdf({
    path: path.join(process.cwd(), "public", env, "resume.pdf"),
    format: "A4",
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    printBackground: true,
    scale: 0.7
  });

  await browser.close();
})();
