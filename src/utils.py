import string, random #Libreria para traer cadenas y random para generar caracteres aleatorios
from validators import url as validate_url #Renombro la libreria para validar que sean urls reales

ALPHABET = string.ascii_letters + string.digits


def generateCode(lenght=6):
    return "".join((random.choice(ALPHABET)) for _ in range(lenght)) #.join une todos los caracteres en una sola cadena

def validURL(url):
    return validate_url(url) or validate_url("http://" + url)