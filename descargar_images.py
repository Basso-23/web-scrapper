# PARA EJECUTAR USAR COMANDO: python descargar_images.py

import os
import requests
from urllib.parse import urlparse

# Crear la carpeta 'imagenes' si no existe
os.makedirs("imagenes", exist_ok=True)

# Leer las URLs de las imágenes desde el archivo 'image_urls.txt'
with open("image_urls.txt", "r") as file:
    image_urls = file.readlines()

# Función para obtener la extensión de la imagen desde la URL
def get_image_extension(url):
    # Extraer la ruta del archivo desde la URL
    path = urlparse(url).path
    # Obtener la extensión del archivo (ej: .jpg, .png, etc.)
    ext = os.path.splitext(path)[1]
    # Si no se encuentra una extensión, usar .jpg por defecto
    return ext if ext else ".jpg"

# Descargar cada imagen y guardarla en la carpeta 'imagenes'
for index, url in enumerate(image_urls):
    url = url.strip()  # Eliminar cualquier espacio o salto de línea extra
    if url:  # Verificar que la URL no esté vacía
        try:
            response = requests.get(url)
            response.raise_for_status()  # Verificar que la descarga fue exitosa
            
            # Obtener la extensión correcta de la imagen
            ext = get_image_extension(url)
            # Guardar la imagen con un nombre secuencial y la extensión correspondiente
            image_path = os.path.join("imagenes", f"image_{index + 1}{ext}")
            
            # Escribir el contenido de la imagen en el archivo
            with open(image_path, "wb") as img_file:
                img_file.write(response.content)
            
            print(f"Imagen descargada y guardada: {image_path}")
        except requests.exceptions.RequestException as e:
            print(f"Error al descargar la imagen {url}: {e}")
