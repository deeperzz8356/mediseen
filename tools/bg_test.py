import sys
import os
import time

# allow importing backend package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services import firebase_svc
from fastapi.background import BackgroundTasks


def background_wrapper():
    print('Calling firebase service helpers directly (they handle missing DB gracefully)')
    try:
        firebase_svc.increment_cache_hit('dummyhash123')
        print('increment_cache_hit called')
    except Exception as e:
        print('increment_cache_hit error', e)

    try:
        firebase_svc.save_diagnosis_cache('dummyhash123', {'diagnosis': 'none', 'confidence': 0.0})
        print('save_diagnosis_cache called')
    except Exception as e:
        print('save_diagnosis_cache error', e)

    try:
        firebase_svc.save_diagnosis_record('uid-test', 'session-test', 'no symptoms', {'diagnosis': 'none'}, 'http://example.com/image.jpg')
        print('save_diagnosis_record called')
    except Exception as e:
        print('save_diagnosis_record error', e)


if __name__ == '__main__':
    print('Starting background-tasks smoke test')
    background_wrapper()
    print('Done')
