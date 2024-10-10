// PARA EJECUTAR USAR COMANDO: node scrapper.mjs

import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({
  headless: false, // Cambiar a false para ver el proceso en la ventana del navegador
});

const page = await browser.newPage();

try {
  await page.goto("https://www.smrey.com/search?name=jugo", {
    waitUntil: "networkidle", // Esperar hasta que se haya cargado la mayoría de los recursos
  });

  // Realizar scroll hasta el final de la página
  await autoScroll(page);

  // Esperar 15 segundos para asegurarse de que todo el contenido dinámico se haya cargado
  await page.waitForTimeout(15000);

  // Esperar explícitamente a que las imágenes de los productos se carguen en la página
  await page.waitForSelector(".card-product-vertical figure img");

  // Ahora proceder con la extracción de los productos
  const products = await page.$$eval(
    ".card-product-vertical figure",
    (results) =>
      results.map((el) => {
        const image = el.querySelector("img")?.getAttribute("src");
        return { image };
      })
  );

  // Extraer las URLs de las imágenes y guardarlas en un archivo .txt
  const imageUrls = products
    .map((product) => product.image)
    .filter(Boolean)
    .join("\n");
  fs.writeFileSync("image_urls.txt", imageUrls);

  console.log("URLs de imágenes guardadas en image_urls.txt");
} finally {
  await browser.close();
}

// Función para realizar el scroll hasta el final de la página
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // Distancia a desplazar en cada iteración
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // Esperar 100ms entre cada desplazamiento
    });
  });
}
