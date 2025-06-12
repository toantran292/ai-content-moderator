import asyncio, os, redis, json
from uuid import uuid4
from .clip import classify_image

STREAM = "moderation-raw"
GROUP = "cg-image"

r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379"))
try:
    r.xgroup_create(STREAM, GROUP, id="0-0", mkstream=True)
except redis.ResponseError:
    pass  # group exists

async def consume():
    while True:
        resp = r.xreadgroup(GROUP, str(uuid4()), {STREAM: ">"}, count=1, block=0)
        if not resp: continue
        _stream, messages = resp[0]
        _id, kv = messages[0]
        job_id = kv[b'job'].decode()
        scores = classify_image("sample.jpg")   # TODO real path
        print(job_id, scores)
        r.xack(STREAM, GROUP, _id)

if __name__ == "__main__":
    asyncio.run(consume())