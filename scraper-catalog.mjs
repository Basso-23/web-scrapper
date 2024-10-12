// PARA EJECUTAR USAR COMANDO: node scraper-catalog.mjs

import { chromium } from "playwright";
import fs from "fs";
import { autoScroll } from "./autoScroll.mjs";

const browser = await chromium.launch({
  headless: false,
});

const page = await browser.newPage();

// ------------------- LEER URLS DESDE EL ARCHIVO TXT ------------------- //
const urls = fs
  .readFileSync("urls.txt", "utf-8")
  .split("\n")
  .map((url) => url.trim())
  .filter((url) => url.length > 0);

try {
  let allData = [];
  let idCounter = 1;

  for (const [index, url] of urls.entries()) {
    console.log(`(${index + 1}/${urls.length}): ${url}`);
    await page.goto(url);
    await autoScroll(page);
    await page.waitForTimeout(7000);

    // ------------------- WAIT FOR THIS CLASS TO RENDER ------------------- //
    await page.waitForSelector(".vtex-product-summary-2-x-container");

    const data = await page.$$eval(
      // ------------------- PARENT CLASS OF DATA TO BE SCRAPED ------------------- //
      ".vtex-product-summary-2-x-container",
      (results, idCounter) =>
        results.map((el) => {
          // ------------------- ID ------------------- //
          const num = idCounter++;

          // ------------------- LINK ------------------- //

          const productLink = `https://www.superxtra.com${el
            .querySelector("a")
            .getAttribute("href")}`;

          // ------------------- JSON ELEMENTS ------------------- //
          const json = {
            id: num,
            link: productLink,
          };

          return json;
        }),
      idCounter
    );

    idCounter += data.length;

    allData.push(...data);
  }

  const jsonContent = JSON.stringify({ data: allData }, null, 2);
  fs.writeFileSync("data.json", jsonContent);

  console.log("Scrapping Completado ✔️");
} finally {
  await browser.close();
}
