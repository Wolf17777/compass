
document.getElementById('modal-show_credentials').addEventListener('hidden.bs.modal', event => {
  $('#modal-show_credentials').find('input').val('');
});
$("#show_credentials_username_div").find('.success-hide').on('click', copy_to_clipboard);
$("#show_credentials_username_div").find('.success-show').on('click', copy_to_clipboard);
