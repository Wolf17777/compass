
$('#modal-totp').find('form').on('submit', function(){ get_password_submit();return false; })

document.getElementById('modal-totp').addEventListener('shown.bs.modal', event => {
  $('#input_totp_pin_container').find('input')[0].focus();
});
