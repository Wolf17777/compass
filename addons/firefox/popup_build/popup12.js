
$('#modal-confirm_delete').find('form').on('submit', function(){ delete_password_submit();return false; })

next_password_delete=0;
function delete_password_prepare(pwid,name,username) {
    next_password_delete = pwid;
    $('#confirm_delete_span').html('Confirm deletion for the password "'+name+'" of the user '+username+'.');
    $('#confirm_delete_totp_pin_container').find('input').val('');
    $('#modal-confirm_delete').modal('show');
}
async function delete_password_submit() {
    
    $('#modal-confirm_delete').modal('hide');

    let data = { 
        'totp_pin': await encrypt_server_key1($('#confirm_delete_totp').val()),
        'delete_id': await encrypt_server_key1(next_password_delete),
    }
    server_api("delete",data, async function( data ) {
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
        } else if (data.passphrase_invalid != null) {
            passphrase_prepare();
        } else if (data.success != null) {
            search_passwords_submit();
        } else {
            add_alert('Internal server error.', 'danger');
        }
    });
    return false;
}

document.getElementById('modal-confirm_delete').addEventListener('shown.bs.modal', event => {
  $('#confirm_delete_totp_pin_container').find('input')[0].focus();
});
