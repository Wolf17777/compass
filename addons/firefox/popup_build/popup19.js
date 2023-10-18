
$("#input_edit_password_password").on("input", function(){
    password_update_strength("input_edit_password_password", false);
});

$("#input_edit_password_password").on("focus", function(){
    password_update_strength("input_edit_password_password", false);
});
