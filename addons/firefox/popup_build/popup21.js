
$('#modal-edit_password').find('form').on('submit', function(){ edit_password_submit();return false; })

function edit_password_prepare(pwid,name,url,username,comment) {
    $('#modal-add_password').find('input').val('');
    $('#input_edit_password_id').val(pwid);
    $('#input_edit_password_name').val(name);
    $('#input_edit_password_url').val(url);
    $('#input_edit_password_username').val(username);
    $('#input_edit_password_comment').val(comment);
    $('#input_edit_password_password').val('');
    let btn = $('#input_edit_password_username').parent().next() 
    btn.show(); btn.next().addClass('d-none');
    $('#modal-edit_password').modal('show');
}
async function edit_password_submit() {
    $('#modal-edit_password').modal('hide');

    // send encoded passphrase and get new pubkey1 from server, also include local pubkey
    // server will also setup totp and send it, encoded by local pubkey
    // let user confirm totp
    
    let data = { 
        'edit_id': await encrypt_server_key1( $('#input_edit_password_id').val() ),
        'name': await encrypt_server_key1( $('#input_edit_password_name').val() ),
        'url': await encrypt_server_key1( $('#input_edit_password_url').val() ),
        'username': await encrypt_server_key1(await encrypt_local_key( $('#input_edit_password_username').val() )),
        'password': await encrypt_server_key1(await encrypt_local_key( $('#input_edit_password_password').val() )),
        'comment': await encrypt_server_key1( $('#input_edit_password_comment').val() ),
        'totp_pin': await encrypt_server_key1($('#input_edit_password_totp').val()), 
    }

    server_api("edit",data, async function( data ) {
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
            $('#modal-edit_password').modal('show');
        } else if (data.passphrase_invalid != null) {
            passphrase_prepare();
        } else if (data.success != null) {
            $('#modal-edit_password').modal('hide');
            $('#modal-edit_password').find('input').val('');
            add_alert('Password changed.', 'success');
            search_passwords_submit();
        } else {
            add_alert('Internal server error.', 'danger');
        }
    });
    return false;
}

$('#edit_password_change_password_button').on('click', function() { $(this).next().removeClass('d-none'); $(this).hide(); })
