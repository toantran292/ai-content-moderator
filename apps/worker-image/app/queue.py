import os, json, asyncio, tempfile, redis, boto3, psycopg
from uuid import uuid4
from .clip import classify_image

# ----- ENV ---------------------------------------------------
REDIS_URL   = os.getenv("REDIS_URL", "redis://redis:6379")
DB_URL      = os.getenv("DB_URL", "postgres://postgres:example@postgres:5432/content_moderator")
MINIO_URL   = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_KEY   = os.getenv("MINIO_ACCESS_KEY", "minio")
MINIO_SECRET= os.getenv("MINIO_SECRET_KEY", "miniopass")
BUCKET      = os.getenv("MINIO_BUCKET", "uploads")

# ----- Redis -------------------------------------------------
STREAM = "moderation-raw"
GROUP  = "cg-image"
r = redis.Redis.from_url(REDIS_URL, decode_responses=False)
try:
    r.xgroup_create(STREAM, GROUP, id="0-0", mkstream=True)
except redis.ResponseError:
    pass  # group exists

# ----- MinIO (S3) -------------------------------------------
s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_URL,
    aws_access_key_id=MINIO_KEY,
    aws_secret_access_key=MINIO_SECRET,
)

# ----- Postgres ---------------------------------------------
db = psycopg.connect(DB_URL, autocommit=True)
cur = db.cursor()

# ------------------------------------------------------------
async def consume():
    while True:
        resp = r.xreadgroup(GROUP, f"worker-{uuid4()}", {STREAM: ">"}, count=1, block=0)
        if not resp:
            continue
        _stream, messages = resp[0]
        msg_id, kv = messages[0]

        # 1. Extract fields
        job_id   = kv[b'jobId'].decode()
        object_key = kv[b'objectKey'].decode()

        try:
            # 2. Download object to temp file
            tmp = tempfile.NamedTemporaryFile(delete=False)
            s3.download_file(BUCKET, object_key, tmp.name)

            # 3. Classify
            scores = classify_image(tmp.name)
            score  = float(max(scores.values()))

            # 4. Update DB
            cur.execute(
                "UPDATE jobs SET status='COMPLETED', labels=%s, score=%s "
                "WHERE id=%s",
                (json.dumps(scores), score, job_id),
            )

            print(f"[OK] {job_id} {scores}")
            r.xack(STREAM, GROUP, msg_id)

        except Exception as e:
            print(f"[ERR] {job_id}: {e}")
            # Decide: leave message pending for retry or move to dead-letter

# ------------------------------------------------------------
if __name__ == "__main__":
    asyncio.run(consume())