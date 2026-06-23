import os
import json
import time
import urllib.request
import urllib.error

TRIPO_API_KEY = "tsk_HKQMHXaW2teLDJPGl7PSy_wpkryqi-N2CGrBqP_Swqo"
TRIPO_API_BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

def tripo_fetch(path, method='GET', body=None, headers=None):
    if headers is None:
        headers = {}
    headers['Authorization'] = f"Bearer {TRIPO_API_KEY}"
    
    url = f"{TRIPO_API_BASE_URL}{path}"
    data = None
    if body is not None:
        if isinstance(body, dict):
            data = json.dumps(body).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        else:
            data = body
            
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        raise

def upload_file(filepath):
    print(f"Uploading {filepath}...")
    import mimetypes
    content_type, _ = mimetypes.guess_type(filepath)
    if not content_type:
        content_type = 'application/octet-stream'

    with open(filepath, 'rb') as f:
        file_data = f.read()

    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    body.extend(f'--{boundary}\r\n'.encode('utf-8'))
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(filepath)}"\r\n'.encode('utf-8'))
    body.extend(f'Content-Type: {content_type}\r\n\r\n'.encode('utf-8'))
    body.extend(file_data)
    body.extend(f'\r\n--{boundary}--\r\n'.encode('utf-8'))

    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body))
    }

    payload = tripo_fetch('/upload', method='POST', body=body, headers=headers)
    token = payload.get('data', {}).get('image_token') or payload.get('data', {}).get('file_token') or payload.get('data', {}).get('token')
    if not token:
        raise Exception(f"Upload failed: {payload}")
    return token

def test_tripo_pipeline(front_img, right_img, left_img):
    print("1. Uploading images...")
    front_token = upload_file(front_img)
    right_token = upload_file(right_img)
    left_token = upload_file(left_img)
    
    print("2. Dispatching multiview_to_model task...")
    task_payload = {
        "type": "multiview_to_model",
        "files": [
            {"type": "jpg", "file_token": front_token},
            {"type": "jpg", "file_token": left_token},
            {},
            {"type": "jpg", "file_token": right_token}
        ],
        "quad": False,
        "face_limit": 10000,
        "texture_quality": "standard",
        "pbr": True,
        "model_version": "v3.1-20260211"
    }
    
    res = tripo_fetch('/task', method='POST', body=task_payload)
    task_id = res.get('data', {}).get('task_id') or res.get('data', {}).get('id')
    if not task_id:
        raise Exception(f"Task creation failed: {res}")
        
    print(f"Task ID: {task_id}")
    print("3. Polling for completion...")
    
    started_at = time.time()
    while time.time() - started_at < 300:
        task_res = tripo_fetch(f'/task/{task_id}', method='GET')
        task = task_res.get('data', task_res)
        status = task.get('status', '').lower()
        
        print(f"[{int(time.time() - started_at)}s] Status: {status}")
        
        if status in ['success', 'succeeded', 'completed', 'complete']:
            print("Task completed successfully!")
            print(json.dumps(task, indent=2))
            return task
        elif status in ['failed', 'failure', 'cancelled', 'canceled', 'error']:
            raise Exception(f"Task failed: {task}")
            
        time.sleep(5)
        
    raise Exception("Timeout waiting for task")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("Usage: python test_tripo.py <front.jpg> <right.jpg> <left.jpg>")
    else:
        test_tripo_pipeline(sys.argv[1], sys.argv[2], sys.argv[3])
