# Possible cleanroom runner: one container per hired job, discarded on exit.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python3-venv chromium ffmpeg libreoffice-impress git ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/py && /opt/py/bin/pip install --no-cache-dir build123d python-pptx \
  && curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip -o /tmp/aws.zip \
  && unzip -q /tmp/aws.zip -d /tmp && /tmp/aws/install && rm -rf /tmp/aws /tmp/aws.zip
ENV PATH="/opt/py/bin:${PATH}" CHROME_PATH=/usr/bin/chromium

RUN npm install -g @anthropic-ai/claude-code && curl -fsSL https://possible.sh/install.sh | POSSIBLE_INSTALL_DIR=/usr/local/bin sh

COPY agents /possible/agents
COPY runner/run-job.sh /possible/run-job.sh

RUN useradd -m agent && mkdir /work && chown agent /work
USER agent
WORKDIR /work
ENTRYPOINT ["/possible/run-job.sh"]
