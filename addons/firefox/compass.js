
async function apply_to_site(){
    let btn=document.getElementById("button_apply_to_site");
    let username=btn.attributes.username.textContent;
    let password=btn.attributes.password.textContent;
    if (password==undefined || password=='') return;
    await browser.runtime.sendMessage({command:'apply_to_site_bg', val: {username: username, password: password} });
    prev_btn=btn.innerHTML;
    setTimeout(function() { btn.innerHTML = prev_btn; btn.classList.remove("btn-success"); }, 3000);
    btn.innerHTML = "Applied!"
    btn.classList.add("btn-success");
}

browser.runtime.sendMessage({command:'get_search_url'}).then( (url) => {
    let url_s = url.replace('https://','').replace('http://','').split('/')[0].split('.');
    document.getElementById("input_search_string").value = url_s[url_s.length-2]; 
});

document.getElementById("button_apply_to_site").addEventListener("click", apply_to_site);

