import pandas as pd
import io
import json
from datetime import datetime

def test_csv_parsing():
    content = b"text,source\nHello world,test_source\nAnother post,my_source"
    df = pd.read_csv(io.BytesIO(content))
    assert 'text' in df.columns
    assert len(df) == 2
    print("CSV Parsing Test Passed")

def test_column_renaming():
    # Test that it renames 'content' to 'text'
    content = b"content,source\nHello world,test_source"
    df = pd.read_csv(io.BytesIO(content))
    if 'text' not in df.columns:
        text_cols = [c for c in df.columns if 'text' in c.lower() or 'content' in c.lower() or 'msg' in c.lower()]
        if text_cols:
            df = df.rename(columns={text_cols[0]: 'text'})
    assert 'text' in df.columns
    print("Column Renaming Test Passed")

if __name__ == "__main__":
    test_csv_parsing()
    test_column_renaming()
