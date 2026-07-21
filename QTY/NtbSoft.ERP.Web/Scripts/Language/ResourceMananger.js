let languageList = [];
let moduleMap = {}; // { '0': 'Chung', '1': 'Quản lý người dùng', ... }

$(function () {
    // Load ngôn ngữ + danh mục module trước, sau đó mới load dữ liệu
    Promise.all([loadLanguages(), loadModules()]).then(function () {
        loadResources();
    });

    // Sự kiện Enter ở ô Resource Key
    $('#txtResourceKey').on('keypress', function (e) {
        if (e.which === 13) loadResourceByKey($(this).val().trim());
    });

    // Sự kiện nút Lưu
    $('#btnSave').on('click', saveResource);

    // Sự kiện Làm mới
    $('#btnClear').on('click', clearForm);

    // Sự kiện Thêm ngôn ngữ mới
    $('#btnAddLangGlobal').on('click', function () {
        clearLangForm();
        loadLangList();
        $('#modalAddLang').modal('show');
    });

    $('#btnSaveNewLang').on('click', async function () {
        var code = $('#txtNewLangCode').val().trim();
        var name = $('#txtNewLangName').val().trim();
        var native = $('#txtNewNativeName').val().trim();
        var flagIcon = ($('#txtNewFlagIcon').val() || '').toLowerCase();

        if (!code) { showToast('warning', 'Vui lòng nhập mã ngôn ngữ!'); return; }
        if (!name) { showToast('warning', 'Vui lòng nhập tên ngôn ngữ!'); return; }

        await doSaveLanguage(code, name, native, flagIcon, false);
    });

    async function doSaveLanguage(code, name, native, flagIcon, allowOverwrite) {
        try {
            var url = '/api/SYS_Language/SaveLanguage?langCode=' + encodeURIComponent(code)
                + '&langName=' + encodeURIComponent(name)
                + '&nativeName=' + encodeURIComponent(native)
                + '&flagIcon=' + encodeURIComponent(flagIcon)
                + '&allowOverwrite=' + (allowOverwrite ? 'true' : 'false');

            var response = await fetch(url, { method: 'POST' });
            var result = await response.json();
            var ok = (result && (result.Result === 'True' || result.Result === true));
            var exists = (result && result.Result === 'EXISTS');

            if (ok) {
                showToast('success', 'Đã lưu ngôn ngữ "' + name + '"!');
                clearLangForm();
                await loadLanguages();
                loadLangList();
                loadResources();
            } else if (exists && !allowOverwrite) {
                // Hỏi người dùng có muốn ghi đè không
                var confirmed = await showOverwriteConfirm(result.Message || 'Ngôn ngữ "' + name + '" đã tồn tại. Ghi đè?');
                if (confirmed) {
                    await doSaveLanguage(code, name, native, flagIcon, true);
                }
            } else {
                showToast('error', result && result.Message || 'Lưu thất bại!');
            }
        } catch (ex) {
            showToast('error', 'Lỗi: ' + ex.message);
        }
    }

    function showOverwriteConfirm(message) {
        return new Promise(function (resolve) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Ngôn ngữ đã tồn tại',
                    text: message,
                    showCancelButton: true,
                    confirmButtonText: 'Có, ghi đè',
                    cancelButtonText: 'Hủy',
                    confirmButtonColor: '#dc3545'
                }).then(function (res) {
                    resolve(res.isConfirmed);
                });
            } else {
                resolve(confirm(message));
            }
        });
    }

    $('#btnClearLangForm').on('click', clearLangForm);

    $('#txtLangFilter').on('keyup', function () {
        loadLangList();
    });

    $('#cbLangSort').on('change', function () {
        loadLangList();
    });
});

// ============================================================
// Popup xác nhận xóa (thay cho confirm() mặc định xấu xí của trình
// duyệt) — dùng SweetAlert2 đã có sẵn trong trang, fallback về
// confirm() gốc nếu vì lý do gì đó SweetAlert2 chưa load được.
// ============================================================
function showDeleteConfirm(message, title) {
    return new Promise(function (resolve) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: title || 'Xác nhận xóa',
                text: message || '',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#dc3545',
                reverseButtons: true
            }).then(function (res) {
                resolve(res.isConfirmed);
            });
        } else {
            resolve(confirm((title ? title + '\n' : '') + (message || '')));
        }
    });
}

// ============================================================
// Load danh sách ngôn ngữ trong modal
// ============================================================
function loadLangList() {
    var keyword = ($('#txtLangFilter').val() || '').trim().toLowerCase();
    var filtered = languageList.filter(function (l) {
        if (!keyword) return true;
        return (l.LanguageID || '').toLowerCase().indexOf(keyword) >= 0
            || (l.LanguageName || '').toLowerCase().indexOf(keyword) >= 0
            || (l.NativeName || '').toLowerCase().indexOf(keyword) >= 0;
    });
    renderLangList(filtered);
}

// ============================================================
// Render danh sách ngôn ngữ trong modal
// ============================================================
function renderLangList(langArray) {
    var $body = $('#langListBody');
    $body.empty();
    $('#langCount').text(langArray.length + ' ngôn ngữ');

    // Sắp xếp: ưu tiên SortOrder nếu có, Việt Nam luôn đầu
    langArray.sort(function (a, b) {
        if (a.LanguageID === 'vi-VN') return -1;
        if (b.LanguageID === 'vi-VN') return 1;
        // Nếu có SortOrder thì dùng, không thì giữ nguyên thứ tự từ API
        if (a.SortOrder != null && b.SortOrder != null) {
            return a.SortOrder - b.SortOrder;
        }
        return 0;
    });

    if (langArray.length === 0) {
        $body.append('<tr><td colspan="5" class="text-center text-muted py-3">Không tìm thấy ngôn ngữ nào.</td></tr>');
        return;
    }

    langArray.forEach(function (lang) {
        var isDefault = (lang.LanguageID === 'vi-VN');
        var flagIcon = lang.FlagIcon || '';
        var flagHtml = flagIcon ? '<span class="fi fi-' + flagIcon.toLowerCase() + '" style="margin-right:6px;border-radius:2px;vertical-align:middle"></span>' : '';
        var $tr = $('<tr>' +
            '<td style="padding:6px 8px;font-size:13px"><code>' + escapeHtml(lang.LanguageID) + '</code></td>' +
            '<td style="padding:6px 8px;font-size:13px" class="edit-lang-name">' + flagHtml + escapeHtml(lang.LanguageName || '') + '</td>' +
            '<td style="padding:6px 8px;font-size:13px" class="edit-lang-native">' + escapeHtml(lang.NativeName || '') + '</td>' +
            '<td style="padding:6px 8px;font-size:13px;text-align:center">' + (isDefault ? '<span class="badge bg-primary">Mặc định</span>' : '') + '</td>' +
            '<td style="padding:6px 8px;text-align:center">' +
            '<button class="btn btn-sm btn-outline-primary btn-edit-lang py-0 px-1" title="Sửa"><i class="fas fa-pen" style="font-size:11px"></i></button> ' +
            (!isDefault ? '<button class="btn btn-sm btn-outline-danger btn-del-lang-confirm py-0 px-1" title="Xóa"><i class="fas fa-trash" style="font-size:11px"></i></button>' : '') +
            '</td>' +
            '</tr>');

        // Sửa ngôn ngữ
        $tr.find('.btn-edit-lang').on('click', function () {
            $('#txtNewLangCode').val(lang.LanguageID);
            var flagCode = lang.FlagIcon ? lang.FlagIcon.toLowerCase() : '';
            setSelect2Value('#txtNewLangName', lang.LanguageName || '', flagCode);
            $('#txtNewNativeName').val(lang.NativeName || '');
            $('#txtNewFlagIcon').val(flagCode.toUpperCase());
            $('#txtNewLangName').focus();
        });

        // Xóa ngôn ngữ
        $tr.find('.btn-del-lang-confirm').on('click', async function () {
            if (!(await showDeleteConfirm('Tất cả bản dịch của ngôn ngữ này cũng sẽ bị xóa!', 'Xóa ngôn ngữ "' + lang.LanguageName + '" (' + lang.LanguageID + ')?'))) return;
            try {
                var response = await fetch('/api/SYS_Language/DeleteLanguage?langCode=' + encodeURIComponent(lang.LanguageID), { method: 'POST' });
                var result = await response.json();
                var ok = result && (result.Result === 'True' || result.Result === true);
                if (ok) {
                    showToast('success', 'Đã xóa ngôn ngữ "' + lang.LanguageName + '"!');
                    await loadLanguages();
                    loadLangList();
                    loadResources();
                } else {
                    showToast('error', result && result.Message || 'Xóa thất bại!');
                }
            } catch (ex) {
                showToast('error', 'Lỗi: ' + ex.message);
            }
        });

        $body.append($tr);
    });

    // Khởi tạo Sortable cho danh sách ngôn ngữ (kéo thả sắp xếp)
    try {
        if ($.ui && $.ui.sortable) {
            if ($body.hasClass('ui-sortable')) $body.sortable('destroy');
            $body.sortable({
                axis: 'y',
                helper: function (e, ui) {
                    ui.children().each(function () { $(this).width($(this).width()); });
                    return ui;
                },
                cancel: 'button, .btn, input, textarea, .no-drag',
                placeholder: 'ui-state-highlight',
                update: async function () {
                    var order = [];
                    $body.find('tr').each(function () {
                        var code = $(this).find('code').first().text().trim();
                        if (code) order.push(code);
                    });
                    try {
                        const response = await fetch('/api/SYS_Language/SaveOrder', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(order)
                        });
                        const result = await response.json();
                        const ok = (result === 'True' || result === true) || (result && (result.Result === 'True' || result.Result === true));
                        if (ok) {
                            showToast('success', 'Đã lưu thứ tự ngôn ngữ!');
                            await loadLanguages();
                            loadResources();
                        } else {
                            var msg = typeof result === 'string' ? result : (result && result.Message || 'Lưu thứ tự thất bại!');
                            showToast('error', msg);
                        }
                    } catch (ex) {
                        showToast('error', 'Lỗi khi lưu thứ tự: ' + ex.message);
                    }
                }
            });
        }
    } catch (e) { console.warn('init lang list sortable failed', e); }
}

// ============================================================
// Clear form thêm/sửa ngôn ngữ
// ============================================================
function clearLangForm() {
    $('#txtNewLangCode').val('');
    // Xóa Select2 tên ngôn ngữ
    $('#txtNewLangName').val(null).trigger('change.select2');
    // Xóa các input readonly
    $('#txtNewNativeName').val('');
    $('#txtNewFlagIcon').val('');
    $('#txtNewLangCode').focus();
}

function showToast(type, msg) {
    if (typeof toastr !== 'undefined') {
        toastr[type](msg);
    } else {
        alert(msg);
    }
}

// Load danh sách ngôn ngữ vào combobox
async function loadLanguages() {
    try {
        const response = await fetch('/api/SYS_Language/GetLanguages');
        languageList = await response.json();

        // Render input cho từng ngôn ngữ trong panel thêm/sửa
        renderLangInputs();

        // Khởi tạo (hoặc cập nhật) cột của dxDataGrid theo danh sách ngôn ngữ hiện có
        initOrUpdateGrid();
    } catch (ex) {
        console.error('Load languages error:', ex);
    }
}

// ============================================================
// Render bảng nhập liệu: hiện tất cả ngôn ngữ từ DB
// ============================================================
function renderLangInputs() {
    var $body = $('#langInputBody');
    $body.empty();
    // Sắp xếp: Tiếng Việt lên đầu, theo SortOrder nếu có
    var sorted = languageList.slice().sort(function (a, b) {
        if (a.LanguageID === 'vi-VN') return -1;
        if (b.LanguageID === 'vi-VN') return 1;
        if (a.SortOrder != null && b.SortOrder != null) {
            return a.SortOrder - b.SortOrder;
        }
        return 0;
    });
    sorted.forEach(function (l) {
        var $row = $('<tr class="lang-row" data-lang="' + l.LanguageID + '">' +
            '<td style="padding:4px 10px;font-size:13px;font-weight:500">' +
            '<span class="lang-name">' + escapeHtml(l.LanguageName) + ' (' + l.LanguageID + ')</span>' +
            '</td>' +
            '<td style="padding:4px 10px"><input type="text" class="form-control form-control-sm lang-input" data-lang="' + l.LanguageID + '" placeholder="Nhập bản dịch ' + l.LanguageID + '..." /></td>' +
            '</tr>');
        $body.append($row);
    });
}

// Load tất cả resources. Việc lọc theo từ khóa giờ do thanh search
// built-in của DevExpress (searchPanel trên dxDataGrid) đảm nhiệm ở
// phía client, nên luôn load toàn bộ dữ liệu tại đây.
async function loadResources() {
    try {
        const response = await fetch('/api/SYS_Language/Get?action=GET_ALL');
        const data = await response.json();
        updateGridData(data || []);
    } catch (ex) {
        console.error('Load resources error:', ex);
    }
}

// Load resource theo key (khi user Enter ở ô nhập key)
async function loadResourceByKey(key) {
    if (!key) return;
    try {
        const response = await fetch('/api/SYS_Language/GetByKey?resourceKey=' + encodeURIComponent(key));
        const data = await response.json();

        if (data && data.length > 0) {
            // Key đã tồn tại → load lên grid + điền vào panel
            updateGridData(data);

            // Điền giá trị vào các ô ngôn ngữ
            $('#txtResourceKey').val(key);
            $('.lang-input').val('');
            data.forEach(function (row) {
                var $input = $('.lang-input[data-lang="' + row.LanguageID + '"]');
                if ($input.length) $input.val(row.Value || '');
            });
            $('#txtResourceKey').focus();
        } else {
            // Key mới → clear form, set key, chỉ giữ Tiếng Việt
            clearForm();
            $('#txtResourceKey').val(key);
            $('.lang-input').first().focus();
        }
    } catch (ex) {
        console.error('Load by key error:', ex);
    }
}

// ============================================================
// Load danh mục module (Module -> Text hiển thị). Module do dev
// gán sẵn khi chèn dữ liệu (qua code/SQL) — trang này CHỈ hiển thị
// tên module tương ứng, không cho sửa module qua giao diện.
// ============================================================
async function loadModules() {
    try {
        const response = await fetch('/api/SYS_Language/Get?action=GET_MODULES');
        const data = await response.json();
        moduleMap = {};
        (data || []).forEach(function (m) {
            moduleMap[m.Module] = m.Text;
        });
    } catch (ex) {
        console.error('Load modules error:', ex);
    }
}

// ============================================================
// PIVOT: Nhóm dữ liệu theo ResourceKey, mỗi key = 1 dòng.
// Module được resolve sẵn ra Text để hiển thị (chỉ đọc).
// ============================================================
function pivotData(data) {
    const grouped = {};
    (data || []).forEach(function (row) {
        const key = row.ResourceKey || '';
        if (!grouped[key]) {
            const moduleCode = row.Module || '0';
            grouped[key] = {
                ResourceKey: key,
                Module: moduleMap[moduleCode] || moduleCode
            };
        }
        grouped[key][row.LanguageID] = row.Value || '';
    });
    // Sắp xếp theo ResourceKey để giữ thứ tự cố định
    return Object.keys(grouped).sort().map(function (k) { return grouped[k]; });
}

// ============================================================
// DEVEXTREME dxDataGrid: khởi tạo / cập nhật cột động theo ngôn ngữ
// ============================================================
var dxGrid = null;

// Xây danh sách cột: #, Resource Key, Module (3 cột ghim trái theo
// đúng thứ tự khai báo), từng ngôn ngữ hiện có (cuộn ngang),
// Thao tác (ghim phải). Mỗi cột ngôn ngữ có filter-row riêng.
function buildGridColumns() {
    var cols = [];

    cols.push({
        caption: '#',
        width: 46,
        alignment: 'center',
        allowFiltering: false,
        allowSorting: false,
        allowResizing: false,
        allowEditing: false,
        fixed: true,
        fixedPosition: 'left',
        cellTemplate: function (container, options) {
            $(container).text(options.rowIndex + 1);
        }
    });

    cols.push({
        dataField: 'ResourceKey',
        caption: 'Resource Key',
        width: 200,
        fixed: true,
        fixedPosition: 'left',
        allowSorting: false,
        allowEditing: false,
        cellTemplate: function (container, options) {
            $('<strong>').text(options.value || '').appendTo(container);
        }
    });

    // Cột Module: CHỈ HIỂN THỊ tên module (do dev gán sẵn khi chèn dữ liệu),
    // không cho sửa qua giao diện này.
    cols.push({
        dataField: 'Module',
        caption: 'Module',
        width: 160,
        fixed: true,
        fixedPosition: 'left',
        allowSorting: false,
        allowEditing: false,
        cellTemplate: function (container, options) {
            $('<span class="badge badge-module">').text(options.value || 'Chung').appendTo(container);
        }
    });

    languageList.forEach(function (l) {
        cols.push({
            dataField: l.LanguageID,
            caption: (l.NativeName || l.LanguageName || l.LanguageID) + ' (' + l.LanguageID + ')',
            minWidth: 160,
            allowSorting: false,
            allowEditing: false,
            cellTemplate: function (container, options) {
                renderLangCell(container, options, l.LanguageID);
            }
        });
    });

    cols.push({
        caption: 'Thao tác',
        width: 80,
        alignment: 'center',
        allowFiltering: false,
        allowSorting: false,
        allowResizing: false,
        allowEditing: false,
        fixed: true,
        fixedPosition: 'right',
        cellTemplate: function (container, options) {
            renderActionCell(container, options);
        }
    });

    return cols;
}

// Khởi tạo grid lần đầu, hoặc chỉ cập nhật lại cột nếu grid đã tồn tại
// (VD: khi thêm/sửa/xóa/sắp xếp lại ngôn ngữ)
function initOrUpdateGrid() {
    var $el = $('#gridResource');
    if ($el.length === 0) return;

    var columns = buildGridColumns();

    if (dxGrid) {
        dxGrid.option('columns', columns);
    } else {
        $el.dxDataGrid({
            columns: columns,
            dataSource: [],
            keyExpr: 'ResourceKey',
            showBorders: false,
            showRowLines: true,
            showColumnLines: true,
            columnAutoWidth: true,
            allowColumnResizing: true,
            columnResizingMode: 'widget',
            columnMinWidth: 90,
            wordWrapEnabled: false,
            noDataText: 'Không tìm thấy từ khóa nào.',
            filterRow: {
                visible: true,
                applyFilter: 'auto'
            },
            headerFilter: { visible: true, search: { enabled: true } },
            searchPanel: { visible: true, width: 260, placeholder: 'Tìm kiếm...', highlightSearchText: true },
            paging: { enabled: false },
            scrolling: { mode: 'standard', useNative: true, showScrollbar: 'onHover' },
            loadPanel: { enabled: true },
            columnChooser: { enabled: false },
            height: '100%'
        });
        dxGrid = $el.dxDataGrid('instance');
    }
    resizeGrid();
}

// ============================================================
// PIVOT + đổ dữ liệu vào dxDataGrid
// ============================================================
function updateGridData(data) {
    var pivoted = pivotData(data || []);
    if (!dxGrid) {
        initOrUpdateGrid();
    }
    if (dxGrid) {
        dxGrid.option('dataSource', pivoted);
    }
}

// ============================================================
// Render 1 cell bản dịch: input + nút xóa (nếu có giá trị)
// Blur / Enter -> lưu toàn bộ các ô ngôn ngữ đang hiển thị trong CÙNG
// dòng (giữ đúng hành vi cũ: lưu theo dòng, không chỉ riêng ô đang sửa)
// ============================================================
function renderLangCell(container, options, langId) {
    var $container = $(container);
    var row = options.data;
    var val = row[langId] || '';

    var $wrap = $('<div class="lang-cell-wrap"></div>');
    var $input = $('<input type="text" class="form-control form-control-sm lang-edit-input" placeholder="..." />')
        .attr('data-lang', langId)
        .val(val)
        .attr('data-original', val);
    $wrap.append($input);

    if (val) {
        var $del = $('<button class="btn btn-sm btn-outline-danger btn-del-lang ms-1 py-0 px-1" style="font-size:11px;line-height:1" title="Xóa bản dịch ' + langId + '"><i class="fas fa-times"></i></button>');
        $wrap.append($del);
        $del.on('click', function () {
            deleteSingleTranslation(row.ResourceKey, langId, $wrap, $input);
        });
    }

    function doSave() {
        var $tr = $wrap.closest('tr');
        saveGridRow($tr, row.ResourceKey);
    }

    $input.on('blur', function () {
        if ($input.val().trim() !== ($input.attr('data-original') || '').trim()) {
            doSave();
        }
    });
    $input.on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            doSave();
            $input.trigger('blur');
        }
    });

    $container.append($wrap);
}

// Lưu tất cả ô ngôn ngữ có giá trị trong dòng $tr (giống hành vi saveRow cũ)
async function saveGridRow($tr, resourceKey) {
    var items = [];
    $tr.find('.lang-edit-input').each(function () {
        var val = $(this).val().trim();
        if (val) {
            items.push({
                ResourceKey: resourceKey,
                LanguageID: $(this).data('lang'),
                Value: val,
                Description: '',
                IsHtml: false,
                UpdatedBy: 'admin'
            });
        }
    });

    if (items.length === 0) {
        showToast('warning', 'Chưa có bản dịch nào!');
        return;
    }

    try {
        const response = await fetch('/api/SYS_Language/Save?allowOverwrite=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
        const result = await response.json();
        const ok = (result === 'True' || result === true) || (result && (result.Result === 'True' || result.Result === true));
        if (ok) {
            showToast('success', 'Đã lưu ' + items.length + ' bản dịch!');
            $tr.find('.lang-edit-input').each(function () {
                var $input = $(this);
                var $wrap = $input.closest('.lang-cell-wrap');
                var $delBtn = $wrap.find('.btn-del-lang');
                var langID = $input.data('lang');
                if ($input.val().trim()) {
                    if ($delBtn.length === 0) {
                        var $newDel = $('<button class="btn btn-sm btn-outline-danger btn-del-lang ms-1 py-0 px-1" style="font-size:11px;line-height:1" title="Xóa bản dịch ' + langID + '"><i class="fas fa-times"></i></button>');
                        $wrap.append($newDel);
                        $newDel.on('click', function () {
                            deleteSingleTranslation(resourceKey, langID, $wrap, $input);
                        });
                    }
                } else {
                    $delBtn.remove();
                }
                $input.attr('data-original', $input.val());
            });
        } else {
            showToast('error', result && result.Message || 'Lưu thất bại!');
        }
    } catch (ex) {
        showToast('error', 'Lỗi: ' + ex.message);
    }
}

// Xóa bản dịch của 1 ngôn ngữ trong 1 resource key
async function deleteSingleTranslation(resourceKey, langID, $wrap, $input) {
    if (!(await showDeleteConfirm('Bản dịch đã xóa sẽ không thể khôi phục.', 'Xóa bản dịch "' + resourceKey + '" (' + langID + ')?'))) return;
    try {
        var response = await fetch('/api/SYS_Language/Delete?resourceKey=' + encodeURIComponent(resourceKey) + '&languageID=' + encodeURIComponent(langID), { method: 'POST' });
        var result = await response.json();
        var ok = (result === 'True' || result === true) || (result && (result.Result === 'True' || result.Result === true));
        if (ok) {
            showToast('success', 'Xóa bản dịch ' + langID + ' thành công!');
            $input.val('').attr('data-original', '');
            $wrap.find('.btn-del-lang').remove();
        } else {
            showToast('error', result && result.Message || 'Xóa thất bại!');
        }
    } catch (ex) {
        showToast('error', 'Lỗi: ' + ex.message);
    }
}

// Render cell "Thao tác": nút xóa toàn bộ key
function renderActionCell(container, options) {
    var $container = $(container);
    var resourceKey = options.data.ResourceKey;
    var $btn = $('<button class="btn btn-sm btn-outline-danger btn-delete py-0 px-2" title="Xóa toàn bộ key" style="font-size:11px"><i class="fas fa-trash"></i></button>');
    $btn.on('click', async function () {
        if (!(await showDeleteConfirm('Hành động này không thể hoàn tác.', 'Xóa toàn bộ bản dịch của "' + resourceKey + '"?'))) return;
        try {
            var response = await fetch('/api/SYS_Language/Get?action=DELETE_BY_KEY&para1=' + encodeURIComponent(resourceKey));
            var result = await response.json();
            if (result && result.length > 0 && (result[0].Result === 'True' || result[0].Result === true)) {
                showToast('success', 'Xóa thành công!');
                loadResources();
            } else {
                showToast('error', result && result.Message || 'Xóa thất bại!');
            }
        } catch (ex) {
            showToast('error', 'Lỗi: ' + ex.message);
        }
    });
    $container.append($btn);
}

// Lưu resource — gửi tất cả ngôn ngữ cùng lúc
async function saveResource() {
    const key = $('#txtResourceKey').val().trim();

    if (!key) {
        showToast('warning', 'Vui lòng nhập Resource Key!');
        $('#txtResourceKey').focus();
        return;
    }

    // Thu thập tất cả bản dịch
    var items = [];
    $('.lang-input').each(function () {
        var val = $(this).val().trim();
        if (val) {
            items.push({
                ResourceKey: key,
                LanguageID: $(this).data('lang'),
                Value: val,
                Description: '',
                IsHtml: false,
                UpdatedBy: 'admin'
            });
        }
    });

    if (items.length === 0) {
        showToast('warning', 'Vui lòng nhập ít nhất một bản dịch!');
        return;
    }

    try {
        const response = await fetch('/api/SYS_Language/Save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
        const result = await response.json();
        const ok = (result === 'True' || result === true) || (result && (result.Result === 'True' || result.Result === true));
        if (ok) {
            showToast('success', 'Lưu thành công (' + items.length + ' ngôn ngữ)!');
            clearForm();
            loadResources();
            $('#txtResourceKey').focus();
        } else {
            var msg = typeof result === 'string' ? result : (result && result.Message || 'Lưu thất bại!');
            showToast('error', msg);
        }
    } catch (ex) {
        showToast('error', 'Lỗi kết nối: ' + ex.message);
    }
}

// Clear form
function clearForm() {
    $('#txtResourceKey').val('');
    $('.lang-input').val('');
    $('#txtResourceKey').focus();
}

// ============================================================
// AUTO-FILL: Dữ liệu và xử lý khi thêm ngôn ngữ mới
// ============================================================

// Danh sách quốc gia cho flag dropdown
const ALL_COUNTRIES = {
    'vn': 'Việt Nam', 'af': 'Afghanistan', 'ax': 'Åland Islands', 'al': 'Albania',
    'dz': 'Algeria', 'as': 'American Samoa', 'ad': 'Andorra', 'ao': 'Angola',
    'ai': 'Anguilla', 'aq': 'Antarctica', 'ag': 'Antigua and Barbuda', 'ar': 'Argentina',
    'am': 'Armenia', 'aw': 'Aruba', 'au': 'Australia', 'at': 'Austria',
    'az': 'Azerbaijan', 'bs': 'Bahamas', 'bh': 'Bahrain', 'bd': 'Bangladesh',
    'bb': 'Barbados', 'by': 'Belarus', 'be': 'Belgium', 'bz': 'Belize',
    'bj': 'Benin', 'bm': 'Bermuda', 'bt': 'Bhutan', 'bo': 'Bolivia',
    'bq': 'Bonaire', 'ba': 'Bosnia and Herzegovina', 'bw': 'Botswana', 'bv': 'Bouvet Island',
    'br': 'Brazil', 'io': 'British Indian Ocean Territory', 'bn': 'Brunei', 'bg': 'Bulgaria',
    'bf': 'Burkina Faso', 'bi': 'Burundi', 'cv': 'Cabo Verde', 'kh': 'Cambodia',
    'cm': 'Cameroon', 'ca': 'Canada', 'ky': 'Cayman Islands', 'cf': 'Central African Republic',
    'td': 'Chad', 'cl': 'Chile', 'cn': 'China', 'cx': 'Christmas Island',
    'cc': 'Cocos Islands', 'co': 'Colombia', 'km': 'Comoros', 'cg': 'Congo',
    'cd': 'Congo (DRC)', 'ck': 'Cook Islands', 'cr': 'Costa Rica', 'hr': 'Croatia',
    'cu': 'Cuba', 'cw': 'Curaçao', 'cy': 'Cyprus', 'cz': 'Czech Republic',
    'dk': 'Denmark', 'dj': 'Djibouti', 'dm': 'Dominica', 'do': 'Dominican Republic',
    'ec': 'Ecuador', 'eg': 'Egypt', 'sv': 'El Salvador', 'gq': 'Equatorial Guinea',
    'er': 'Eritrea', 'ee': 'Estonia', 'sz': 'Eswatini', 'et': 'Ethiopia',
    'fk': 'Falkland Islands', 'fo': 'Faroe Islands', 'fj': 'Fiji', 'fi': 'Finland',
    'fr': 'France', 'gf': 'French Guiana', 'pf': 'French Polynesia', 'tf': 'French Southern Territories',
    'ga': 'Gabon', 'gm': 'Gambia', 'ge': 'Georgia', 'de': 'Germany',
    'gh': 'Ghana', 'gi': 'Gibraltar', 'gr': 'Greece', 'gl': 'Greenland',
    'gd': 'Grenada', 'gp': 'Guadeloupe', 'gu': 'Guam', 'gt': 'Guatemala',
    'gg': 'Guernsey', 'gn': 'Guinea', 'gw': 'Guinea-Bissau', 'gy': 'Guyana',
    'ht': 'Haiti', 'hm': 'Heard Island', 'hn': 'Honduras', 'hk': 'Hong Kong',
    'hu': 'Hungary', 'is': 'Iceland', 'in': 'India', 'id': 'Indonesia',
    'ir': 'Iran', 'iq': 'Iraq', 'ie': 'Ireland', 'im': 'Isle of Man',
    'il': 'Israel', 'it': 'Italy', 'jm': 'Jamaica', 'jp': 'Japan',
    'je': 'Jersey', 'jo': 'Jordan', 'kz': 'Kazakhstan', 'ke': 'Kenya',
    'ki': 'Kiribati', 'kp': 'North Korea', 'kr': 'South Korea', 'kw': 'Kuwait',
    'kg': 'Kyrgyzstan', 'la': 'Laos', 'lv': 'Latvia', 'lb': 'Lebanon',
    'ls': 'Lesotho', 'lr': 'Liberia', 'ly': 'Libya', 'li': 'Liechtenstein',
    'lt': 'Lithuania', 'lu': 'Luxembourg', 'mo': 'Macau', 'mg': 'Madagascar',
    'mw': 'Malawi', 'my': 'Malaysia', 'mv': 'Maldives', 'ml': 'Mali',
    'mt': 'Malta', 'mh': 'Marshall Islands', 'mq': 'Martinique', 'mr': 'Mauritania',
    'mu': 'Mauritius', 'yt': 'Mayotte', 'mx': 'Mexico', 'fm': 'Micronesia',
    'md': 'Moldova', 'mc': 'Monaco', 'mn': 'Mongolia', 'me': 'Montenegro',
    'ms': 'Montserrat', 'ma': 'Morocco', 'mz': 'Mozambique', 'mm': 'Myanmar',
    'na': 'Namibia', 'nr': 'Nauru', 'np': 'Nepal', 'nl': 'Netherlands',
    'nc': 'New Caledonia', 'nz': 'New Zealand', 'ni': 'Nicaragua', 'ne': 'Niger',
    'ng': 'Nigeria', 'nu': 'Niue', 'nf': 'Norfolk Island', 'mk': 'North Macedonia',
    'mp': 'Northern Mariana Islands', 'no': 'Norway', 'om': 'Oman', 'pk': 'Pakistan',
    'pw': 'Palau', 'ps': 'Palestine', 'pa': 'Panama', 'pg': 'Papua New Guinea',
    'py': 'Paraguay', 'pe': 'Peru', 'ph': 'Philippines', 'pn': 'Pitcairn Islands',
    'pl': 'Poland', 'pt': 'Portugal', 'pr': 'Puerto Rico', 'qa': 'Qatar',
    're': 'Réunion', 'ro': 'Romania', 'ru': 'Russia', 'rw': 'Rwanda',
    'bl': 'Saint Barthélemy', 'sh': 'Saint Helena', 'kn': 'Saint Kitts and Nevis',
    'lc': 'Saint Lucia', 'mf': 'Saint Martin', 'pm': 'Saint Pierre and Miquelon',
    'vc': 'Saint Vincent and the Grenadines', 'ws': 'Samoa', 'sm': 'San Marino',
    'st': 'São Tomé and Príncipe', 'sa': 'Saudi Arabia', 'sn': 'Senegal',
    'rs': 'Serbia', 'sc': 'Seychelles', 'sl': 'Sierra Leone', 'sg': 'Singapore',
    'sx': 'Sint Maarten', 'sk': 'Slovakia', 'si': 'Slovenia', 'sb': 'Solomon Islands',
    'so': 'Somalia', 'za': 'South Africa', 'gs': 'South Georgia', 'ss': 'South Sudan',
    'es': 'Spain', 'lk': 'Sri Lanka', 'sd': 'Sudan', 'sr': 'Suriname',
    'sj': 'Svalbard', 'se': 'Sweden', 'ch': 'Switzerland', 'sy': 'Syria',
    'tw': 'Taiwan', 'tj': 'Tajikistan', 'tz': 'Tanzania', 'th': 'Thailand',
    'tl': 'Timor-Leste', 'tg': 'Togo', 'tk': 'Tokelau', 'to': 'Tonga',
    'tt': 'Trinidad and Tobago', 'tn': 'Tunisia', 'tr': 'Turkey', 'tm': 'Turkmenistan',
    'tc': 'Turks and Caicos Islands', 'tv': 'Tuvalu', 'ug': 'Uganda', 'ua': 'Ukraine',
    'ae': 'United Arab Emirates', 'gb': 'United Kingdom', 'us': 'United States',
    'uy': 'Uruguay', 'uz': 'Uzbekistan', 'vu': 'Vanuatu', 'va': 'Vatican City',
    've': 'Venezuela', 'vi': 'Virgin Islands', 'vg': 'Virgin Islands (British)',
    'wf': 'Wallis and Futuna', 'eh': 'Western Sahara', 'ye': 'Yemen', 'zm': 'Zambia', 'zw': 'Zimbabwe'
};

// Exception mapping: country code -> language code (when country code ≠ language code)
const LANG_EXCEPTIONS = {
    'vn': 'vi', 'us': 'en', 'gb': 'en', 'cn': 'zh', 'tw': 'zh', 'jp': 'ja', 'kr': 'ko',
    'ph': 'tl', 'sa': 'ar', 'ae': 'ar', 'eg': 'ar', 'in': 'hi', 'bd': 'bn', 'br': 'pt',
    'ar': 'es', 'mx': 'es', 'co': 'es', 'pe': 'es', 've': 'es', 'ch': 'de', 'at': 'de'
};

function generateFlagToLangMap() {
    const map = {};
    Object.keys(ALL_COUNTRIES).forEach(countryCode => {
        const langCode = LANG_EXCEPTIONS[countryCode] || countryCode;
        map[countryCode] = `${langCode}-${countryCode.toUpperCase()}`;
    });
    return map;
}

const FLAG_TO_LANG_MAP = generateFlagToLangMap();

// Tên ngôn ngữ & tên bản địa phổ biến
const LANG_INFO = {
    'vn': { name: 'Vietnamese', native: 'Tiếng Việt' },
    'us': { name: 'English (US)', native: 'English' },
    'gb': { name: 'English (UK)', native: 'British' },
    'cn': { name: 'Chinese (Simplified)', native: '简体中文' },
    'tw': { name: 'Chinese (Traditional)', native: '繁體中文' },
    'jp': { name: 'Japanese', native: '日本語' },
    'kr': { name: 'Korean', native: '한국어' },
    'fr': { name: 'French', native: 'Français' },
    'de': { name: 'German', native: 'Deutsch' },
    'it': { name: 'Italian', native: 'Italiano' },
    'es': { name: 'Spanish', native: 'Español' },
    'ru': { name: 'Russian', native: 'Русский' },
    'th': { name: 'Thai', native: 'ไทย' },
    'id': { name: 'Indonesian', native: 'Bahasa Indonesia' },
    'ph': { name: 'Filipino', native: 'Tagalog' },
    'in': { name: 'Hindi', native: 'हिन्दी' },
    'sa': { name: 'Arabic', native: 'العربية' },
    'ae': { name: 'Arabic', native: 'العربية' },
    'pt': { name: 'Portuguese', native: 'Português' },
    'br': { name: 'Portuguese (BR)', native: 'Português' },
    'my': { name: 'Malay', native: 'Bahasa Melayu' },
    'se': { name: 'Swedish', native: 'Svenska' },
    'nl': { name: 'Dutch', native: 'Nederlands' },
    'pl': { name: 'Polish', native: 'Polski' },
    'tr': { name: 'Turkish', native: 'Türkçe' },
    'cz': { name: 'Czech', native: 'Čeština' },
    'hu': { name: 'Hungarian', native: 'Magyar' },
    'ro': { name: 'Romanian', native: 'Română' },
    'gr': { name: 'Greek', native: 'Ελληνικά' },
    'il': { name: 'Hebrew', native: 'עברית' }
};

// Danh sách ngôn ngữ mẫu (dùng để auto-fill khi chọn flag)
const MASTER_LANG_DATA = [
    // Đông Nam Á
    { id: 'vi-VN', name: 'Vietnamese', native: 'Tiếng Việt', flag: 'vn' },
    { id: 'th-TH', name: 'Thai', native: 'ไทย', flag: 'th' },
    { id: 'id-ID', name: 'Indonesian', native: 'Bahasa Indonesia', flag: 'id' },
    { id: 'ms-MY', name: 'Malay', native: 'Bahasa Melayu', flag: 'my' },
    { id: 'fil-PH', name: 'Filipino', native: 'Filipino', flag: 'ph' },
    { id: 'km-KH', name: 'Khmer', native: 'ភាសាខ្មែរ', flag: 'kh' },
    { id: 'lo-LA', name: 'Lao', native: 'ລາວ', flag: 'la' },
    { id: 'my-MM', name: 'Burmese', native: 'မြန်မာဘာသာ', flag: 'mm' },
    { id: 'si-LK', name: 'Sinhala', native: 'සිංහල', flag: 'lk' },
    // Đông Á
    { id: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: 'cn' },
    { id: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文', flag: 'tw' },
    { id: 'ja-JP', name: 'Japanese', native: '日本語', flag: 'jp' },
    { id: 'ko-KR', name: 'Korean', native: '한국어', flag: 'kr' },
    { id: 'mn-MN', name: 'Mongolian', native: 'Монгол', flag: 'mn' },
    // Nam Á
    { id: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: 'in' },
    { id: 'bn-BD', name: 'Bengali', native: 'বাংলা', flag: 'bd' },
    { id: 'ur-PK', name: 'Urdu', native: 'اردو', flag: 'pk' },
    { id: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: 'in' },
    { id: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: 'in' },
    { id: 'mr-IN', name: 'Marathi', native: 'मराठी', flag: 'in' },
    { id: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી', flag: 'in' },
    { id: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: 'in' },
    { id: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', flag: 'in' },
    { id: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: 'in' },
    { id: 'ne-NP', name: 'Nepali', native: 'नेपाली', flag: 'np' },
    // Trung Đông
    { id: 'ar-SA', name: 'Arabic', native: 'العربية', flag: 'sa' },
    { id: 'he-IL', name: 'Hebrew', native: 'עברית', flag: 'il' },
    { id: 'fa-IR', name: 'Persian', native: 'فارسی', flag: 'ir' },
    { id: 'tr-TR', name: 'Turkish', native: 'Türkçe', flag: 'tr' },
    { id: 'ku-IQ', name: 'Kurdish', native: 'Kurdî', flag: 'iq' },
    { id: 'ps-AF', name: 'Pashto', native: 'پښتو', flag: 'af' },
    // Châu Âu
    { id: 'en-US', name: 'English (US)', native: 'English', flag: 'us' },
    { id: 'en-GB', name: 'English (UK)', native: 'British', flag: 'gb' },
    { id: 'fr-FR', name: 'French', native: 'Français', flag: 'fr' },
    { id: 'de-DE', name: 'German', native: 'Deutsch', flag: 'de' },
    { id: 'it-IT', name: 'Italian', native: 'Italiano', flag: 'it' },
    { id: 'es-ES', name: 'Spanish', native: 'Español', flag: 'es' },
    { id: 'pt-PT', name: 'Portuguese', native: 'Português', flag: 'pt' },
    { id: 'ru-RU', name: 'Russian', native: 'Русский', flag: 'ru' },
    { id: 'nl-NL', name: 'Dutch', native: 'Nederlands', flag: 'nl' },
    { id: 'pl-PL', name: 'Polish', native: 'Polski', flag: 'pl' },
    { id: 'sv-SE', name: 'Swedish', native: 'Svenska', flag: 'se' },
    { id: 'el-GR', name: 'Greek', native: 'Ελληνικά', flag: 'gr' },
    { id: 'cs-CZ', name: 'Czech', native: 'Čeština', flag: 'cz' },
    { id: 'hu-HU', name: 'Hungarian', native: 'Magyar', flag: 'hu' },
    { id: 'ro-RO', name: 'Romanian', native: 'Română', flag: 'ro' },
    { id: 'da-DK', name: 'Danish', native: 'Dansk', flag: 'dk' },
    { id: 'fi-FI', name: 'Finnish', native: 'Suomi', flag: 'fi' },
    { id: 'nb-NO', name: 'Norwegian (Bokmål)', native: 'Norsk Bokmål', flag: 'no' },
    { id: 'sk-SK', name: 'Slovak', native: 'Slovenčina', flag: 'sk' },
    { id: 'sl-SI', name: 'Slovenian', native: 'Slovenščina', flag: 'si' },
    { id: 'hr-HR', name: 'Croatian', native: 'Hrvatski', flag: 'hr' },
    { id: 'sr-RS', name: 'Serbian', native: 'Српски', flag: 'rs' },
    { id: 'bg-BG', name: 'Bulgarian', native: 'Български', flag: 'bg' },
    { id: 'uk-UA', name: 'Ukrainian', native: 'Українська', flag: 'ua' },
    { id: 'be-BY', name: 'Belarusian', native: 'Беларуская', flag: 'by' },
    { id: 'lt-LT', name: 'Lithuanian', native: 'Lietuvių', flag: 'lt' },
    { id: 'lv-LV', name: 'Latvian', native: 'Latviešu', flag: 'lv' },
    { id: 'et-EE', name: 'Estonian', native: 'Eesti', flag: 'ee' },
    { id: 'is-IS', name: 'Icelandic', native: 'Íslenska', flag: 'is' },
    { id: 'mt-MT', name: 'Maltese', native: 'Malti', flag: 'mt' },
    { id: 'sq-AL', name: 'Albanian', native: 'Shqip', flag: 'al' },
    { id: 'mk-MK', name: 'Macedonian', native: 'Македонски', flag: 'mk' },
    { id: 'bs-BA', name: 'Bosnian', native: 'Bosanski', flag: 'ba' },
    { id: 'ca-ES', name: 'Catalan', native: 'Català', flag: 'es' },
    { id: 'eu-ES', name: 'Basque', native: 'Euskara', flag: 'es' },
    { id: 'gl-ES', name: 'Galician', native: 'Galego', flag: 'es' },
    { id: 'ga-IE', name: 'Irish', native: 'Gaeilge', flag: 'ie' },
    { id: 'cy-GB', name: 'Welsh', native: 'Cymraeg', flag: 'gb' },
    // Châu Phi
    { id: 'sw-KE', name: 'Swahili', native: 'Kiswahili', flag: 'ke' },
    { id: 'ha-NG', name: 'Hausa', native: 'Hausa', flag: 'ng' },
    { id: 'yo-NG', name: 'Yoruba', native: 'Yorùbá', flag: 'ng' },
    { id: 'ig-NG', name: 'Igbo', native: 'Igbo', flag: 'ng' },
    { id: 'zu-ZA', name: 'Zulu', native: 'isiZulu', flag: 'za' },
    { id: 'xh-ZA', name: 'Xhosa', native: 'isiXhosa', flag: 'za' },
    { id: 'af-ZA', name: 'Afrikaans', native: 'Afrikaans', flag: 'za' },
    { id: 'am-ET', name: 'Amharic', native: 'አማርኛ', flag: 'et' },
    { id: 'so-SO', name: 'Somali', native: 'Soomaali', flag: 'so' },
    { id: 'rw-RW', name: 'Kinyarwanda', native: 'Ikinyarwanda', flag: 'rw' },
    { id: 'ny-MW', name: 'Chichewa', native: 'Chichewa', flag: 'mw' },
    // Châu Mỹ Latin
    { id: 'pt-BR', name: 'Portuguese (BR)', native: 'Português (Brasil)', flag: 'br' },
    { id: 'es-MX', name: 'Spanish (MX)', native: 'Español (México)', flag: 'mx' },
    { id: 'es-AR', name: 'Spanish (AR)', native: 'Español (Argentina)', flag: 'ar' },
    { id: 'es-CO', name: 'Spanish (CO)', native: 'Español (Colombia)', flag: 'co' },
    { id: 'es-CL', name: 'Spanish (CL)', native: 'Español (Chile)', flag: 'cl' },
    { id: 'es-PE', name: 'Spanish (PE)', native: 'Español (Perú)', flag: 'pe' },
    { id: 'es-VE', name: 'Spanish (VE)', native: 'Español (Venezuela)', flag: 've' },
    { id: 'qu-PE', name: 'Quechua', native: 'Runa Simi', flag: 'pe' },
    // Khác
    { id: 'mi-NZ', name: 'Māori', native: 'Te Reo Māori', flag: 'nz' },
    { id: 'haw-US', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi', flag: 'us' }
];

// Khởi tạo Select2 và event auto-fill cho modal thêm ngôn ngữ
$(function () {
    const $modal = $('#modalAddLang');
    if ($modal.length === 0) return;

    // 1. Initialize Select2 cho Tên ngôn ngữ (chọn để auto-fill các trường còn lại)
    //    templateResult/templateSelection để chèn cờ ngay trước tên ngôn ngữ
    $('#txtNewLangName').select2({
        tags: true,
        width: '100%',
        dropdownParent: $modal,
        placeholder: 'Nhập hoặc chọn ngôn ngữ...',
        allowClear: true,
        templateResult: formatLangOptionWithFlag,
        templateSelection: formatLangOptionWithFlag
    });

    // 2. Populate options cho Select2 từ MASTER_LANG_DATA (kèm data-flag để render cờ)
    MASTER_LANG_DATA.forEach(function (item) {
        var $opt = $(new Option(item.name, item.name, false, false));
        $opt.attr('data-flag', item.flag || '');
        $('#txtNewLangName').append($opt);
    });

    // 4. Event: Gõ mã ngôn ngữ -> tự điền
    $('#txtNewLangCode').on('input', function () {
        const code = $(this).val().trim();
        const match = MASTER_LANG_DATA.find(x => x.id === code);
        if (match) updateAllFields(match);
    });

    // 5. Event: Chọn tên ngôn ngữ -> tự điền
    $('#txtNewLangName').on('select2:select', function (e) {
        const match = MASTER_LANG_DATA.find(x => x.name === e.params.data.id);
        if (match) updateAllFields(match);
    });

    // 6. Event: Chọn tên bản địa -> tự điền
    $('#txtNewNativeName').on('select2:select', function (e) {
        const match = MASTER_LANG_DATA.find(x => x.native === e.params.data.id);
        if (match) updateAllFields(match);
    });
});

// Cập nhật tất cả các trường từ dữ liệu MASTER_LANG_DATA
function updateAllFields(data) {
    if (!data) return;
    $('#txtNewLangCode').val(data.id);
    var flagCode = data.flag ? data.flag.toLowerCase() : '';
    setSelect2Value('#txtNewLangName', data.name, flagCode);
    $('#txtNewNativeName').val(data.native);
    $('#txtNewFlagIcon').val(flagCode.toUpperCase());
}

// Render 1 dòng trong Select2 (cả trong danh sách dropdown lẫn ô đã chọn):
// cờ (nếu option có data-flag) + tên ngôn ngữ, escape text an toàn.
function formatLangOptionWithFlag(state) {
    if (!state.id) return state.text; // placeholder / trạng thái đang gõ tìm kiếm

    var flagCode = state.element ? ($(state.element).data('flag') || '') : '';
    var $wrap = $('<span></span>');
    if (flagCode) {
        $wrap.append($('<span class="fi fi-' + flagCode + '"></span>').css({
            marginRight: '6px',
            borderRadius: '2px',
            verticalAlign: 'middle'
        }));
    }
    $wrap.append(document.createTextNode(state.text));
    return $wrap;
}

// Helper: set giá trị cho Select2 (tạo option nếu chưa tồn tại).
// flagCode (tùy chọn): gán/ghi đè data-flag để cờ hiển thị đúng trong ô chọn.
function setSelect2Value(id, val, flagCode) {
    const $el = $(id);
    var $opt = $el.find("option[value='" + val + "']");
    if (!$opt.length) {
        $opt = $(new Option(val, val, true, true));
        $el.append($opt);
    }
    if (flagCode) {
        $opt.attr('data-flag', flagCode);
    }
    $el.val(val).trigger('change.select2');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ============================================================
// Auto-resize grid — luôn kéo dài tới cuối trang
// ============================================================
function resizeGrid() {
    var $grid = $('#gridResource');
    if ($grid.length === 0) return;
    var windowH = $(window).height();
    var offset = $grid.offset().top;
    var newH = windowH - offset - 10;
    if (newH < 200) newH = 200;
    if (dxGrid) {
        dxGrid.option('height', newH);
    }
}

$(function () {
    // Form bắt đầu ở trạng thái thu gọn
    var $formContent = $('#formContent');
    var $formIcon = $('#toggleFormIcon');
    $formContent.hide();
    $formIcon.removeClass('fa-chevron-up').addClass('fa-chevron-down');

    // Tính kích thước grid — form đang thu gọn
    resizeGrid();
    $(window).on('resize', resizeGrid);

    // Toggle form — resize lại grid để kéo dài tới cuối trang
    $('#toggleFormBtn').on('click', function () {
        $formContent.slideToggle(200);
        $formIcon.toggleClass('fa-chevron-up fa-chevron-down');
        // Chờ animation kết thúc rồi resize
        setTimeout(resizeGrid, 250);
    });
});