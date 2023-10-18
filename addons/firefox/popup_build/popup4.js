
function get_pincode(pin_id) {
    let pinContainer = $("#"+pin_id+"_pin_container");
    next = pinContainer.find("input");
    let code = "";
    while (next.val()) {
        code += next.val();
        next = next.next();
    }
    return code;
}

let evt=1;
function pincode_keydown(event) {
    if (event.key != "ArrowLeft" && event.key != "ArrowRight") {
        event.target.value = "";
    }
    //event.preventDefault();
}
function pincode_keyup(event) {
    let val = String(event.target.value).toUpperCase();
    //evt=event
    if (event.key == "ArrowLeft" || (event.key == "Backspace" && val.length === 0)) {
        if (val.length === 0) {
            event.target.value = "";
            $('#'+event.data.pin_id).val(get_pincode(event.data.pin_id))
        }
        let next = event.target;
        while (true) {
            next = next.previousElementSibling
            if (next == null) break;
            if (next.tagName.toLowerCase() == "input") {
                next.focus();
                break;
            }
        }
    } else if (event.key == "ArrowRight") {
        let next = event.target;
        while (true) {
            next = next.nextElementSibling
            if (next == null) break;
            if (next.tagName.toLowerCase() == "input") {
                next.focus();
                break;
            }
        }
    }
}
function pincode_input(event) {
    evt=event;
    let val = String(event.target.value).toUpperCase();
    if (val.length === 0) {
        event.target.value = "";
    }
    let next = event.target;
    while(val.length > 0) {
        if (next.tagName.toLowerCase() == "input") {
            next.value = val[0];
            val = val.slice(1);
        }
        next = next.nextElementSibling;
        if (next == null) break;
    }
    if (next == null) {
        let target_btn = $('.'+event.data.pin_id+'_target');
        target_btn.focus()                     
        
    } else if (next.tagName.toLowerCase() == "input") {
        next.focus();
    }

    $('#'+event.data.pin_id).val(get_pincode(event.data.pin_id))
}
