function apply_to_site(data) {
    //document.body.style.border = "5px solid green";
    var inputs = document.getElementsByTagName("input");
    let name_set=false;
    for (var i=0; i<inputs.length; i++) {
        if (inputs[i].type.toLowerCase() === "password") {
            inputs[i].value = data.password;
            inputs[i].setAttribute('value', data.password)
        } else if(!name_set) {
            inputs[i].value = data.username;
            inputs[i].setAttribute('value', data.username)
            name_set=true;
        }
    }
}

browser.runtime.onMessage.addListener(data => {
  if (data.command === 'apply_to_site') {
      apply_to_site(data.val)
  }
});

