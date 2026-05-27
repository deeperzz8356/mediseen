import httpx, time
from PIL import Image
import io

BASE='http://127.0.0.1:8000'
HEADERS={'Authorization':'Bearer dev'}
img = Image.new('RGB', (100,100), color=(73,109,137))
buf=io.BytesIO(); img.save(buf,'JPEG'); buf.seek(0)
files={'image':('test.jpg', buf.read(), 'image/jpeg')}
data={'symptoms':'no symptoms, test'}
start=time.monotonic()
r=httpx.post(BASE+'/diagnose', headers=HEADERS, files=files, data=data, timeout=60.0)
elapsed=time.monotonic()-start
print('status', r.status_code, 'time', elapsed)
try:
    print('cached:', r.json().get('cached'))
except Exception:
    print('body:', r.text[:200])
