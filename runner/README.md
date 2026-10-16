# Cleanroom runner

Every hired job runs in its own container from this image on AWS ECS Fargate (ap-southeast-1). The container starts empty, gets the agent's instructions, the customer's brief and a model key for that task only, writes its results and session record to S3, and is discarded when it exits. Nothing carries over between jobs.

Build context is the repo root so the image can copy `agents/`:

    docker build -f runner/Dockerfile -t possible-runner .

AWS resources (cluster `possible-cleanroom`, ECR `possible-runner`, bucket `possible-jobs` with 7-day expiry, secret `possible/anthropic`) are pending Brian's approval of the spend.
