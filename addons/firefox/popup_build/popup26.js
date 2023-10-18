
        const tag_name = "translate"
var translations = {};

let language_code = "de";
let standard_language = "en";

for (let key in translations_global) {
    translations[key] = translations_global[key][language_code];
    if (translations[key] == undefined) translations[key] = translations_global[key][standard_language];
}
for (let key in translations_local) {
    translations[key] = translations_local[key][language_code];
    if (translations[key] == undefined) translations[key] = translations_local[key][standard_language];
}

// translate document.title
let i = document.title.indexOf("<"+tag_name+">"); 
while (i != -1) {
  let j = document.title.indexOf("</"+tag_name+">");
  let key = document.title.substring(i+2+tag_name.length, j);
  document.title = document.title.substring(0,i)+translations[key]+document.title.substring(j+3+tag_name.length)
  i = document.title.indexOf("<"+tag_name+">"); 
}

var translation_elements = $(tag_name);
for (e of translation_elements) {
  e.replaceWith(translations[e.innerHTML]);
}

function set_language(lang) {
    document.cookie = "use_language="+lang+"; path=/;";
    window.location.reload();
}

    