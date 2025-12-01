import string, random #Library for bringing chains and random to generate random characters
from validators import url as validate_url #I rename the library to validate that they are real URLs.


ALPHABET = string.ascii_letters + string.digits


def generateCode(lenght=6):
    return "".join((random.choice(ALPHABET)) for _ in range(lenght)) #.join joins all characters into a single string

def validURL(url):
    return validate_url(url) or validate_url("http://" + url)

def check_url_safety(url):
    if not validURL(url):
        return False

    blacklisted = [".onion", ".zip", ".exe", ".rar"]
    if any(ext in url.lower() for ext in blacklisted):
        return False

    return True

def normalize_url(url):
    if validate_url(url):
        return url

    if validate_url("http://" + url):
        return "http://" + url

    return False