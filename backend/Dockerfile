# 베이스 이미지
FROM python:3.10-slim

# 시스템 패키지 설치 (mediapipe 등 빌드 위해 필요)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사 및 설치
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 코드 복사
COPY . .

# 포트 설정 (Flask 기본 포트)
EXPOSE 5000

# Flask 앱 실행
CMD ["python", "app.py"]

