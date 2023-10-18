
$('#div-search').find('form').on('submit', function(){ search_passwords_submit();return false; })

function search_show() {
    window.dispatchEvent(new Event("config_successful"));
    $('#div-search').removeClass('d-none');
    $('#toolbar').removeClass('d-none');
    if ($('#input_search_string').val() == '') {
        $('#input_search_string').focus();
    } else {
        search_passwords_submit();
    }
}

async function search_passwords_submit() {
    
    // send encoded passphrase and get new pubkey1 from server, also include local pubkey
    // server will also setup totp and send it, encoded by local pubkey
    // let user confirm totp
    
    let data = { 
        'meta': 1,
        'search_string': await encrypt_server_key1($('#input_search_string').val()),
    }
    server_api("search",data, async function( data ) {
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
        } else if (data.passphrase_invalid != null) {
            passphrase_prepare();
        } else if (data.passwords != null) {
            init_results(data.passwords);
            $('#div-results').removeClass('d-none');
        } else {
            add_alert('Internal server error.', 'danger');
        }
    });
    return false;
}
