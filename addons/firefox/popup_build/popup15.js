
$("#input_add_password_password_div").find('.show-pass').on('click', password_toggle_eye);
$("#input_add_password_password_div").find('.success-hide').on('click', copy_to_clipboard);
$("#input_add_password_password_div").find('.success-show').on('click', copy_to_clipboard);
$("#input_add_password_password_generate_button").on('click', {inputid: "input_add_password_password" }, generate_password_for_input);
