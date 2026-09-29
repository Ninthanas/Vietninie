import hashlib
import hmac
import base64
import json
import uuid
import time
from typing import Optional
from config import settings

SECRET_KEY = settings.secret_key

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = uuid.uuid4().hex
    hash_obj = hashlib.sha256(f"{password}{salt}".encode('utf-8'))
    hashed = hash_obj.hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, hashed: str) -> bool:
    try:
        salt, _ = hashed.split(":")
        return hash_password(password, salt) == hashed
    except ValueError:
        return False

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(user_id: str, username: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "username": username,
        "exp": int(time.time()) + 30 * 24 * 60 * 60  # 30 days
    }
    
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    msg = f"{header_b64}.{payload_b64}"
    signature = hmac.new(SECRET_KEY.encode('utf-8'), msg.encode('utf-8'), hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{msg}.{signature_b64}"

def verify_token(token: str) -> Optional[dict]:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
        msg = f"{header_b64}.{payload_b64}"
        expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), msg.encode('utf-8'), hashlib.sha256).digest()
        
        if not hmac.compare_digest(base64url_encode(expected_signature), signature_b64):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

def generate_user_id() -> str:
    return str(uuid.uuid4())
