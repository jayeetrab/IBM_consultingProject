from backend.services.processing.ner_extractor import extract_universities

def test_full_name_detection():
    result = extract_universities("ibm held a talk at university of bristol last week")
    assert "University of Bristol" in result

def test_alias_detection():
    result = extract_universities("the ibm event at ucl was amazing")
    assert "University College London" in result

def test_multiple_universities():
    result = extract_universities("events at manchester and edinburgh universities")
    assert len(result) >= 1
