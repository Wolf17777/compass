function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function importPublicKey(pem) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length - 1,
  );
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
}
async function importPrivateKey(pem) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length - 1,
  );
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  );
}

async function publicKeyFromPrivateKey(priv_key) {
  // export private key to JWK
  const jwk = await crypto.subtle.exportKey("jwk", priv_key);

  // remove private data from JWK
  delete jwk.d;
  delete jwk.dp;
  delete jwk.dq;
  delete jwk.q;
  delete jwk.qi;
  jwk.key_ops = ["encrypt"];

  // import public key
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
}

async function exportPrivateKey(key) {
    const exported = await window.crypto.subtle.exportKey(
        "pkcs8",
        key
    );
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
    return pemExported;
}
async function exportPublicKey(key) {
    const exported = await window.crypto.subtle.exportKey(
      "spki",
      key
    );
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    return pemExported;
}

async function generateKey() {
	return window.crypto.subtle.generateKey(
	    {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
	    true, //whether the key is extractable (i.e. can be used in exportKey)
	    ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
	)
}

async function encryptMessage(message,publicKey) {
    let enc = new TextEncoder();
    let message_enc = enc.encode(message);
    let buffer = new ArrayBuffer();
    for (let i=0; i<message_enc.length/446; i++) {
      buffer = await new Blob([ 
        buffer, 
        await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            message_enc.slice(i*446,(i+1)*446)
        )
      ]).arrayBuffer();
    }
    return window.btoa(ab2str(buffer));
}

async function decryptMessage(ciphertext,privateKey) {
  let message_buf = str2ab(window.atob(ciphertext))
  let buffer = new ArrayBuffer();
  for (let i=0; i<message_buf.byteLength/512; i++) {
    buffer = await new Blob([ 
      buffer,
      await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        message_buf.slice(i*512,(i+1)*512),
      )
    ]).arrayBuffer();
  }
  return ab2str(buffer);
}

function generatePassword(length=24) {
  
  _pattern = /[a-zA-Z0-9_\-\+\.!@#$%^&*]/;
  
  return Array.apply(null, {'length': length})
    .map(function()
    {
      var result;
      while(true) 
      {
        result = String.fromCharCode(window.crypto.getRandomValues(new Uint8Array(1))[0]);
        if(this._pattern.test(result))
        {
          return result;
        }
      }        
    }, this)
    .join('');  
}    

