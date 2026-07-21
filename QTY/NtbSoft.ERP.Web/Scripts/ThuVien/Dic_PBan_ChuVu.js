var userNameSave = localStorage.getItem("username1")
// ---------- Dữ liệu mẫu ----------
let departments = [];
let positions = [];
let nextDeptId = 5, nextPosId = 9;
let deleteTarget = null; // { type: 'dept'|'pos', id }

const chipPalette = ['#1F7A6C', '#1E2A45', '#B0542B', '#7A4CA0', '#2E6DA4', '#9A6414', '#5C7A29', '#A63E5C'];
function colorFor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return chipPalette[Math.abs(hash) % chipPalette.length];
}
function escapeHtml(s) {
    return $('<div>').text(s || '').html();
}

async function GetDepartments() {
    var url = `/api/Dic_PBan_ChucVu/Get?action=GetDsPhongBan`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        departments = data
        GetPosition()
    } catch (error) {
        console.error(error.message);
    }
}
async function GetPosition() {
    var url = `/api/Dic_PBan_ChucVu/Get?action=DetDSChucVu`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        positions = data
        renderAll();
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
$(function () {
    // ---------- Tabs ----------
    $('#segTabs button').on('click', function () {
        $('#segTabs button').removeClass('active');
        $(this).addClass('active');
        const target = $(this).data('target');
        $('#panel-department, #panel-position').addClass('d-none');
        $('#panel-' + target).removeClass('d-none');
    });



    // ---------- Tìm kiếm ----------
    $('#searchDept').on('input', function () { renderDept($(this).val()); });
    $('#searchPos').on('input', function () { renderPos($(this).val()); });

    // ---------- Thêm / Sửa Phòng ban ----------
    $('#btnAddDept').on('click', function () {
        $('#formDept')[0].reset();
        $('#deptId').val('');
        $('#deptCode').prop('readonly', false);
        $('#modalDeptTitle').text('Thêm phòng ban');
        new bootstrap.Modal('#modalDept').show();
    });

    $(document).on('click', '.btn-edit-dept', function () {
        const d = departments.find(x => x.ID === +$(this).data('id'));
        if (!d) return;
        $('#deptId').val(d.ID);
        $('#deptName').val(d.DepartmentName);
        $('#deptCode').val(d.DepartmentCode).prop('readonly', true);
        $('#deptStatus').val(d.Status);
        $('#deptDesc').val(d.Description);
        $('#modalDeptTitle').text('Sửa phòng ban');
        new bootstrap.Modal('#modalDept').show();
    });

    $('#btnSaveDept').on('click', async function () {
        const name = $('#deptName').val().trim();
        const code = $('#deptCode').val().trim();
        if (!name || !code) {
            showToast('warning', 'Vui lòng nhập đủ thông tin bắt buộc.');
            return;
        }
        const id = $('#deptId').val();
        const isDupCode = departments.some(d => d.DepartmentCode.toLowerCase() === code.toLowerCase() && d.ID !== +id);
        if (isDupCode) {
            showToast('error', 'Mã phòng ban "' + code + '" đã tồn tại. Vui lòng nhập mã khác.');
            return;
        }
        const data = {
            DepartmentName: name,
            DepartmentCode: code,
            Status: $('#deptStatus').val(),
            Description: $('#deptDesc').val().trim()
        };
        const arrSave = [{
            DepartmentName: name,
            DepartmentCode: code,
            Status: $('#deptStatus').val(),
            Description: $('#deptDesc').val().trim()
        }]
        const checkSave =await ApiSave(arrSave, 'PostPB', 'PostPhongBan')
        if (checkSave != "True") {
            showToast('warning', 'Lưu thất bại');
            return
        }
        if (id) {
            const idx = departments.findIndex(d => d.ID === +id);
            departments[idx] = { ...departments[idx], ...data };
            showToast('success', 'Đã cập nhật phòng ban');
        } else {
            departments.push({ ID: nextDeptId++, ...data });
            showToast('success', 'Đã thêm phòng ban mới');
        }
        bootstrap.Modal.getInstance($('#modalDept')[0]).hide();
        renderAll();
    });

    $(document).on('click', '.btn-del-dept', function () {
        const d = departments.find(x => x.ID === +$(this).data('id'));
        if (!d) return;
        deleteTarget = { type: 'dept', id: d.ID };
        $('#confirmMsg').text(`Bạn có chắc muốn xóa phòng ban "${d.DepartmentName}"?`);
        new bootstrap.Modal('#modalConfirm').show();
    });

    // ---------- Thêm / Sửa Chức vụ ----------
    $('#btnAddPos').on('click', function () {
        $('#formPos')[0].reset();
        $('#posId').val('');
        $('#posCode').prop('readonly', false);
        $('#modalPosTitle').text('Thêm chức vụ');
        new bootstrap.Modal('#modalPos').show();
    });

    $(document).on('click', '.btn-edit-pos', function () {
        const p = positions.find(x => x.ID === +$(this).data('id'));
        if (!p) return;
        $('#posId').val(p.ID);
        $('#posName').val(p.PositionName);
        $('#posCode').val(p.PositionCode).prop('readonly', true);
        $('#modalPosTitle').text('Sửa chức vụ');
        new bootstrap.Modal('#modalPos').show();
    });

    $('#btnSavePos').on('click',async function () {
        const name = $('#posName').val().trim();
        const code = $('#posCode').val().trim();
        if (!name || !code) {
            showToast('warning', 'Vui lòng nhập đủ thông tin bắt buộc.');
            return;
        }

        const id = $('#posId').val();
        const isDupCode = positions.some(p => p.PositionCode.toLowerCase() === code.toLowerCase() && p.ID !== +id);
        if (isDupCode) {
            showToast('error', 'Mã chức vụ "' + code + '" đã tồn tại. Vui lòng nhập mã khác.');
            return;
        }
        const data = { PositionName: name, PositionCode: code };

        const arrSave = [{
            PositionName: name,
            PositionCode: code,
          
        }]
        const checkSave =await ApiSave(arrSave, 'PostChucVu', 'PostChuVu')
        if (checkSave != "True") {
            showToast('warning', 'Lưu thất bại');
            return
        }

        if (id) {
            const idx = positions.findIndex(p => p.ID === +id);
            positions[idx] = { ...positions[idx], ...data };
            showToast('success', 'Đã cập nhật chức vụ');
        } else {
            positions.push({ ID: nextPosId++, ...data });
            showToast('success', 'Đã thêm chức vụ mới');
        }
        bootstrap.Modal.getInstance($('#modalPos')[0]).hide();
        renderAll();
    });

    $(document).on('click', '.btn-del-pos', function () {
        const p = positions.find(x => x.ID === +$(this).data('id'));
        if (!p) return;
        deleteTarget = { type: 'pos', id: p.ID };
        $('#confirmMsg').text(`Bạn có chắc muốn xóa chức vụ "${p.PositionName}"?`);
        new bootstrap.Modal('#modalConfirm').show();
    });

    $('#btnConfirmDelete').on('click', async function () {
        if (!deleteTarget) return;
        if (deleteTarget.type === 'dept') {
            const d = departments.find(x => x.ID === deleteTarget.id);
            if (!d) return;
            const arrSave = [{
                DepartmentName: d.DepartmentName,
                DepartmentCode: d.DepartmentCode,
                Status: 0,
                Description: 0
            }];
            const checkSave = await ApiSave(arrSave, 'DeleteDepartment', 'PostPhongBan');
            if (checkSave != "True") {
                showToast('warning', 'Xóa thất bại');
                return;
            }
            departments = departments.filter(x => x.ID !== deleteTarget.id);
            showToast('success', 'Đã xóa phòng ban');
        } else {
            const p = positions.find(x => x.ID === deleteTarget.id);
            if (!p) return;
            const arrSave = [{
                PositionName: p.PositionName,
                PositionCode: p.PositionCode
            }];
            const checkSave = await ApiSave(arrSave, 'DeletePosition', 'PostChuVu');
            if (checkSave != "True") {
                showToast('warning', 'Xóa thất bại');
                return;
            }
            positions = positions.filter(x => x.ID !== deleteTarget.id);
            showToast('success', 'Đã xóa chức vụ');
        }
        deleteTarget = null;
        bootstrap.Modal.getInstance($('#modalConfirm')[0]).hide();
        renderAll();
    });
    GetDepartments()
  
});
// ---------- Render Phòng ban ----------
function renderDept(filter) {
    filter = (filter || '').toLowerCase();
    const rows = departments.filter(d =>
        d.DepartmentName.toLowerCase().includes(filter) || d.DepartmentCode.toLowerCase().includes(filter)
    );
    const $tbody = $('#tblDept').empty();
    $('#countDept').text(departments.length);
    $('#emptyDept').toggleClass('d-none', rows.length > 0);

    rows.forEach(d => {
        const statusLabel = d.Status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động';
        const statusClass = d.Status === 'active' ? 'active' : 'inactive';
        $tbody.append(`
        <tr>
          <td>
            <div class="chip">
              <span class="dot" style="background:${colorFor(d.DepartmentName)}"></span>
              ${escapeHtml(d.DepartmentName)}
            </div>
          </td>
          <td><span class="code-tag">${escapeHtml(d.DepartmentCode)}</span></td>
          <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
          <td class="text-end">
            <div class="btn_body">
                  <button class="btn-ghost-icon btn-edit-dept" data-id="${d.ID}" title="Sửa"><i class="bi bi-pencil"></i></button>
                  <button class="btn-ghost-icon danger btn-del-dept" data-id="${d.ID}" title="Xóa"><i class="bi bi-trash3"></i></button>
            </div>

          </td>
        </tr>
      `);
    });
}

// ---------- Render Chức vụ ----------
function renderPos(filter) {
    filter = (filter || '').toLowerCase();
    const rows = positions.filter(p =>
        p.PositionName.toLowerCase().includes(filter) || p.PositionCode.toLowerCase().includes(filter)
    );
    const $tbody = $('#tblPos').empty();
    $('#countPos').text(positions.length);
    $('#emptyPos').toggleClass('d-none', rows.length > 0);

    rows.forEach(p => {
        $tbody.append(`
        <tr>
          <td>
            <div class="chip">
              <span class="dot" style="background:${colorFor(p.PositionName)}"></span>
              ${escapeHtml(p.PositionName)}
            </div>
          </td>
          <td><span class="code-tag">${escapeHtml(p.PositionCode)}</span></td>
          <td class="text-end">
          <div class="btn_body">
                  <button class="btn-ghost-icon btn-edit-pos" data-id="${p.ID}" title="Sửa"><i class="bi bi-pencil"></i></button>
                 <button class="btn-ghost-icon danger btn-del-pos" data-id="${p.ID}" title="Xóa"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>
      `);
    });
}

function renderAll() {
    renderDept($('#searchDept').val());
    renderPos($('#searchPos').val());
}

async function ApiSave(arrSave, action,route) {
    try {
        const request = new Request(`/api/Dic_PBan_ChucVu/${route}?action=${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(arrSave),
        });
        let response = await fetch(request)
        let data = await response.json()
        if (data == "True")
            return data
    } catch (err) {
        console.error(err)
        showToast("error", "Lưu thất bại")
        return false;
    }

}