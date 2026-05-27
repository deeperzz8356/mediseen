import time
import sys
import os
import httpx
from PIL import Image
import io

BASE = 'http://127.0.0.1:8000'
HEADERS = {'Authorization': 'Bearer dev'}


def wait_for_server(timeout=10.0):
    start = time.monotonic()
    while time.monotonic() - start < timeout:
        try:
            r = httpx.get(BASE + '/')
            if r.status_code == 200:
                print('Server is up')
                return True
        except Exception:
            pass
        time.sleep(0.5)
    print('Server did not start within timeout')
    return False


def test_signup():
    payload = {'name': 'Latency Test User', 'age': 30, 'gender': 'male', 'language': 'en'}
    start = time.monotonic()
    r = httpx.post(BASE + '/auth/register', json=payload, headers=HEADERS, timeout=30.0)
    elapsed = time.monotonic() - start
    print('Signup status:', r.status_code, 'time:', elapsed)
    try:
        print('body:', r.json())
    except Exception:
        print('body (text):', r.text[:200])
    return elapsed


def test_chat():
    payload = {'messages': [{'role': 'user', 'content': 'Tell me a short joke.'}]}
    start = time.monotonic()
    full_text = ''
    first_chunk_time = None
    with httpx.stream('POST', BASE + '/chat', json=payload, headers=HEADERS, timeout=60.0) as resp:
        if resp.status_code != 200:
            body = resp.read()
            print('Chat returned', resp.status_code, body[:200])
            return None
        it = resp.iter_text()
        for chunk in it:
            if chunk:
                if first_chunk_time is None:
                    first_chunk_time = time.monotonic() - start
                full_text += chunk
        total = time.monotonic() - start
    print('Chat: first_chunk_time=', first_chunk_time, 'total_time=', total)
    print('Chat text sample:', full_text[:200])
    return first_chunk_time, total


def test_diagnose():
    # Create small JPEG image in-memory
    img = Image.new('RGB', (100,100), color=(73,109,137))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)

    files = {'image': ('test.jpg', buf.read(), 'image/jpeg')}
    data = {'symptoms': 'no symptoms, test'}
    start = time.monotonic()
    r = httpx.post(BASE + '/diagnose', headers=HEADERS, files=files, data=data, timeout=120.0)
    elapsed = time.monotonic() - start
    print('Diagnose status:', r.status_code, 'time:', elapsed)
    try:
        print('body keys:', list(r.json().keys()))
    except Exception:
        print('body (text):', r.text[:200])
    return elapsed


if __name__ == '__main__':
    if not wait_for_server(15.0):
        sys.exit(1)
    s1 = test_signup()
    ttfc, ttotal = test_chat()
    s3 = test_diagnose()

    print('\nResults:\nSignup:', s1, '\nChat first_chunk:', ttfc, 'total:', ttotal, '\nDiagnose:', s3)
