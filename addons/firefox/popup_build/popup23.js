
function password_toggle_eye_span() {
    span = $(this);
    let content_span = span.parent().find('a').find('span');
    if(!span.hasClass('eye-slash')){
        content_span.html(span.parent().find('input').val());
        span.addClass('eye-slash');
    }else{
        content_span.html('••••••••');
        span.removeClass('eye-slash');
    }
}

next_get_password = 0;
function get_password_prepare(pwid) {
    next_get_password = pwid;
    $('#input_totp_pin_container').find('input').val('') 
    $('#modal-totp').modal('show');
}

async function get_password_submit() {
    
    $('#modal-totp').modal('hide');

    // send encoded passphrase and get new pubkey1 from server, also include local pubkey
    // server will also setup totp and send it, encoded by local pubkey
    // let user confirm totp
    
    let data = { 
        'get_id': await encrypt_server_key1(next_get_password),
        'totp_pin': await encrypt_server_key1($('#input_totp').val()),
    }

    server_api("get",data, async function( data ) {
        if (data.error != undefined) {
            add_alert(data.error, 'danger');
        } else if (data.passphrase_invalid != null) {
            passphrase_prepare(get_password_submit);
        } else if (data.password != null) {
            //$('#input_credentials_username').val(await decrypt_local_key(data.password['username']));
            //$('#input_credentials_password').val(await decrypt_local_key(data.password['password']));
            $('.clipboard').removeClass('success');
            //$('#modal-show_credentials').modal('show');
            let pwusername = await decrypt_local_key(data.password['username']);
            let pwname = '';
            if (data.password['name'] != null && data.password['name'] != undefined) 
                pwname = await decrypt_local_key(data.password['name']);
            let pwurl = '';
            if (data.password['url'] != null && data.password['url'] != undefined) 
                pwurl = await decrypt_local_key(data.password['url']);
            let pwcomment = '';
            if (data.password['comment'] != null && data.password['comment'] != undefined) 
                pwcomment = await decrypt_local_key(data.password['comment']);
            let pw = await decrypt_local_key(data.password['password']);
            let pwid = await decrypt_local_key(data.password['id'])
            $('#table_password'+pwid).html(`
            <div class="clipboard position-relative">
                <input class="d-none">
                <a title="Copy to clipboard" href='#' class="d-flex success-hide form-control text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Copy to clipboard">
                    <span class='me-5'>••••••••</span>
                    <svg class="ms-auto bi clipboard" width='1.8rem' height='1.8rem'><use xlink:href="#bi-clipboard"/></svg>
                </a>
                <a title="Copied!" href='#' class="success-show-flex link-success form-control text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Copied!">
                    <span class='me-5'>••••••••</span>
                    <svg class="ms-auto bi" width='1.8rem' height='1.8rem'><use xlink:href="#bi-clipboard-check"/></svg>
                </a>
                <span class='show-pass position-absolute' style="right: 52px;top: 8px;">
                    <svg class="icon-eye bi" width='1.8rem' height='1.8rem'><use xlink:href="#bi-eye"/></svg>
                    <svg class="icon-eye-slash bi" width='1.8rem' height='1.8rem'><use xlink:href="#bi-eye-slash"/></svg>
                </span>
            </div>
            `);
            $('#table_password'+pwid).find('input').val(pw);
            $('#table_password'+pwid).find('.show-pass').off('click');
            $('#table_password'+pwid).find('.success-hide').off('click');
            $('#table_password'+pwid).find('.success-show-flex').off('click');
            $('#table_password'+pwid).find('.show-pass').on('click', password_toggle_eye_span);
            $('#table_password'+pwid).find('.success-hide').on('click', copy_to_clipboard);
            $('#table_password'+pwid).find('.success-show-flex').on('click', copy_to_clipboard);
            password_tile_show(pwid,pwname,pwurl,pwusername,pwcomment);
            refresh_tooltips([...$('#table_password'+pwid).find('[data-bs-toggle="tooltip"]')]);
        } else {
            add_alert('Internal server error.', 'danger');
        }
    });
    return false;
}

function usernameFormatter(value, row, index,field) {
  let f = `<div class="clipboard">
	<a title="Copy to clipboard" href='#' class="username_formatter d-flex success-hide form-control text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Copy to clipboard">
        <span class='me-1'>`+value+`</span>
	    <svg class="ms-auto bi clipboard" width='1.8rem' height='1.8rem'><use xlink:href="#bi-clipboard"/></svg>
    </a>
	<a title="Copied!" href='#' class="username_formatter success-show-flex link-success form-control text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Copied!">
        <span class='me-1'>`+value+`</span>
	    <svg class="ms-auto bi" width='1.8rem' height='1.8rem'><use xlink:href="#bi-clipboard-check"/></svg>
    </a>
  </div>
  `
  return f;
}
function passwordFormatter(value, row, index,field) {
  let f = '<div id="table_password'+value.id+'"><a href="#" title="Show" class="link-dark" onclick="reset_reclick(); get_password_prepare(\''+value.id+'\')"><svg class="bi" width="1.8rem" height="1.8rem"><use xlink:href="#bi-eye"/></svg></a></div>';
  return f;
}
function operateFormatter(value, row, index,field) {
  let f = '<a href="#" title="Edit" class="link-dark" onclick="edit_password_prepare(\''+value.id+'\',\''+row.name+'\',\''+row.url+'\',\''+row.username+'\',\''+row.comment+'\')"><svg class="bi" width="1.8rem" height="1.8rem"><use xlink:href="#pencil-fill"/></svg></a><a href="#" title="Delete"  class="link-dark" onclick="delete_password_prepare(\''+value.id+'\',\''+row.name+'\',\''+row.username+'\')"><svg class="bi ms-2" width="1.8rem" height="1.8rem"><use xlink:href="#trash-fill"/></svg></a>';
  return f;
}

async function init_results(passwords) {
    let columns = [
        { field: "name", title: "Name", sortable: true },
        { field: "username", title: "Username", sortable: true, formatter: usernameFormatter  },
        { field: 'password', title: 'Password', align: 'center', formatter: passwordFormatter },
        { field: "url", title: "URL", sortable: true },
        { field: "comment", title: "Comment", sortable: true },
        { field: 'operate', title: 'Operate', align: 'center', formatter: operateFormatter },
    ];
    let rows = [];
    $('#div-results-tile-detail').hide();
    if (passwords.length==0) {
        $('#div-results-tiles').html('<div class="col">No matching records found</div>');
        $('#div-results-tiles').show();
    } else {
        $('#div-results-tiles').html('');
        $('#div-results-tiles').hide();
    }
    for (let pw of passwords) {
        let row = {}
        for (let key in pw) {
            if (pw[key] != null && pw[key] != undefined)
                row[key] = await decrypt_local_key(pw[key])
        }
        let rowid = await decrypt_local_key(pw['id']);
        row["password"] = {id:rowid};
        row["operate"] = {id:rowid};
        rows.push(row);
        $('#div-results-tiles').append(`
        <div class="col position-relative" style="transition: all 0.5s; right: 100%;">
            <div style="cursor: pointer;" class="card rounded-3 shadow-sm">
                <div class="card-body d-flex">
                    <div>
                    <h5 class="card-title">`+row.name+`</h5>
                    <h6 class="card-subtitle mb-3 text-muted">`+row.url+`</h6>
                    <p class="card-text">`+row.username+`</p>
                    </div>
                    <div class='ms-auto my-auto ps-2'>
                    <svg class="bi" width="1.2em" height="1.2em"><use xlink:href="#chevron-right"/></svg>
                    </div>
                </div>
            </div>
        </div>
        `);
        $('#div-results-tiles').children().last().find('.card').on('click',{ rowid:rowid,row:row},function(event){ password_tile_show(event.data.rowid,event.data.row.name,event.data.row.url,event.data.row.username,event.data.row.comment) });
        if (passwords.length==1) {
            password_tile_show(rowid,row.name,row.url,row.username,row.comment);
        } else {
            password_tile_hide();
        }
    }
    initTable('table_passwords',rows,columns);
    refresh_tooltips([...$('#div-results-lg').find('[data-bs-toggle="tooltip"]')]);
    $('#div-results-lg').find('.username_formatter').on('click',{target:'span'},copy_to_clipboard);
}

reclick_apply=false;
reclick_clipboard=false;
reclick_eye=false;
function reset_reclick(){
    reclick_apply=false;
    reclick_clipboard=false;
    reclick_eye=false;
}
function password_tile_show(pwid,pwname,pwurl,pwusername,pwcomment) {
    $('#div-results-tile-detail-name').html(pwname);
    $('#div-results-tile-detail-url').html(pwurl);
    $('#div-results-tile-detail-username1').html(pwusername);
    $('#div-results-tile-detail-username2').html(pwusername);
    $('#div-results-tile-detail-comment').html(pwcomment);
    $("#div-results-tile-detail-edit").on("click",{pwid:pwid,pwname:pwname,pwurl:pwurl,pwusername:pwusername,pwcomment:pwcomment},function(event) {edit_password_prepare(event.data.pwid,event.data.pwname,event.data.pwurl,event.data.pwusername,event.data.pwcomment);});
    $("#div-results-tile-detail-delete").on("click",{pwid:pwid,pwname:pwname,pwusername:pwusername},function(event) {delete_password_prepare(event.data.pwid,event.data.pwname,event.data.pwusername);});
    $('#button_apply_to_site').attr('username',pwusername);
    let show_pass_span = $('#div-results-tile-detail-password').parent().find('.show-pass');
    let pw_a = show_pass_span.parent().find('a');
    pw_a.find('span').html('••••••••');
    show_pass_span.removeClass('eye-slash');
    
    let pw=$('#table_password'+pwid).find('input').val() 
    if (pw!=undefined) {
        $('#button_apply_to_site').attr('password',pw);
        $("#button_apply_to_site").off("click");
        $('#div-results-tile-detail-password').val(pw);
        show_pass_span.off("click");
        pw_a.off("click");
        show_pass_span.on("click",password_toggle_eye_span);
        pw_a.on("click",copy_to_clipboard);
        if (reclick_apply) {
            $('#button_apply_to_site').trigger('click');
            reclick_apply=false;
        } else if (reclick_eye) {
            show_pass_span.trigger('click')
        } else if (reclick_clipboard) {
            $(pw_a[0]).trigger('click')
        }
    } else {
        $('#button_apply_to_site').attr('password','');
        $("#button_apply_to_site").off('click')
        $("#button_apply_to_site").on("click",{pwid:pwid}, function(event) {reset_reclick(); reclick_apply=true; get_password_prepare(event.data.pwid); });
        show_pass_span.off("click");
        pw_a.off("click");
        show_pass_span.on("click",{pwid:pwid}, function(event) {reset_reclick(); reclick_eye=true; get_password_prepare(event.data.pwid); } );
        pw_a.on("click", {pwid:pwid}, function(event) { reset_reclick(); reclick_clipboard=true; get_password_prepare(event.data.pwid); });
        $('#div-results-tile-detail-password').val('');
    }
    $('#div-results-tiles').hide();
    $('#div-results-tiles').children().css("right","100%");
    $('#div-results-tile-detail').show();
    $('#div-results-tile-detail').children().animate({"left":"0"}, {duration:100});
}
function password_tile_hide() {
    reset_reclick();
    $('#div-results-tile-detail').hide();
    $('#div-results-tile-detail').children().css("left","100%");
    $('#div-results-tiles').show();
    $('#div-results-tiles').children().animate({ "right": "0" }, {duration:100});
}

$('#div-results-tiles').hide();
$('#div-results-tile-detail').hide();

$('#results-tile-detail_back_button').on('click', password_tile_hide);
$('#div-results-tile-detail-password').parent().find('.show-pass').on('click', password_toggle_eye_span);

$('#div-results-tile-detail-url').next().find('.success-hide').on('click',{target:'span'},copy_to_clipboard);
$('#div-results-tile-detail-url').next().find('.success-show-flex').on('click',{target:'span'},copy_to_clipboard);

$('#div-results-tile-detail-password').parent().find('.success-hide').on('click',copy_to_clipboard);
$('#div-results-tile-detail-password').parent().find('.success-show-flex').on('click',copy_to_clipboard);
