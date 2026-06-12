// Web Crypto API based JWT Sign and Verify (Edge runtime safe)

function base64urlEncode(str) {
  // Safe base64url encoding for binary/utf-8 strings
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey(secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey(secret);
  
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(tokenInput)
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const encodedSignature = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return `${tokenInput}.${encodedSignature}`;
}

export async function verifyJWT(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const key = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  
  let binary = '';
  try {
    let base64 = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    binary = atob(base64);
  } catch (e) {
    return null;
  }
  
  const signatureBuffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    signatureBuffer[i] = binary.charCodeAt(i);
  }
  
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    encoder.encode(tokenInput)
  );
  
  if (!isValid) return null;
  
  try {
    return JSON.parse(base64urlDecode(encodedPayload));
  } catch (e) {
    return null;
  }
}
