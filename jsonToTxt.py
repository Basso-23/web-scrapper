import json

# Leer el archivo JSON
with open('data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extraer los enlaces de cada objeto en "data"
arreglo_cadenas = [item["link"] for item in data["data"]]

# Escribir los enlaces en un archivo de texto llamado "array.txt"
with open('urls.txt', 'w', encoding='utf-8') as output_file:
    for link in arreglo_cadenas:
        output_file.write(link + '\n')

print("Archivo 'urls.txt' creado con éxito.")
