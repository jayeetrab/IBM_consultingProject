import spacy
import json
import os

nlp = spacy.load("en_core_web_sm")

_geo_path = os.path.join(os.path.dirname(__file__), "../geolocation/uk_ireland_universities.json")
with open(_geo_path, "r") as f:
    _uni_data = json.load(f)

UNI_NAMES = {name.lower(): name for name in _uni_data.keys()}

# Additional short-form aliases
ALIASES = {
    "bristol": "University of Bristol",
    "oxford": "University of Oxford",
    "cambridge": "University of Cambridge",
    "imperial": "Imperial College London",
    "ucl": "University College London",
    "kcl": "King's College London",
    "lse": "London School of Economics",
    "edinburgh": "University of Edinburgh",
    "glasgow": "University of Glasgow",
    "manchester": "University of Manchester",
    "liverpool": "University of Liverpool",
    "leeds": "University of Leeds",
    "sheffield": "University of Sheffield",
    "warwick": "University of Warwick",
    "nottingham": "University of Nottingham",
    "southampton": "University of Southampton",
    "bath": "University of Bath",
    "exeter": "Exeter University",
    "newcastle": "Newcastle University",
    "durham": "Durham University",
    "tcd": "Trinity College Dublin",
    "ucd": "University College Dublin",
    "ucc": "University College Cork",
    "dcu": "Dublin City University",
    "qub": "Queen's University Belfast"
}

def extract_universities(text: str) -> list[str]:
    found = set()

    doc = nlp(text)
    ner_orgs = [ent.text.lower() for ent in doc.ents if ent.label_ == "ORG"]

    for org in ner_orgs:
        for uni_key, uni_name in UNI_NAMES.items():
            if any(word in org for word in uni_key.split() if len(word) > 4):
                found.add(uni_name)

    for alias, uni_name in ALIASES.items():
        if alias in text.split():
            found.add(uni_name)

    for uni_key, uni_name in UNI_NAMES.items():
        if uni_key in text:
            found.add(uni_name)

    return list(found)
