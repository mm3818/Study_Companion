FROM python:3.10-slim

# Install system dependencies including ClamAV
RUN apt-get update && apt-get install -y clamav clamav-daemon && \
    freshclam && \
    apt-get clean

WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY src/ .

# Expose port 5000
EXPOSE 5000
CMD ["python", "app.py"]
