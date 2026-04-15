from backend.services.processing.classifier import classify_post

def test_technical_classification():
    keywords = {"technical": ["ai", "machine learning"], "non_technical": []}
    assert classify_post("IBM AI workshop", keywords) == "technical"

def test_non_technical_classification():
    keywords = {"technical": [], "non_technical": ["career fair", "networking"]}
    assert classify_post("IBM career fair at Leeds", keywords) == "non_technical"

def test_unknown_classification():
    keywords = {"technical": [], "non_technical": []}
    assert classify_post("IBM was mentioned", keywords) == "unknown"

def test_tie_bias_technical():
    keywords = {"technical": ["cloud"], "non_technical": ["seminar"]}
    assert classify_post("IBM cloud seminar", keywords) == "technical"
