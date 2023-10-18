
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


async function encrypt_server_key1(data) {
    let pubkey = await importPublicKey(compass_config[compass_config.current_user_id].server_pubkey1);
    return encryptMessage(data,pubkey);
}
async function encrypt_server_key2(data) {
    let pubkey = await importPublicKey(compass_config[compass_config.current_user_id].server_pubkey2);
    return encryptMessage(data,pubkey);
}
async function encrypt_local_key(data) {
    let pubkey = await importPublicKey(compass_config[compass_config.current_user_id].local_pubkey);
    return encryptMessage(data,pubkey);
}
async function decrypt_local_key(data) {
    let privkey = await importPrivateKey(compass_config[compass_config.current_user_id].local_privkey);
    return decryptMessage(data,privkey);
}

async function check_local_secret(local_secret) {
    try {
        if (await decrypt_local_key(local_secret) == 'secret') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
} 

processing = false;
async function server_api(path, data, success, fail=undefined) {
    if(processing) return false;
    processing = true;
    
    $("#load_spinner").addClass("active");
    
    data['path'] = path;
    data['passphrase'] = window.sessionStorage.getItem('passphrase_enc');
    data['local_public_key'] = compass_config[compass_config.current_user_id].local_pubkey;
    data["user_id"] = compass_config.current_user_id;

    if (fail == undefined)
        fail = function( e ) {
            console.log(e.responseText);
            add_alert(e.responseText, 'danger');
            $("#load_spinner").removeClass("active");
            processing = false;
        }; 

    $.post( "https://www.comonoid.com/compass/server/", data, function( data ) {
        processing = false;
        $("#load_spinner").removeClass("active");
        success(data);
    }).fail(fail);
    return false;
}


check_setup = false;
async function get_pkeys() {
    let data = {};
    if (check_setup) {
        data['check_setup'] = 1;
    }
    server_api("get_public_keys", data, async function( data ) {
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
        } else if (data.passphrase_invalid != null) {
            if (window.sessionStorage.getItem('passphrase_enc') != null) {
                add_alert('Invalid passphrase', 'danger');
            }
            setTimeout(function() {
                passphrase_prepare(after_passphrase);
            }, 1000);
        } else if (data.key1_pub == null) {
            // generate local pub and private key
            let key = await generateKey();
            compass_config[compass_config.current_user_id]['local_privkey'] = await exportPrivateKey(key.privateKey);
            compass_config[compass_config.current_user_id]['local_pubkey'] = await exportPublicKey(key.publicKey);
            generete_server_key2(); // get new pubkey2 from server
        } else {
            if (await check_local_secret(data.local_secret)) {
                if (after_passphrase != null) {
                        after_passphrase(); 
                        after_passphrase=null;
                } else {
                    search_show();
                }
            } else {
                add_alert('Private key broken.', 'danger');
                $('#div-recover').removeClass('d-none');
            }
            
        }
    });
    return false;
}

function generete_server_key2() {
    // Check if the mail is registered and if it uses two factor authentication
    server_api("setup", {'step': 'generate_key2'}, async function( data ) { 
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
        } else if (data.key2_pub != null) {
            compass_config[compass_config.current_user_id]['server_pubkey2'] = data.key2_pub;
            // ask new keyphrase, save in session, encode by server_pubkey2
            $('#div-passphrase_setup').removeClass('d-none');
        } else {
            add_alert('Internal server error.', 'danger');
        }
    });
    return false;
}




$('#button_apply_to_site').removeClass('d-none');
$('#add_password_toolbar_button').on('click', add_password_prepare);

async function load_config() {
  try {
    let ext_storage = await browser.storage.local.get();
    let r = JSON.parse(ext_storage.compass_config);
    if (r != null) {
      //r['current_user_id'] = ext_storage.current_user_id;
      return r;
    }
    return {};
  } catch (error) {
    return {};
  }
}
function add_passphrase_enc_session(passphrase_enc) {
  browser.extension.getBackgroundPage().sessionStorage.setItem('passphrase_enc',passphrase_enc);
  window.sessionStorage.setItem('passphrase_enc',passphrase_enc);
}

async function init_popup(){
  compass_config = await load_config();
  window.sessionStorage.setItem('passphrase_enc',browser.extension.getBackgroundPage().sessionStorage.getItem('passphrase_enc'));

  if (compass_config.current_user_id == undefined) {
    $('#div-recover').removeClass('d-none');
  } else if (compass_config[compass_config.current_user_id] == undefined) {
    compass_config[compass_config.current_user_id] = {};
    add_alert('Private key broken.', 'danger');
    $('#div-recover').removeClass('d-none');
  }
  else get_pkeys();
}
init_popup();

function apply_to_site() {
    let btn=document.getElementById("button_apply_to_site");
    if (btn.attributes.username==undefined || btn.attributes.password=='') return;
    let username=btn.attributes.username.textContent;
    let password=btn.attributes.password.textContent;
    // await browser.runtime.sendMessage({command:'apply_to_site_bg', val: {username: username, password: password} });
    browser.tabs.query({ active: true, currentWindow: true }).then( (tabs) => { 
        
        browser.tabs.sendMessage(tabs[0].id, {
          command: "apply_to_site",
          val: {username: username, password: password},
        });
      
    } ).catch(reportError);
    
    prev_btn=btn.innerHTML;
    setTimeout(function() { btn.innerHTML = prev_btn; btn.classList.remove("btn-success"); }, 3000);
    btn.innerHTML = "Applied!"
    btn.classList.add("btn-success");
}

popup_tab_id = -1;
function restore_popup(){
  //browser.extension.getBackgroundPage().default_inner = document.querySelector('html').innerHTML;

  browser.tabs.query({ active: true, currentWindow: true }).then( (tabs) => { 
    popup_tab_id = tabs[0].id;
    let tab_restore = browser.extension.getBackgroundPage().tab_restore[popup_tab_id];
    
    if (tab_restore != undefined) {
      document.getElementById("input_search_string").value = tab_restore.search_string; 
      search_passwords_submit();
      //console.log('popup restored');
    } else {
      let url_s = tabs[0].url.replace('https://','').replace('http://','').split('/')[0].split('.');
      document.getElementById("input_search_string").value = url_s[url_s.length-2]; 
      search_passwords_submit();
      //console.log('new popup initialized');
    }
    
    //document.querySelector('html').innerHTML = default_inner;
    //TODO insert tabs[0].title and tabs[0].url into add_password inputs;
    //return Promise.resolve(true);
    
    //prev_btn = document.getElementById("button_apply_to_site").innerHTML;

  }).catch(reportError);
}

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState == 'hidden' && popup_tab_id!=-1) {
        //document.getElementById("button_apply_to_site").innerHTML = prev_btn; 
        //document.getElementById("button_apply_to_site").classList.remove("btn-success");
        browser.runtime.sendMessage({
          command:'store_tab', 
          tab_id: popup_tab_id, 
          search_string:document.getElementById("input_search_string").value,
        });
        //document.querySelector('html').innerHTML;
    }
});
document.getElementById("button_apply_to_site").addEventListener("click", apply_to_site);
window.addEventListener("config_successful", restore_popup);
