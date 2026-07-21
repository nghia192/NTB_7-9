
/// Variable
let congDoanList = [];
let chungLoaiList = []
let congDoanListOriginal = [];

let selectedMaCL;
let selectedMaCL_ID;
let selectedMaCongDoan;

let maxSort;
let maCL;
var userNameSave = localStorage.getItem("username1")

let dxDataDSChungLoai;
let dxDataCongDoan;
let newIDCongDoan = 0;


/// Function
function handleSort(btn) {
    if (!selectedMaCongDoan) {
        showToast("warning", "Vui lòng chọn công đoạn trước!");
        return;
    }

    const target = $(btn).data("target");
    const idx = congDoanList.findIndex(x => x.MaCongDoan === selectedMaCongDoan);

    if (target === "up") {
        if (idx > 0) {
            const tempTen = congDoanList[idx].TenCongDoan;
            const tempGhi = congDoanList[idx].GhiChu;
            const tempNguoiTao = congDoanList[idx].NguoiTao;
            const tempNguoiSua = congDoanList[idx].NguoiSua;
            const tempTenCongDoanTA = congDoanList[idx].TenCongDoanTA;

            congDoanList[idx].TenCongDoan = congDoanList[idx - 1].TenCongDoan;
            congDoanList[idx].GhiChu = congDoanList[idx - 1].GhiChu;
            congDoanList[idx].NguoiTao = congDoanList[idx - 1].NguoiTao;
            congDoanList[idx].NguoiSua = congDoanList[idx - 1].NguoiSua;
            congDoanList[idx].tempTenCongDoanTA = congDoanList[idx - 1].tempTenCongDoanTA;

            congDoanList[idx - 1].TenCongDoan = tempTen;
            congDoanList[idx - 1].GhiChu = tempGhi;
            congDoanList[idx - 1].NguoiTao = tempNguoiTao;
            congDoanList[idx - 1].NguoiSua = tempNguoiSua;
            congDoanList[idx - 1].TenCongDoanTA = tempTenCongDoanTA;

            dxDataCongDoan.option("dataSource", congDoanList);
            setTimeout(() => dxDataCongDoan.selectRowsByIndexes([idx - 1]), 100);
        }
    } else if (target === "down") {
        if (idx < congDoanList.length - 1) {
            const tempTen = congDoanList[idx].TenCongDoan;
            const tempGhi = congDoanList[idx].GhiChu;
            const tempNguoiTao = congDoanList[idx].NguoiTao;
            const tempNguoiSua = congDoanList[idx].NguoiSua;
            const tempTenCongDoanTA = congDoanList[idx].TenCongDoanTA;

            congDoanList[idx].TenCongDoan = congDoanList[idx + 1].TenCongDoan;
            congDoanList[idx].GhiChu = congDoanList[idx + 1].GhiChu;
            congDoanList[idx].NguoiTao = congDoanList[idx + 1].NguoiTao;
            congDoanList[idx].NguoiSua = congDoanList[idx + 1].NguoiSua;
            congDoanList[idx].tempTenCongDoanTA = congDoanList[idx - 1].tempTenCongDoanTA;

            congDoanList[idx + 1].TenCongDoan = tempTen;
            congDoanList[idx + 1].GhiChu = tempGhi;
            congDoanList[idx + 1].NguoiTao = tempNguoiTao;
            congDoanList[idx + 1].NguoiSua = tempNguoiSua;
            congDoanList[idx - 1].TenCongDoanTA = tempTenCongDoanTA;

            dxDataCongDoan.option("dataSource", congDoanList);
            setTimeout(() => dxDataCongDoan.selectRowsByIndexes([idx + 1]), 100);
        }
    }
}

function isCongDoanListChanged() {
    if (congDoanList.length !== congDoanListOriginal.length) return true;
    return congDoanList.some((item, idx) => {
        const orig = congDoanListOriginal[idx];
        return item.TenCongDoan !== orig.TenCongDoan ||
            item.GhiChu !== orig.GhiChu ||
            item.Sort !== orig.Sort;
    });
}

function showConfirmModalLuu(onConfirm, onCancle) {
    $("#txtXacNhanLuu").text("Bạn có muốn lưu thay đổi này không?");
    $("#modalXacNhanLuu").modal('show')

    $('#btnXacNhanLuu').off('click').on('click', async function () {
        if (typeof onConfirm === 'function') {
            await onConfirm();  //
        }
        $("#modalXacNhanLuu").modal('hide')
    });

    $('#btnXacNhanKhongLuu').off('click').on('click', async function () {
        if (typeof onCancle === 'function') {
            await onCancle();
        }
        $("#modalXacNhanLuu").modal('hide')
    });
}

/// Event
$(function () {
    CreateViewDxGridDataCongDoan([])
    GetChungLoai()
    $("#btnThemDong").on("click", function () {
        // Sinh id tạm âm cho dòng mới (chưa lưu) để tránh trùng/NaN
        chungLoaiList.push({
            MaCL: `NEW_CL_${newIDCongDoan}`,
            TenCLTiengAnh: "",
            TenCLTiengViet: "",
            GhiChu: "",
            NguoiTao: userNameSave
        });

        newIDCongDoan++;
        dxDataDSChungLoai.refresh();
    });

    $("#btnLuuChungLoai").on("click", function () {
        // Duyệt từng dòng theo đúng thứ tự hiển thị để báo lỗi + focus đúng dòng

        for (let i = 0; i < chungLoaiList.length; i++) {
            const row = chungLoaiList[i];
            const TenCLTiengViet = (row.TenCL || "").trim();
            const TenCLTiengAnh = (row.TenCLTiengAnh || "").trim();
            const GhiChu = (row.GhiChu || "").trim();

            // Dòng trống hoàn toàn (chưa nhập gì) -> bỏ qua, không tính là lỗi
            if (!TenCLTiengAnh && !TenCLTiengViet && !GhiChu) continue;

            if (!TenCLTiengViet && !TenCLTiengAnh) {
                showToast("warning", "Vui lòng nhập tên chủng loại cho dòng này!");
                focusLineCell(dxDataDSChungLoai, i, "TenCL");
                return;
            }
        }

        // Chỉ lấy các dòng đã nhập 1 trong 2 Tên CL Tiếng Việt Hoặc Tiếng Anh
        const rowsToSave = chungLoaiList.filter(x => (x.TenCLTiengAnh || "").trim() || (x.TenCL || "").trim());

        if (rowsToSave.length === 0) {
            showToast("warning", "Chưa có dòng nào hợp lệ để lưu!");
            return;
        }

        const arrSaveLine = rowsToSave.map(item => ({
            MaCL: item.MaCL,
            TenCL: item.TenCL,
            GhiChu: item.GhiChu,
            NguoiTao: userNameSave,
            NguoiSua: userNameSave,
            TenCLTiengAnh: item.TenCLTiengAnh
        }));


        ApiSaveChungLoai(arrSaveLine, 'PostChungLoai', '@TypeDicChungLoai');
    });

    $("#btnThemCongDoan").on("click", async function () {
        const dataChungLoai = dxDataDSChungLoai.option("dataSource").filter(cl => (cl.MaCL || "").includes("NEW"));
        if (dataChungLoai.length > 0) {
            showToast('warning', "Vui lòng lưu chủng loại trước khi thêm khi công đoạn")
            return;
        }

        console.log(`maxSort: `, maxSort)
        console.log(`selectedMaCL_ID: `, selectedMaCL_ID)

        congDoanList.push({
            TenCongDoan: '',
            MaCongDoan: `${selectedMaCL_ID}.${maxSort}`,
            GhiChu: '',
            ChungLoai: selectedMaCL,
            Sort: maxSort,
            NguoiTao: userNameSave,
            NguoiSua: userNameSave
        });

        maxSort++;
        dxDataCongDoan.refresh();
    });

    $("#btnLuuCongDoan").on("click", function () {
        const dataChungLoai = dxDataDSChungLoai.option("dataSource").filter(cl => (cl.MaCL || "").includes("NEW"));
        if (dataChungLoai.length > 0) {
            showToast('warning', "Vui lòng lưu chủng loại trước khi thêm khi công đoạn")
            return;
        }


        for (let i = 0; i < congDoanList.length; i++) {
            const row = congDoanList[i];
            const TenCongDoan = (row.TenCongDoan || "").trim();
            const GhiChu = (row.GhiChu || "").trim();

            // Dòng trống hoàn toàn (chưa nhập gì) -> bỏ qua, không tính là lỗi
            if (!TenCongDoan && !GhiChu) continue;

            if (!TenCongDoan) {
                showToast("warning", "Vui lòng nhập tên công đoạn cho dòng này!");
                focusLineCell(dxDataCongDoan, i, "TenCongDoan");
                return;
            }
        }

        // Kiểm tra tên khu vực trùng nhau trong danh sách
        const tenList = congDoanList.filter(cd => (cd.TenCongDoan || "").trim()).map(cd => cd.TenCongDoan.trim().toLowerCase());

        const tenTrung = tenList.find((ten, idx) => tenList.indexOf(ten) !== idx);

        if (tenTrung) {
            showToast('warning', `Tên khu vực "${tenTrung}" bị trùng, vui lòng kiểm tra lại!`);
            return;
        }

        const arrSaveCongDoan = congDoanList.map(item => ({
            TenCongDoan: item.TenCongDoan,
            MaCongDoan: item.MaCongDoan,
            GhiChu: item.GhiChu,
            ChungLoai: item.ChungLoai,
            Sort: item.Sort,
            NguoiTao: userNameSave,
            NguoiSua: userNameSave,
            TenCongDoanTA: item.TenCongDoanTA
        }));

        ApiSaveCongDoan(arrSaveCongDoan, 'PostCongDoan', '@TypeDicCongDoan')
    });
})

/// API
async function GetMaxSort() {
    var url = `/api/Dic_ChungLoaiCongDoan/Get?action=GetMaxSort&para1=${selectedMaCL || ""}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();

        maxSort = data[0].MaxSort

    } catch (error) {
        console.error(error.message);
    }
}
async function GetCongDoan() {
    var url = `/api/Dic_ChungLoaiCongDoan/Get?action=GetCongDoan&para1=${selectedMaCL || ""}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        congDoanList = data
        congDoanListOriginal = JSON.parse(JSON.stringify(data));
        CreateViewDxGridDataCongDoan(congDoanList);

    } catch (error) {
        console.error(error.message);
    }
}
async function GetChungLoai() {
    var url = `/api/Dic_ChungLoaiCongDoan/Get?action=GetChungLoai`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        chungLoaiList = data
        CreateViewDxDataDSChungLoai(chungLoaiList)
    } catch (error) {
        console.error(error.message);
    }
}

async function GetMaChungLoai() {
    var url = `/api/Dic_ChungLoaiCongDoan/Get?action=GetMaChungLoai`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        chungLoaiList = data
        CreateViewDxDataDSChungLoai(chungLoaiList)
    } catch (error) {
        console.error(error.message);
    }
}

async function DeleteCongDoan(maCongDoan) {
    var url = `/api/Dic_ChungLoaiCongDoan/Get?action=DeleteCongDoan&para1=${maCongDoan}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        await response.json();

    } catch (error) {
        console.error(error.message);
    }
}

async function DeleteChungLoai(maChungLoai) {
    var url = `/api/Dic_ChungLoaiCongDoan/Get?action=DeleteChungLoai&para1=${maChungLoai}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        await response.json();
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


// Cuộn tới và focus vào ô dữ liệu bị thiếu trong bảng chuyền
function focusLineCell(dxDataGrid, rowIndex, dataField) {
    setTimeout(function () {
        const cellEl = dxDataGrid.getCellElement(rowIndex, dataField);
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
        updateChungLoaiActionButtons();
    }, 50);
}



// Khi còn ô đang cảnh báo trùng (is-invalid) trong bảng chuyền -> khóa nút Thêm/Lưu chuyền
function updateChungLoaiActionButtons() {
    const hasInvalid = $("#dxDataDSChungLoai .is-invalid").length > 0;
    $("#btnThemDong, #btnLuuChungLoai").prop("disabled", hasInvalid);
    $("#dxDataDSChungLoai .btn-icon-only").toggleClass("disabled", hasInvalid);
}
function updateCongDoanActionButtons() {
    const hasInvalid = $("#dxDataCongDoan .is-invalid").length > 0;
    $("#btnThemCongDoan, #btnLuuCongDoan, .btnSort").prop("disabled", hasInvalid);
    $("#dxDataCongDoan .btn-icon-only").toggleClass("disabled", hasInvalid);
}

function showConfirmModalXoa(onConfirm, message) {
    $("#txtXacNhanXoa").text(message || "Bạn có chắc chắn muốn xóa mục này không?");

    $('#btnXacNhanXoa').off('click').on('click', async function () {
        if (typeof onConfirm === 'function') {
            const result = await onConfirm();
            if (result === false) {
                return; // ❌ KHÔNG đóng modal
            }
        }
        bootstrap.Modal.getInstance(document.getElementById("modalXacNhanXoa"))?.hide();
    });

    let modalXacNhanXoa = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalXacNhanXoa"));
    modalXacNhanXoa.show();
}
function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}




async function ApiSaveCongDoan(arrSave, action, type) {
    try {
        const request = new Request(`/api/Dic_ChungLoaiCongDoan/PostCongDoan?action=${action}&type=${type}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });
        await fetch(request)

        await GetCongDoan();
        showToast("success", "Lưu thành công")

    } catch (err) {
        console.error(err)
        showToast("error", "Lưu thất bại")
        return false;
    }

}

async function ApiSaveChungLoai(arrSave, action, type) {
    try {
        const request = new Request(`/api/Dic_ChungLoaiCongDoan/PostChungLoai?action=${action}&type=${type}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });
        await fetch(request)
        GetChungLoai()
        showToast("success", "Lưu thành công")

    } catch (err) {
        console.error(err)
        showToast("error", "Lưu thất bại")
        return false;
    }

}


/// DxDataGrid
function CreateViewDxDataDSChungLoai(data) {
    if (dxDataDSChungLoai) {
        dxDataDSChungLoai.option("dataSource", data);
        dxDataDSChungLoai.refresh();
        return;
    }

    dxDataDSChungLoai = $("#dxDataDSChungLoai").dxDataGrid({
        dataSource: data,
        columnAutoWidth: true,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        noDataText: "", minWidth: "100%",
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
            const rows = e.component.getVisibleRows().filter(r => r.rowType === "data");

            if (rows.length > 0) {
                e.component.selectRowsByIndexes([rows[0].rowIndex]);
            }
        },
        onSelectionChanged: async function (e) {
            if (e.selectedRowsData.length === 0) return;
            const newData = e.selectedRowsData[0];

            if (isCongDoanListChanged()) {
                showConfirmModalLuu(
                    async function () {
                        $("#btnLuuCongDoan").trigger('click');

                        selectedMaCL = newData.MaCL;
                        selectedMaCL_ID = newData.ID;
                        selectedMaCongDoan = null;
                        await GetMaxSort();
                        GetCongDoan();
                    },
                    async function () {
                        selectedMaCL = newData.MaCL;
                        selectedMaCL_ID = newData.ID;
                        selectedMaCongDoan = null;
                        await GetMaxSort();
                        GetCongDoan();
                    }
                );
                return;
            }

            selectedMaCL = newData.MaCL;
            selectedMaCL_ID = newData.ID;
            selectedMaCongDoan = null;
            await GetMaxSort();
            GetCongDoan();


        },
        columns: [
            {
                caption: "STT",
                alignment: "center",
                minWidth: 50,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            {
                caption: "Tên CL (TV)",
                dataField: "TenCL",
                alignment: "center",
                minWidth: 160,
                // Ô nhập trực tiếp cho TenCL
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm text-center">');
                    $input.val(options.data.TenCL || "");

                    container.append($input);

                    $input.on("input", function () {
                        options.data.TenCL = $(this).val();
                    });

                    $input.on("blur", function () {
                        const val = ($(this).val() || "").trim();
                        const isTrung = val && chungLoaiList.some(x =>
                            x.MaCL !== options.data.MaCL &&
                            ((x.TenCL || "").trim().toLowerCase() === val.toLowerCase())

                        );
                        if (isTrung) {
                            showToast("warning", `Tên chủng loại tiếng việt "${val}" đã tồn tại trong danh sách!`);
                            $input.addClass("is-invalid");
                        } else {
                            $input.removeClass("is-invalid");
                        }
                        updateChungLoaiActionButtons();
                    });
                }
            },
            {
                caption: "Tên CL (TA)",
                dataField: "TenCLTiengAnh",
                alignment: "center",
                minWidth: 160,
                // Ô nhập trực tiếp cho TenCLTiengAnh
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm text-center">');
                    $input.val(options.data.TenCLTiengAnh || "");

                    container.append($input);

                    $input.on("input", function () {
                        options.data.TenCLTiengAnh = $(this).val();
                    });

                    $input.on("blur", function () {
                        const val = ($(this).val() || "").trim();
                        const isTrung = val && chungLoaiList.some(x =>
                            x.MaCL !== options.data.MaCL &&
                            ((x.TenCLTiengAnh || "").trim().toLowerCase() === val.toLowerCase())

                        );
                        if (isTrung) {
                            showToast("warning", `Tên chủng loại tiếng anh "${val}" đã tồn tại trong danh sách!`);
                            $input.addClass("is-invalid");
                        } else {
                            $input.removeClass("is-invalid");
                        }
                        updateChungLoaiActionButtons();
                    });
                }
            },
            {
                caption: "Ghi Chú",
                dataField: "GhiChu",
                alignment: "center",
                minWidth: 160,
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm text-center">');
                    $input.val(options.data.GhiChu || "");

                    container.append($input);

                    $input.on("input", function () {
                        options.data.GhiChu = $(this).val();
                    });

                }
            },
            {
                caption: "Người Tạo",
                dataField: "NguoiTao",
                alignment: "center",
                minWidth: 200,
            },
            {
                type: "buttons",
                caption: "Thao tác",
                minWidth: 80,
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
                                    if ($("#dxDataDSChungLoai .is-invalid").length > 0) {
                                        showToast("warning", "Vui lòng xử lý các dòng đang bị cảnh báo trùng trước khi thao tác!");
                                        return;
                                    }
                                    showConfirmModalXoa(function () {
                                        chungLoaiList = chungLoaiList.filter(x => x.MaCL !== cellInfo.row.data.MaCL);

                                        const maCLDelete = cellInfo.row.data.MaCL?.trim();

                                        if (maCLDelete) {
                                            DeleteChungLoai(maCLDelete);
                                        }

                                        dxDataDSChungLoai.option("dataSource", chungLoaiList);
                                        dxDataDSChungLoai.refresh()
                                        updateChungLoaiActionButtons();
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
function CreateViewDxGridDataCongDoan(data) {
    if (dxDataCongDoan) {
        dxDataCongDoan.option("dataSource", data);
        dxDataCongDoan.refresh();
        return;
    }
    dxDataCongDoan = $("#dxDataCongDoan").dxDataGrid({
        dataSource: data,
        columnAutoWidth: true,
        allowColumnResizing: false,
        columnHidingEnabled: false,
        wordWrapEnabled: true,
        showRowLines: true,
        showBorders: true,
        noDataText: "Không Có Thông Tin Công Đoạn", minWidth: "100%",
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
            if (selectedMaCongDoan) return;

            const rows = e.component.getVisibleRows().filter(r => r.rowType === "data");
            if (rows.length > 0) {
                e.component.selectRowsByIndexes([rows[0].rowIndex]);
            }
        },
        onSelectionChanged: async function (e) {
            if (e.selectedRowsData.length === 0) return;

            const data = e.selectedRowsData[0];
            selectedMaCongDoan = data.MaCongDoan

        },
        columns: [
            {
                caption: "STT",
                alignment: "center",
                minWidth: 50,
                allowFiltering: false,
                allowSorting: false,
                cellTemplate: function (container, options) {
                    container.text(options.rowIndex + 1);
                }
            },
            {
                caption: "Tên Công Đoạn (TV)",
                dataField: "TenCongDoan",
                minWidth: 220,
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm">');
                    $input.val(options.value || "");
                    container.append($input);
                    $input.on("input", function () {
                        options.data.TenCongDoan = $(this).val();
                    });
                    $input.on("blur", function () {
                        const ten = ($(this).val() || "").trim();
                        const isTrung = ten && congDoanList.some(cd =>
                            cd.MaCongDoan !== options.data.MaCongDoan &&
                            (cd.TenCongDoan || "").trim().toLowerCase() === ten.toLowerCase()
                        );
                        if (isTrung) {
                            showToast("warning", `Tên công đoạn "${ten}" đã tồn tại trong danh sách!`);
                            $input.addClass("is-invalid");
                        } else {
                            $input.removeClass("is-invalid");
                        }
                        updateCongDoanActionButtons();
                    });
                }
            },
            {
                caption: "Tên Công Đoạn (TA)",
                dataField: "TenCongDoanTA",
                minWidth: 220,
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm">');
                    $input.val(options.value || "");
                    container.append($input);
                    $input.on("input", function () {
                        options.data.TenCongDoanTA = $(this).val();
                    });
                    $input.on("blur", function () {
                        const ten = ($(this).val() || "").trim();
                        const isTrung = ten && congDoanList.some(cd =>
                            cd.MaCongDoan !== options.data.MaCongDoan &&
                            (cd.TenCongDoanTA || "").trim().toLowerCase() === ten.toLowerCase()
                        );
                        if (isTrung) {
                            showToast("warning", `Tên công đoạn tiếng anh "${ten}" đã tồn tại trong danh sách!`);
                            $input.addClass("is-invalid");
                        } else {
                            $input.removeClass("is-invalid");
                        }
                        updateCongDoanActionButtons();
                    });
                }
            },
            {
                caption: "Ghi Chú",
                dataField: "GhiChu",
                alignment: "center",
                minWidth: 160,
                // Ô nhập trực tiếp cho Line Name
                cellTemplate: function (container, options) {
                    const $input = $('<input type="text" class="form-control form-control-sm text-center">');
                    $input.val(options.data.GhiChu || "");

                    container.append($input);

                    $input.on("input", function () {
                        options.data.GhiChu = $(this).val();
                    });

                }
            },
            {
                caption: "Người Tạo",
                dataField: "NguoiTao",
                minWidth: 80,
            },
            {
                type: "buttons",
                caption: "Thao Tác",
                minWidth: 50,
                alignment: "center",
                buttons: [
                    {
                        hint: "Xóa Công Đoạn",
                        template: function (cellElement, cellInfo) {
                            $("<a>")
                                .addClass("text-danger btn-icon-only")
                                .attr("title", "Xóa khu vực")
                                .html('<i class="fa-solid fa-trash"></i>')
                                .appendTo(cellElement)
                                .on("click", function () {
                                    if ($("#dxDataCongDoan .is-invalid").length > 0) {
                                        showToast("warning", "Vui lòng xử lý các dòng đang bị cảnh báo trùng trước khi thao tác!");
                                        return;
                                    }
                                    showConfirmModalXoa(function () {
                                        congDoanList = congDoanList.filter(x => x.MaCongDoan !== cellInfo.row.data.MaCongDoan);
                                        const maCongDoan = cellInfo.row.data.MaCongDoan?.trim();

                                        if (maCongDoan) {
                                            DeleteCongDoan(maCongDoan);
                                        }

                                        if (congDoanList.length > 0) {
                                            const sortValues = congDoanList.map(cd => parseInt(cd.MaCongDoan.split('.')[1]) || 0);
                                            maxSort = Math.max(...sortValues) + 1;
                                        } else {
                                            maxSort = 0;
                                        }

                                        dxDataCongDoan.option("dataSource", congDoanList);
                                        dxDataCongDoan.refresh()
                                        updateCongDoanActionButtons();
                                        return true;
                                    }, `Bạn có chắc chắn muốn xóa công đoạn "${cellInfo.row.data.TenCongDoan || ''}" không?`);
                                });
                        }
                    }
                ]
            }
        ]
    }).dxDataGrid("instance");

    $("#Layer_1").click()
}