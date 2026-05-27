import asyncio
import sys
import os

# Ensure workspace root is on sys.path so `backend` package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from backend.services.chat_svc import stream_chat_response
except Exception as e:
    print('IMPORT_ERROR', e)
    raise

async def run():
    print('Starting async generator test')
    try:
        async for chunk in stream_chat_response([{'role':'user','content':'Tell me a short joke.'}]):
            print('CHUNK:', repr(chunk))
    except Exception as e:
        print('RUNTIME_ERROR', e)

if __name__ == '__main__':
    asyncio.run(run())
