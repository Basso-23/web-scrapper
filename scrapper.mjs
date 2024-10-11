// PARA EJECUTAR USAR COMANDO: node scrapper.mjs

import { chromium } from "playwright";
import fs from "fs";

// Arreglo de URLs a las que quieres hacer scraping
const urls = ["https://www.superxtra.com/supermercado/bebidas-y-jugos?page=1"];

const browser = await chromium.launch({
  headless: false, // Cambiar a false para ver el proceso en la ventana del navegador
});

const page = await browser.newPage();

try {
  // Array para almacenar todas las URLs de imágenes de cada página
  let allProducts = [];

  // Iterar sobre cada URL
  for (const url of urls) {
    console.log(`Visitando: ${url}`);

    await page.goto(url, {
      waitUntil: "networkidle", // Esperar hasta que se haya cargado la mayoría de los recursos
    });

    // Realizar scroll hasta el final de la página
    await autoScroll(page);

    // Esperar 10 segundos para asegurarse de que todo el contenido dinámico se haya cargado
    await page.waitForTimeout(10000);

    // Esperar explícitamente a que las imágenes de los productos se carguen en la página
    await page.waitForSelector(".vtex-search-result-3-x-gallery section img");

    // Ahora proceder con la extracción de los productos
    const products = await page.$$eval(
      ".vtex-product-summary-2-x-container",
      (results) =>
        results.map((el, index) => {
          // Inicializar el objeto de producto con el ID
          const product = {
            id: index + 1, // Agregar un id basado en el índice del mapeo (empezando desde 1)
          };

          // Extraer el atributo href del enlace; Concatenar con la URL base si existe el enlace
          const relativeUrl = el.querySelector("a")?.getAttribute("href");
          product.link = relativeUrl
            ? `https://www.superxtra.com${relativeUrl}`
            : null;

          // Extraer el contenido del span del nombre del producto
          const productName = el
            .querySelector(
              ".vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName"
            )
            ?.textContent?.trim();
          product.name = productName;

          return product;
        })
    );

    // Filtrar productos válidos (que tengan al menos un campo válido) y agregar a la lista general
    const validProducts = products.filter(
      (product) => product.link && product.name
    );

    allProducts.push(...validProducts);
  }

  // Guardar todos los productos en un archivo JSON sin eliminar duplicados
  const jsonContent = JSON.stringify({ products: allProducts }, null, 2); // Formatear el JSON con indentación
  fs.writeFileSync("products.json", jsonContent);

  console.log("Datos de productos guardados en products.json");
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
