import json
import pandas as pd

# Leer el archivo JSON
with open('data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Convertir el JSON en un DataFrame de pandas
# Si el JSON es un diccionario con una lista de objetos bajo la clave "data"
df = pd.DataFrame(data["data"])

# Guardar el DataFrame en un archivo .xlsx
df.to_excel('output.xlsx', index=False)

print("El archivo 'output.xlsx' ha sido creado con éxito.")
