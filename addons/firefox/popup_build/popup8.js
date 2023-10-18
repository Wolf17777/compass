
$('#modal-passphrase').find('form').on('submit', function(){ passphrase_submit();return false; })

after_passphrase = null;
function passphrase_prepare(after){
    after_passphrase=after;
    $('#modal-passphrase').modal('show');
}
processing = false;
async function passphrase_submit() {
    
    // send encoded passphrase and get new pubkey1 from server, also include local pubkey
    // server will also setup totp and send it, encoded by local pubkey
    // let user confirm totp
    //if (passphrase_enc == null) {
    let passphrase_enc = await encrypt_server_key2($('#passphrase').val());
    add_passphrase_enc_session(passphrase_enc);
    $('#modal-passphrase').modal('hide');
    get_pkeys();
}

