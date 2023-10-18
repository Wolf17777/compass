
function char_count(str1) {
    var chars = {};
    str1.replace(/\S/g, function(l){chars[l] = (isNaN(chars[l]) ? 1 : chars[l] + 1);});
    return chars;
}

function calc_entropy(string) {

    // get probability of chars in string
    let prob = [];
    let chars = char_count(string);
    for (let char in chars) {
        prob.push( chars[char] / string.length )
    }
    
    // calculate the entropy
    let entropy = 0;
    for (let p of prob) entropy -= p * Math.log(p) / Math.log(2.0);

    return entropy;
}

function entropy_ideal(length) {
    // Calculates the ideal Shannon entropy of a string with given length
    prob = 1.0 / length
    return -1.0 * length * prob * Math.log(prob) / Math.log(2.0)
}

function password_update_strength(password_id,check_valid=true) {
    let pw_popover = $('#'+password_id+'_popover_password');
    let input_new_password = $('#'+password_id);
    let password = input_new_password.val()
    let password_progress_bg = pw_popover.find('.progress');
    let password_progress = password_progress_bg.find('.progress-bar');
    let progress_entropy = $('#'+password_id+'_progress_entropy');
    //let low_upper_case = pw_popover.find(".pw-low-upper-case");
    //let number = pw_popover.find(".pw-one-number");
    //let special_char = pw_popover.find(".pw-one-special-char");
    //let eight_char = pw_popover.find(".pw-eight-character");
    
    let entropy = calc_entropy(password);
    
    let strength = Math.min(100,100*(Math.exp(entropy)-1) / Math.exp(entropy_ideal(16))-1);
    password_progress.css("width",strength+"%")
    if (strength < 33) {
        password_progress.removeClass('bg-warning');
        password_progress.removeClass('bg-success');
        password_progress.addClass('bg-danger');
        progress_entropy.removeClass('text-light');
        //pw_popover.fadeIn();
        if (check_valid)
            input_new_password.removeClass('is-valid');
        progress_entropy.html('Weak (entropy: '+entropy.toFixed(4)+')');
    } else if (strength < 67) {
        password_progress.removeClass('bg-success');
        password_progress.removeClass('bg-danger');
        password_progress.addClass('bg-warning');
        progress_entropy.removeClass('text-light');
        //pw_popover.fadeIn();
        if (check_valid) {
            input_new_password.removeClass('is-invalid');
            input_new_password.addClass('is-valid');
        }
        progress_entropy.html('Fair (entropy: '+entropy.toFixed(4)+')');
    } else {
        password_progress.removeClass('bg-warning');
        password_progress.removeClass('bg-danger');
        password_progress.addClass('bg-success');
        progress_entropy.addClass('text-light');
        //pw_popover.fadeOut();
        if (check_valid) {
            input_new_password.removeClass('is-invalid');
            input_new_password.addClass('is-valid');
        }
        progress_entropy.html('Strong (entropy: '+entropy.toFixed(4)+')');
    }
    if (input_new_password.hasClass('is-valid') || input_new_password.hasClass('is-invalid')) input_new_password.parent().find('.show-pass').css('right','1.5em');
    else input_new_password.parent().find('.show-pass').css('right','0');
    pw_popover.collapse('show');
    return strength;
}

function password_invalid(password_id) {
    let input_new_password = $('#'+password_id);
    input_new_password.addClass('is-invalid');
    input_new_password.parent().find('.show-pass').css('right','1.5em');
    input_new_password.trigger( "focus" );
}

