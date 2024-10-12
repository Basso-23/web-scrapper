// PARA EJECUTAR USAR COMANDO: node scraper-product.mjs

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

    // Intentar acceder a la URL hasta que funcione correctamente
    let success = false;
    while (!success) {
      try {
        // Intentar acceder a la URL
        await page.goto(url, { timeout: 30000 });
        success = true; // Si no hay error, marcar como exitoso
      } catch (error) {
        console.error(`Error al acceder a ${url}: ${error.message}`);
        console.log(`Reintentando acceder a: ${url}`);
        await page.waitForTimeout(5000); // Esperar 5 segundos antes de volver a intentar
      }
    }

    await autoScroll(page);
    await page.waitForTimeout(7000);

    // ------------------- WAIT FOR THIS CLASS TO RENDER ------------------- //
    await page.waitForSelector(".flex.flex-grow-1.w-100.flex-column");

    const data = await page.$$eval(
      // ------------------- PARENT CLASS OF DATA TO BE SCRAPED ------------------- //
      ".flex.flex-grow-1.w-100.flex-column",
      (results, idCounter) =>
        results.map((el) => {
          // ------------------- ID ------------------- //
          const num = idCounter++;

          // ------------------- NAME ------------------- //
          const productName = el
            .querySelector(".vtex-store-components-3-x-productBrand")
            ?.textContent?.trim();

          // ------------------- PRICE ------------------- //
          const productPrice = el
            .querySelector(
              ".superxtrapanama-home-categories-0-x-custom-product-selling-price"
            )
            ?.textContent?.trim();

          // ------------------- BARCODE ------------------- //
          const productBarcode = el
            .querySelector(
              ".vtex-product-identifier-0-x-product-identifier__value"
            )
            ?.textContent?.trim();

          // ------------------- IMAGE ------------------- //
          const productImage = el
            .querySelector(".vtex-store-components-3-x-productImage img")
            .getAttribute("src");

          // ------------------- LINK ------------------- //
          const productLink =
            el.querySelector("a")?.getAttribute("href") &&
            `https://www.superxtra.com${el
              .querySelector("a")
              .getAttribute("href")}`;

          // ------------------- JSON ELEMENTS ------------------- //
          const json = {
            id: num,
            barcode: productBarcode,
            name: productName,
            list_price: productPrice
              ? productPrice
                  .match(/[\d,.]+/)[0]
                  .replace(",", "")
                  .trim()
              : "0.00",
            taxes_id: "EXENTO",
            standard_price: "0.00",
            image_url: productImage,
            pos_categ_id: "Congelados",
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
