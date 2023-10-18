
function generatePassword(length=24) {
  _pattern = /[a-zA-Z0-9_\-\+\.]/;
  
  return Array.apply(null, {'length': length})
    .map(function()
    {
      var result;
      while(true) 
      {
        result = String.fromCharCode(window.crypto.getRandomValues(new Uint8Array(1))[0]);
        if(this._pattern.test(result))
        {
          return result;
        }
      }        
    }, this)
    .join('');  
}    

function password_toggle_eye(){
    let eye = this;
    //let input_password = $("#");
    let input_password = $(eye).parent().find("input");
    if(input_password.attr("type") == "password"){
        input_password.attr("type","text")
        $(eye).addClass('eye-slash');
    }else{
        input_password.attr("type","password");
        $(eye).removeClass('eye-slash');
    }
    input_password.trigger( "focus" );
}
function copy_to_clipboard(event) { // target='input'
    let button=$(this); //$('#'+elemid);
    if (button.hasClass('success-hide')) {
        $('.clipboard').removeClass('success');
        button.parent().addClass('success');
        setTimeout( function() { 
            button.parent().removeClass('success');
        }, 10000);
    }
    let target = '';
    if (event.data == undefined) target = 'input';
    else target = event.data.target;
    let target_el = button.parent().find(target);
    if (target_el.val()!='') navigator.clipboard.writeText(target_el.val());
    else navigator.clipboard.writeText(target_el.html());
}
function generate_password_for_input(event) {
    $('#'+event.data.inputid).val(generatePassword());
    $('#'+event.data.inputid).trigger("input");
}
