
$("#input_add_password_password").on("input", function(){
    password_update_strength("input_add_password_password", false);
});

$("#input_add_password_password").on("focus", function(){
    password_update_strength("input_add_password_password", false);
});
