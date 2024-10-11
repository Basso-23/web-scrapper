// PARA EJECUTAR USAR COMANDO: node scrapper.mjs

import { chromium } from "playwright";
import fs from "fs";
import { autoScroll } from "./autoScroll.mjs";

const browser = await chromium.launch({
  headless: false,
});

const page = await browser.newPage();

// ------------------- URLS ------------------- //
const urls = [
  "https://www.superxtra.com/supermercado/bebidas-y-jugos?page=1",
  "https://www.superxtra.com/supermercado/bebidas-y-jugos?page=2",
  "https://www.superxtra.com/supermercado/bebidas-y-jugos?page=3",
  "https://www.superxtra.com/supermercado/bebidas-y-jugos?page=4",
];

try {
  let allData = [];
  let idCounter = 1; // Contador global de IDs

  for (const url of urls) {
    console.log(`Visitando: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle",
    });
    await autoScroll(page);
    await page.waitForTimeout(7000);

    // ------------------- WAIT FOR THIS CLASS TO RENDER ------------------- //
    await page.waitForSelector(".vtex-search-result-3-x-gallery section img");

    const data = await page.$$eval(
      // ------------------- PARENT CLASS OF DATA TO BE SCRAPED ------------------- //
      ".vtex-product-summary-2-x-container",
      (results, idCounter) =>
        results.map((el) => {
          // ------------------- ID ------------------- //
          const num = idCounter++;

          // ------------------- NAME ------------------- //
          const productName = el
            .querySelector(
              ".vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName"
            )
            ?.textContent?.trim();

          // ------------------- LINK ------------------- //
          const productLink =
            el.querySelector("a")?.getAttribute("href") &&
            `https://www.superxtra.com${el
              .querySelector("a")
              .getAttribute("href")}`;

          // ------------------- JSON ELEMENTS ------------------- //
          const json = {
            id: num,
            name: productName,
            link: productLink,
          };

          return json;
        }),
      idCounter // Pasar el contador actual como argumento a la función de evaluación
    );

    // Actualizar el contador global para el siguiente lote
    idCounter += data.length;

    allData.push(...data);
  }

  const jsonContent = JSON.stringify({ data: allData }, null, 2);
  fs.writeFileSync("data.json", jsonContent);

  console.log("Scrapping Completado ✔️");
} finally {
  await browser.close();
}
