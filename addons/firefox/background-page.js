
tab_restore = {};

if (false) browser.runtime.sendMessage({command:'prepare_popup'}).then( (success) => {
    document.querySelector('html').innerHTML = browser.extension.getBackgroundPage().document.querySelector('html').innerHTML;
    
    prev_btn = document.getElementById("button_apply_to_site").innerHTML;
    
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState == 'hidden') {
            document.getElementById("button_apply_to_site").innerHTML = prev_btn; 
            document.getElementById("button_apply_to_site").classList.remove("btn-success");
            
            browser.extension.getBackgroundPage().document.querySelector('html').innerHTML = document.querySelector('html').innerHTML;
        }
    });
    document.getElementById("button_apply_to_site").addEventListener("click", apply_to_site);
});

browser.runtime.onMessage.addListener(data => {
  if (false && data.command === 'prepare_popup') {
    browser.tabs.query({ active: true, currentWindow: true }).then( (tabs) => { 
        if (true | last_tab_id == tabs[0].id) {
            //document.getElementById('ho').innerHTML += 'ho';
            return Promise.resolve(true);
        }
        last_tab_id = tabs[0].id;
        
        document.querySelector('html').innerHTML = default_inner;
        
        let url_s = tabs[0].url.replace('https://','').replace('http://','').split('/')[0].split('.');
        
        document.getElementById("input_search_string").value = url_s[url_s.length-2]; 
        //TODO insert tabs[0].title and tabs[0].url into add_password inputs;
        return Promise.resolve(true);
        
    }).catch(reportError);
  } else if (data.command === 'store_tab') {
    tab_restore[data.tab_id] = {
      'search_string': data.search_string,
    }
  }
});


