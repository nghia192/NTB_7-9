let khuVucList = [];
let lineList = []
var userNameSave = localStorage.getItem("username1")

let dxDataDSLine;
let selectedLineID;
let selectedAreaID;
let maxSortLine;
let maxSortArea;
async function GetKhuVuc() {
    var url = `/api/ERP_DicUser/Get?action=KhuVuc`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        khuVucList = data
        GetDanhSachKhuVuc(khuVucList);
    } catch (error) {
        console.error(error.message);
    }
}
async function GetLine() {
    var url = `/api/ERP_DicUser/Get?action=GetLine`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        lineList = data
        GetDanhSachLine(lineList)
        GetMaxSortLine();
    } catch (error) {
        console.error(error.message);
    }
}
function showToast(type, message, delay = 2000) {
    let toastId, messageId;

    switch (type) {
        case 'success':
            toastId = 'successToast';
            messageId = 'successMessage';
            break;
        case 'error':
            toastId = 'errorToast';
            messageId = 'errorMessage';
            break;
        case 'warning':
            toastId = 'warningToast';
            messageId = 'warningMessage';
            break;
        default:
            console.error('Unknown toast type:', type);
            return;
    }

    $('#' + messageId).text(message);

    const toastElement = $('#' + toastId)[0];
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: delay
    });

    toast.show();
}
function GetDanhSachLine(data) {
    let grid = $("#dxDataDSLine").data("dxDataGrid");

    if (grid) {
        grid.option("dataSource", data);
        grid.refresh();
        return;
    }
    dxDataDSLine = $("#dxDataDSLine").dxDataGrid({
        dataSource: data,
        columnAutoWidth: true,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        noDataText: "", width: "100%",
        scrolling: { mode: 'standard' },
        filterRow: { visible: true },
        headerFilter: { visible: false },
        paging: {
            enabled: false
        },
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        selection: {
            mode: "single"
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).addClass("col-header");
            }
            if (e.rowType === "data") {
                $(e.cellElement).addClass("text-center");
            }
        },
        onContentReady: function (e) {
            if (selectedLineID) return;

            const rows = e.component.getVisibleRows().filter(r => r.rowType === "data");
            if (rows.length > 0) {
                e.component.selectRowsByIndexes([rows[0].rowIndex]);
            }
        },
        onSelectionChanged: async function (e) {
            if (e.selectedRowsData.length === 0) return;

            const data = e.selectedRowsData[0];
            selectedLineID = data.Line_ID

        },
        columns: [
            {
                caption: "STT",
                alignment: "center",
                width: 50,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            {
                caption: "Line_ID",
                dataField: "Line_ID",
                alignment: "center",
                width: 160,
                // Ô nhập trực tiếp cho Line_ID
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm text-center">');
                    $input.val(options.data.Line_ID || "");

                    container.append($input);

                    $input.on("input", function () {
                        options.data.Line_ID = $(this).val();
                    });

                    $input.on("blur", function () {
                        const val = ($(this).val() || "").trim();
                        const isTrung = val && lineList.some(x =>
                            x.id !== options.data.id &&
                            (x.Line_ID || "").trim().toLowerCase() === val.toLowerCase()
                        );
                        if (isTrung) {
                            showToast("warning", `Line ID "${val}" đã tồn tại trong danh sách!`);
                            $input.addClass("is-invalid");
                        } else {
                            $input.removeClass("is-invalid");
                        }
                        updateLineActionButtons();
                    });
                }
            },
            {
                caption: "Line Name",
                dataField: "Line_Name",
                alignment: "center",
                width: 160,
                // Ô nhập trực tiếp cho Line Name
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm text-center">');
                    $input.val(options.data.Line_Name || "");

                    container.append($input);

                    $input.on("input", function () {
                        options.data.Line_Name = $(this).val();
                    });

                }
            },
            {
                caption: "Khu vực",
                dataField: "AreaId",
                alignment: "center",
                minWidth: 200,
                calculateDisplayValue: function (rowData) {
                    let kv = khuVucList.find(x => x.AreaId === rowData.AreaId);
                    return kv ? kv.AreaName : "";
                },
                // Editor dùng select2 thay vì dropdown mặc định của DevExtreme
                cellTemplate: function (container, options) {
                    const $select = $('<select class="form-select form-select-sm"></select>');
                    let html = `<option  value=""></option>`;
                    if (khuVucList.length > 0) {
                        khuVucList.map(item => {
                            html += `<option  value="${item.AreaId}">${item.AreaName}</option>`
                        })
                    }

                    $select.html(html);

                    container.append($select);

                    $select.select2({
                        dropdownParent: $("body"),
                        width: "100%"
                    });

                    setTimeout(function () {
                        if (options.data.AreaId) {
                            $select.val(options.data.AreaId).trigger('change');
                        }
                    }, 0);

                    $select.on('change', function () {
                        options.data.AreaId = $(this).val();
                        $(container).closest(".dx-row").css("background-color", "");
                    });
                },
            },
            {
                type: "buttons",
                caption: "Thao tác",
                width: 80,
                alignment: "center",
                buttons: [
                    {
                        hint: "Xóa dòng",
                        template: function (cellElement, cellInfo) {

                            $("<a>")
                                .addClass("text-danger btn-icon-only")
                                .attr("title", "Xóa dòng")
                                .html('<i class="fa-solid fa-trash"></i>')
                                .appendTo(cellElement)
                                .on("click", function () {
                                    if ($("#dxDataDSLine .is-invalid").length > 0) {
                                        showToast("warning", "Vui lòng xử lý các dòng đang bị cảnh báo trùng trước khi thao tác!");
                                        return;
                                    }
                                    showConfirmModalXoa(function () {
                                        lineList = lineList.filter(x => x.id !== cellInfo.row.data.id);

                                        const lineIDDelete = cellInfo.row.data.Line_ID?.trim();

                                        if (lineIDDelete) {
                                            const arrSaveLine = [{
                                                ID: cellInfo.row.data.id,
                                                Line_ID: "",
                                                Line_Name: "",
                                                MaKV: ""
                                            }];
                                            ApiSaveLine(arrSaveLine, 'DeleteLine');
                                        }

                                        if (lineList.length > 0) {
                                            const sortValues = lineList.map(cd => parseInt(cd.Sort) || 0);
                                            maxSortLine = Math.max(...sortValues) + 1;
                                        } else {
                                            maxSortLine = 0;
                                        }

                                        dxDataDSLine.option("dataSource", lineList);
                                        updateLineActionButtons();
                                        return true;
                                    }, `Bạn có chắc chắn muốn xóa chuyền "${cellInfo.row.data.Line_Name || ''}" không?`);
                                });
                        }
                    }
                ]
            }
        ],
        onRowPrepared: function (e) {
            //if (e.rowType === "data" && !e.data.AreaId) {
            //    $(e.rowElement).css("background-color", "#fff3cd"); // cảnh báo chưa chọn khu vực
            //}
        }
    }).dxDataGrid("instance");
    $("#Layer_1").click()
}
// Cuộn tới và focus vào ô dữ liệu bị thiếu trong bảng chuyền
function focusLineCell(rowIndex, dataField) {
    setTimeout(function () {
        const cellEl = dxDataDSLine.getCellElement(rowIndex, dataField);
        if (!cellEl) return;
        const $cell = $(cellEl);
        $cell[0].scrollIntoView({ behavior: "smooth", block: "center" });

        const $input = $cell.find("input").first();
        const $select = $cell.find("select").first();

        if ($input.length) {
            $input.addClass("is-invalid").trigger("focus");
        } else if ($select.length) {
            $cell.find(".select2-selection").addClass("is-invalid");
            $select.select2("open");
        }
        updateLineActionButtons();
    }, 50);
}

// Khi còn ô đang cảnh báo trùng (is-invalid) trong bảng chuyền -> khóa nút Thêm/Lưu chuyền
function updateLineActionButtons() {
    const hasInvalid = $("#dxDataDSLine .is-invalid").length > 0;
    $("#btnThemDong, #btnLuuChuyen", ".btnSort").prop("disabled", hasInvalid);
    $("#dxDataDSLine .btn-icon-only").toggleClass("disabled", hasInvalid);
}
function updateKhuVucActionButtons() {
    const hasInvalid = $("#dxDataKhuVuc .is-invalid").length > 0;
    $("#btnThemKhuVuc, #btnLuuKhuVuc").prop("disabled", hasInvalid);
    $("#dxDataKhuVuc .btn-icon-only").toggleClass("disabled", hasInvalid);
}

function showConfirmModalXoa(onConfirm, message) {

    const modalEl = document.getElementById('modalXacNhanXoa');
    const modal = new bootstrap.Modal(modalEl, { backdrop: 'static' });
    modal.show();

    $("#txtXacNhanXoa").text(message || "Bạn có chắc chắn muốn xóa mục này không?");

    $('#btnXacNhanXoa').off('click').on('click', async function () {
        if (typeof onConfirm === 'function') {
            const result = await onConfirm();
            if (result === false) {
                return;
            }
        }
        modal.hide();
    });
}
function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let dxDataKhuVuc;

function GetDanhSachKhuVuc(data) {
    let grid = $("#dxDataKhuVuc").data("dxDataGrid");
    if (grid) {
        grid.option("dataSource", data);
        grid.refresh();
        return;
    }
    dxDataKhuVuc = $("#dxDataKhuVuc").dxDataGrid({
        dataSource: data,
        columnAutoWidth: true,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        noDataText: "", width: "100%",
        scrolling: { mode: 'standard' },
        filterRow: { visible: true },
        headerFilter: { visible: false },
        paging: {
            enabled: false
        },
        selection: {
            mode: "single"
        },
        renderAsync: false,
        grouping: { autoExpandAll: true },
        groupPanel: { visible: false },
        loadPanel: {
            enabled: true,
            text: "Đang tải dữ liệu...",
            showIndicator: true,
            showPane: true
        },
        onCellPrepared: function (e) {
            if (e.rowType === "header") {
                $(e.cellElement).addClass("col-header");
            }
            if (e.rowType === "data") {
                $(e.cellElement).addClass("text-center");
            }
        },
        onContentReady: function (e) {
            if (selectedAreaID) return;

            const rows = e.component.getVisibleRows().filter(r => r.rowType === "data");
            if (rows.length > 0) {
                e.component.selectRowsByIndexes([rows[0].rowIndex]);
            }
        },
        onSelectionChanged: async function (e) {
            if (e.selectedRowsData.length === 0) return;

            const data = e.selectedRowsData[0];
            selectedAreaID = data.AreaId

        },
        columns: [
            {
                caption: "STT",
                alignment: "center",
                width: 50,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            {
                caption: "Tên khu vực",
                dataField: "AreaName",
                width: 220,
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm">');
                    $input.val(options.data.AreaName || "");
                    container.append($input);
                    $input.on("input", function () {
                        options.data.AreaName = $(this).val();
                    });
                    $input.on("blur", function () {
                        const ten = ($(this).val() || "").trim();
                        const isTrung = ten && khuVucList.some(kv =>
                            kv.AreaId !== options.data.AreaId &&
                            (kv.AreaName || "").trim().toLowerCase() === ten.toLowerCase()
                        );
                        if (isTrung) {
                            showToast("warning", `Tên khu vực "${ten}" đã tồn tại trong danh sách!`);
                            $input.addClass("is-invalid");
                        } else {
                            $input.removeClass("is-invalid");
                        }
                        updateKhuVucActionButtons();
                    });
                }
            },
            {
                caption: "Tên viết tắt",
                dataField: "AreaCode",
                width: 130,
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm">');
                    $input.val(options.data.AreaCode || "");
                    container.append($input);
                    $input.on("input", function () {
                        options.data.AreaCode = $(this).val();
                    });
                }
            },
            {
                caption: "Ghi chú",
                dataField: "Address",
                minWidth: 250,
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm">');
                    $input.val(options.data.Address || "");
                    container.append($input);
                    $input.on("input", function () {
                        options.data.Address = $(this).val();
                    });
                }
            },
            {
                type: "buttons",
                caption: "",
                width: 50,
                alignment: "center",
                buttons: [
                    {
                        hint: "Xóa khu vực",
                        template: function (cellElement, cellInfo) {
                            $("<a>")
                                .addClass("text-danger btn-icon-only")
                                .attr("title", "Xóa khu vực")
                                .html('<i class="fa-solid fa-trash"></i>')
                                .appendTo(cellElement)
                                .on("click", function () {
                                    if ($("#dxDataKhuVuc .is-invalid").length > 0) {
                                        showToast("warning", "Vui lòng xử lý các dòng đang bị cảnh báo trùng trước khi thao tác!");
                                        return;
                                    }
                                    showConfirmModalXoa(function () {
                                        khuVucList = khuVucList.filter(x => x.AreaId !== cellInfo.row.data.AreaId);
                                        const arrSaveKhuVuc = [{
                                            AreaId: cellInfo.row.data.AreaId,
                                            AreaName: "",
                                            AreaCode: "",
                                            Address: "",
                                            CreatedBy: userNameSave
                                        }];
                                        ApiSave(arrSaveKhuVuc, 'DeleteKhuVuc')

                                        if (khuVucList.length > 0) {
                                            const sortValues = khuVucList.map(cd => parseInt(cd.Sort) || 0);
                                            maxSortLine = Math.max(...sortValues) + 1;
                                        } else {
                                            maxSortLine = 1;
                                        }

                                        dxDataKhuVuc.option("dataSource", khuVucList);
                                        dxDataDSLine.refresh()
                                        updateKhuVucActionButtons();
                                        return true;
                                    }, `Bạn có chắc chắn muốn xóa khu vực "${cellInfo.row.data.AreaName || ''}" không?`);
                                });
                        }
                    }
                ]
            }
        ]
    }).dxDataGrid("instance");
    $("#Layer_1").click()

}

async function ApiSave(arrSave, action) {
    try {
        const request = new Request(`/api/ERP_DicUser/Post?action=${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });
        await fetch(request)
        GetLine();
        showToast("success", "Lưu thành công")

    } catch (err) {
        console.error(err)
        showToast("error", "Lưu thất bại")
        return false;
    }

}
async function ApiSaveLine(arrSave, action) {
    try {
        const request = new Request(`/api/ERP_DicUser/PostLine?action=${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });
        await fetch(request)
        showToast("success", "Lưu thành công")
        GetLine();
    } catch (err) {
        console.error(err)
        showToast("error", "Lưu thất bại")
        return false;
    }

}
$(async function () {
    await GetKhuVuc()
    GetLine()
    $("#btnThemDong").on("click", function () {
        console.log(`maxSortLine: `, maxSortLine)
        // Sinh id tạm âm cho dòng mới (chưa lưu) để tránh trùng/NaN
        let minId = 0;
        lineList.forEach(x => { if (typeof x.id === "number" && x.id < minId) minId = x.id; });
        lineList.push({
            id: `NEW_ID_${maxSortLine}`,
            Line_ID: "",
            Line_Name: "",
            AreaId: "",
            Sort: maxSortLine
        });

        maxSortLine++;
        dxDataDSLine.refresh();
    });

    $("#btnLuuChuyen").on("click", function () {
        // Duyệt từng dòng theo đúng thứ tự hiển thị để báo lỗi + focus đúng dòng
        for (let i = 0; i < lineList.length; i++) {
            const row = lineList[i];
            const lineId = (row.Line_ID || "").trim();
            const lineName = (row.Line_Name || "").trim();
            const areaId = row.AreaId || "";

            // Dòng trống hoàn toàn (chưa nhập gì) -> bỏ qua, không tính là lỗi
            if (!lineId && !lineName && !areaId) continue;

            // Đã có Line Name hoặc Khu vực nhưng chưa nhập Line ID -> báo lỗi và focus vào đúng dòng
            if (!lineId) {
                showToast("warning", "Vui lòng nhập Line ID cho dòng này!");
                focusLineCell(i, "Line_ID");
                return;
            }

            if (!lineName) {
                showToast("warning", `Vui lòng nhập Line Name cho dòng có Line ID "${lineId}"!`);
                focusLineCell(i, "Line_Name");
                return;
            }

            if (!areaId) {
                showToast("warning", `Vui lòng chọn khu vực cho dòng có Line ID "${lineId}"!`);
                focusLineCell(i, "AreaId");
                return;
            }
        }

        // Chỉ lấy các dòng đã nhập đủ Line ID (bỏ qua dòng trống chưa nhập gì)
        const rowsToSave = lineList.filter(x => (x.Line_ID || "").trim());

        if (rowsToSave.length === 0) {
            showToast("warning", "Chưa có dòng nào hợp lệ để lưu!");
            return;
        }

        // Kiểm tra trùng Line_ID trong các dòng sẽ lưu
        const lineIdList = rowsToSave.map(x => x.Line_ID.trim().toLowerCase());
        const lineIdTrung = lineIdList.find((v, idx) => lineIdList.indexOf(v) !== idx);
        if (lineIdTrung) {
            showToast("warning", `Line ID "${lineIdTrung}" bị trùng, vui lòng kiểm tra lại!`);
            return;
        }



        const arrSaveLine = rowsToSave.map(item => ({
            ID: item.id,
            Line_ID: item.Line_ID,
            Line_Name: item.Line_Name,
            MaKV: item.AreaId,
            CreatedBy: userNameSave,
            Sort: item.Sort
        }));
        ApiSaveLine(arrSaveLine, 'PostLine');
    });

    $("#btnThemKhuVuc").on("click", function () {
        // Tìm số lớn nhất trong các AreaId dạng KVxx để sinh mã mới, tránh trùng/NaN
        let maxNum = 0;
        khuVucList.forEach(kv => {
            const m = /^KV(\d+)$/.exec(kv.AreaId || "");
            if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
        });
        const newAreaId = generateGuid();
        khuVucList.push({
            AreaId: newAreaId,
            AreaName: "",
            AreaCode: "",
            Address: "",
            IsNew: true,
            Sort: maxSortLine
        });
        maxSortLine++;
        dxDataKhuVuc.refresh();
    });

    $("#btnLuuKhuVuc").on("click", function () {
        let hasError = khuVucList.some(kv => !kv.AreaName || !kv.AreaName.trim());

        if (hasError) {
            showToast('warning', "Vui lòng nhập đầy đủ Tên khu vực cho tất cả các dòng!");
            return;
        }

        // Kiểm tra tên khu vực trùng nhau trong danh sách
        const tenList = khuVucList.map(kv => kv.AreaName.trim().toLowerCase());
        const tenTrung = tenList.find((ten, idx) => tenList.indexOf(ten) !== idx);
        if (tenTrung) {
            showToast('warning', `Tên khu vực "${tenTrung}" bị trùng, vui lòng kiểm tra lại!`);
            return;
        }

        const arrSaveKhuVuc = khuVucList.map(item => ({
            AreaId: item.AreaId,
            AreaName: item.AreaName,
            AreaCode: item.AreaCode,
            Address: item.Address,
            CreatedBy: userNameSave,
            Sort: item.Sort
        }));

        ApiSave(arrSaveKhuVuc, 'PostKhuVuc')
        GetMaxSortArea();
        khuVucList.map(x => {
            x.IsNew = false;
        })
    });
})
async function GetMaxSortLine() {
    var url = `/api/ERP_DicUser/Get?action=GetMaxSortLine`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        maxSortLine = data[0].MaxSort;
    } catch (error) {
        console.error(error.message);
    }
}
async function GetMaxSortArea() {
    var url = `/api/ERP_DicUser/Get?action=GetMaxSortArea`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        maxSortArea = data[0].MaxSort;
    } catch (error) {
        console.error(error.message);
    }
}

async function ApiSaveSort(arrSave) {
    try {
        const request = new Request(`/api/ERP_DicUser/Post?action=UpdateSortKhuVuc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(arrSave.map(item => ({
                AreaId: item.AreaId,
                AreaName: '',
                AreaCode: '',
                Address: '',
                CreatedBy: '',
                Sort: item.Sort
            })))
        });
        await fetch(request);
    } catch (err) {
        console.error(err);
        showToast("error", "Cập nhật thứ tự thất bại");
    }
}
// ============ UPDATED handleSort function ============
// Check: nếu move dòng lên/xuống mà khác AreaId -> reject với toast message

function handleSort(btn) {
    console.log(`lineList: `, lineList)
    const isNeedSave = lineList.some(item => String(item.id).includes('NEW'));
    if (isNeedSave) {
        showToast("warning", `Vui lòng lưu chuyền trước trước khi sắp xếp !`);
        return;
    }

    const target = $(btn).data("target");
    const idx = lineList.findIndex(x => x.Line_ID === selectedLineID);

    if (target === "up") {
        if (idx > 0) {
            const currentAreaId = lineList[idx].AreaId;
            const upAreaId = lineList[idx - 1].AreaId;

            if (currentAreaId !== upAreaId) {
                const areaName = khuVucList.find(kv => kv.AreaId === currentAreaId)?.AreaName || currentAreaId;
                showToast("warning", `Không thể di chuyển dòng "${lineList[idx].Line_ID}" ra khỏi khu vực "${areaName}"!`);
                return;
            }

            const tempLineId = lineList[idx].Line_ID;
            const tempLineName = lineList[idx].Line_Name;
            const tempAreaId = lineList[idx].AreaId;

            lineList[idx].Line_ID = lineList[idx - 1].Line_ID;
            lineList[idx].Line_Name = lineList[idx - 1].Line_Name;
            lineList[idx].AreaId = lineList[idx - 1].AreaId;

            lineList[idx - 1].Line_ID = tempLineId;
            lineList[idx - 1].Line_Name = tempLineName;
            lineList[idx - 1].AreaId = tempAreaId;

            dxDataDSLine.option("dataSource", lineList);
            setTimeout(() => dxDataDSLine.selectRowsByIndexes([idx - 1]), 100);
        }
    } else if (target === "down") {
        if (idx < lineList.length - 1) {
            const currentAreaId = lineList[idx].AreaId;
            const downAreaId = lineList[idx + 1].AreaId;

            if (currentAreaId !== downAreaId) {
                const areaName = khuVucList.find(kv => kv.AreaId === currentAreaId)?.AreaName || currentAreaId;
                showToast("warning", `Không thể di chuyển dòng "${lineList[idx].Line_ID}" ra khỏi khu vực "${areaName}"!`);
                return;
            }

            console.log(`lineListIDX: `, lineList[idx])
            const tempLineId = lineList[idx].Line_ID;
            const tempLineName = lineList[idx].Line_Name;
            const tempAreaId = lineList[idx].AreaId;

            lineList[idx].Line_ID = lineList[idx + 1].Line_ID;
            lineList[idx].Line_Name = lineList[idx + 1].Line_Name;
            lineList[idx].AreaId = lineList[idx + 1].AreaId;

            lineList[idx + 1].Line_ID = tempLineId;
            lineList[idx + 1].Line_Name = tempLineName;
            lineList[idx + 1].AreaId = tempAreaId;

            dxDataDSLine.option("dataSource", lineList);
            setTimeout(() => dxDataDSLine.selectRowsByIndexes([idx + 1]), 100);
        }
    }
}

async function handleSortKhuVuc(btn) {
    const isNeedSave = khuVucList.some(item => item.IsNew);
    if (isNeedSave) {
        showToast("warning", `Vui lòng lưu khu vực trước trước khi sắp xếp !`);
        return;
    }

    const target = $(btn).data("target");
    const idx = khuVucList.findIndex(x => x.AreaId === selectedAreaID);

    if (target === "up") {
        if (idx > 0) {
            const tempSort = khuVucList[idx].Sort;
            khuVucList[idx].Sort = khuVucList[idx - 1].Sort;
            khuVucList[idx - 1].Sort = tempSort;

            const tempTenKhuVuc = khuVucList[idx].AreaName;
            const tempTenVietTat = khuVucList[idx].AreaCode;
            const tempGhiChu = khuVucList[idx].Address;

            khuVucList[idx].AreaName = khuVucList[idx - 1].AreaName;
            khuVucList[idx].AreaCode = khuVucList[idx - 1].AreaCode;
            khuVucList[idx].Address = khuVucList[idx - 1].Address;

            khuVucList[idx - 1].AreaName = tempTenKhuVuc;
            khuVucList[idx - 1].AreaCode = tempTenVietTat;
            khuVucList[idx - 1].Address = tempGhiChu;

            dxDataKhuVuc.option("dataSource", khuVucList);
            setTimeout(() => dxDataKhuVuc.selectRowsByIndexes([idx - 1]), 200);

            await ApiSaveSort([khuVucList[idx], khuVucList[idx - 1]]);

        }
    } else if (target === "down") {
        if (idx < khuVucList.length - 1) {
            const tempSort = khuVucList[idx].Sort;
            khuVucList[idx].Sort = khuVucList[idx + 1].Sort;
            khuVucList[idx + 1].Sort = tempSort;

            const tempTenKhuVuc = khuVucList[idx].AreaName;
            const tempTenVietTat = khuVucList[idx].AreaCode;
            const tempGhiChu = khuVucList[idx].Address;

            khuVucList[idx].AreaName = khuVucList[idx + 1].AreaName;
            khuVucList[idx].AreaCode = khuVucList[idx + 1].AreaCode;
            khuVucList[idx].Address = khuVucList[idx + 1].Address;

            khuVucList[idx + 1].AreaName = tempTenKhuVuc;
            khuVucList[idx + 1].AreaCode = tempTenVietTat;
            khuVucList[idx + 1].Address = tempGhiChu;

            dxDataKhuVuc.option("dataSource", khuVucList);
            setTimeout(() => dxDataKhuVuc.selectRowsByIndexes([idx + 1]), 200);

            await ApiSaveSort([khuVucList[idx], khuVucList[idx + 1]]);
        }
    }


    await GetKhuVuc();
    await GetLine();
}