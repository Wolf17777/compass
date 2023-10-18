
$('#modal-add_password').find('form').on('submit', function(){ add_password_submit();return false; })

function add_password_prepare() {
    //$('#modal-add_password').find('input').val('');
    $('#input_add_password_password_generate_button').trigger('click');
    $('#modal-add_password').modal('show');
}

async function add_password_submit() {
    
    $('#modal-add_password').modal('hide');
    
    // send encoded passphrase and get new pubkey1 from server, also include local pubkey
    // server will also setup totp and send it, encoded by local pubkey
    // let user confirm totp
    
    let data = { 
        'name': await encrypt_server_key1( $('#input_add_password_name').val() ),
        'url': await encrypt_server_key1( $('#input_add_password_url').val() ),
        'username': await encrypt_server_key1(await encrypt_local_key( $('#input_add_password_username').val() )),
        'password': await encrypt_server_key1(await encrypt_local_key( $('#input_add_password_password').val() )),
        'comment': await encrypt_server_key1( $('#input_add_password_comment').val() ),
    }
    server_api("add", data, async function( data ) {
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
            $('#modal-add_password').modal('show');
        } else if (data.passphrase_invalid != null) {
            passphrase_prepare();
        } else if (data.success != null) {
            $('#modal-add_password').find('input').val('');
            add_alert('Password added.', 'success');
            search_passwords_submit();
        } else {
            add_alert('Internal server error.', 'danger');
        }
        
    });
    return false;
}
