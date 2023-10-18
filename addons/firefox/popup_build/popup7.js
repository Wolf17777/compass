
$("#passphrase_div").find('.show-pass').on('click', password_toggle_eye);
$("#passphrase_div").find('.success-hide').on('click', copy_to_clipboard);
$("#passphrase_div").find('.success-show').on('click', copy_to_clipboard);
$("#passphrase_generate_button").on('click', {inputid: "passphrase" }, generate_password_for_input);
