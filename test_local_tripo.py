import os
import json
import base64
import urllib.request
import urllib.error

# Pointing to the local Supabase Edge Function
EDGE_FUNCTION_URL = 'http://127.0.0.1:54321/functions/v1/process-scan'

def encode_image_to_base64(filepath):
    if not filepath or not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        file_data = f.read()
    return base64.b64encode(file_data).decode('utf-8')

def test_local_pipeline(front_img, right_img, left_img):
    print(f"Loading images:\n- Front: {front_img}\n- Right: {right_img}\n- Left: {left_img}")
    
    front_b64 = encode_image_to_base64(front_img)
    right_b64 = encode_image_to_base64(right_img)
    left_b64 = encode_image_to_base64(left_img)
    
    if not front_b64 or not right_b64 or not left_b64:
        print("Error: Could not read all 3 image files.")
        return
        
    payload = {
        "user_id": "test_user_123",
        "front_b64": front_b64,
        "right_b64": right_b64,
        "left_b64": left_b64
    }
    
    print("Sending POST request to local Supabase edge function...")
    req = urllib.request.Request(
        EDGE_FUNCTION_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            print("\n✅ Success! Response from Edge Function:")
            print(json.dumps(res_data, indent=2))
    except urllib.error.HTTPError as e:
        print(f"\n❌ HTTP Error {e.code}: {e.read().decode()}")
    except urllib.error.URLError as e:
        print(f"\n❌ Connection Error: {e.reason} (Is Supabase running?)")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("Usage: python test_local_tripo.py <front.jpg> <right.jpg> <left.jpg>")
    else:
        test_local_pipeline(sys.argv[1], sys.argv[2], sys.argv[3])
