
function initTable(tableid, rows, columns=undefined) {
    if (columns == undefined) {
        columns = []
        for (key in rows[0]) {
            columns.push({ field: key, title: key, sortable: true });
        }
    }
    let $table = $('#'+tableid);
    $table.bootstrapTable('destroy').bootstrapTable({
        columns: columns,
        data: rows
    });
}
