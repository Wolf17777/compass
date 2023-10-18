     

function fetch_for_ext() {
    browser.storage.local.set({
        'compass_config': window.localStorage.getItem('compass_config'),
    });
    console.log('Info fetched for extension.')
}

//fetch_for_ext();
window.addEventListener("config_successful", fetch_for_ext);
