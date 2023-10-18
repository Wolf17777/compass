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

    $.post( "server/", data, function( data ) {
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



