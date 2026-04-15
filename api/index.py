import os
import sys

# Add the project root to sys.path so 'backend.xxx' imports work
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.insert(0, path)

from backend.main import app
