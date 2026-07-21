// 1. Danh sách nhóm
let groupList = [];
let userLineList = [];
let moduleList = []
let userModuleList = [];
let DB_LINES = [];
let DB_MODULES = [];
let departments = [];
let positions = [];
let users = [];
let roles = {};
function getUserLines(email) {
    return userLineList
        .filter(x => x.UserId === email)
        .map(x => x.MaLine);
}
function generateGuid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = (c === 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function buildModuleMap(list, keyField, keyValue) {
    const modules = {};

    list
        .filter(x => x[keyField] === keyValue)
        .forEach(m => {
            const permission = [];

            if (m.IsView) permission.push("R");
            if (m.IsEdit) permission.push("U");
            if (m.IsDelete) permission.push("D");

            const moduleInfo = DB_MODULES.find(x => x.MaModule === m.Module);

            if (moduleInfo) {
                modules[moduleInfo.MaModule] = permission;
            }
        });

    return modules;
}

function getUserModuleOverride(email) {
    const modules = buildModuleMap(userModuleList, 'UserId', email);
    return Object.keys(modules).length > 0 ? { modules } : null;
}

function merGroupList() {
    groupList.forEach(group => {
        // Thay đổi ở đây: lọc moduleList theo trường 'GroupId' và giá trị group.GroupId
        const modules = buildModuleMap(moduleList, 'GroupId', group.GroupId);

        // Dùng đúng GroupId (GUID) làm khóa của Nhóm quyền
        roles[group.GroupId] = {
            name: group.GroupName,
            desc: group.Description,
            modules,
            isActive: 0 // 0: Nhóm bình thường | 1: Nhóm đã bị xóa
        };
    });
}
const activeRoleIds = Object.keys(roles).filter(id => roles[id].isActive !== 1);

let state = {
    leftTab: 'roles',
    rightTab: 'modules',
    selectedRoleId: activeRoleIds.length > 0 ? activeRoleIds[0] : null,
    selectedUserId: users.length > 0 ? users[0].Email : null
};

// Trạng thái thu/mở của từng nhóm (group) trong danh sách Tài khoản
let collapsedGroups = {};

function toggleGroupCollapse(groupName) {
    collapsedGroups[groupName] = !collapsedGroups[groupName];
    renderLeftList();
}

// Bootstrap instances helper
let createModalInstance;
let editUserModalInstance;
let changePasswordModalInstance;
let editRoleModalInstance;
async function GetRoleGroup() {
    var url = `/api/ERP_DicUser/Get?action=GetNhomPhanQuyen`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        groupList = data;

        await merGroupList();

        await switchLeftTab('roles');
    } catch (error) {
        console.error(error.message);
    }
}
async function GetTblUser() {
    var url = `/api/ERP_DicUser/Get?action=GetTblUser`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        users = []
        console.log(moduleList)
        data.forEach(item => {
            users.push({
                EmployeeCode: item.EmployeeCode,
                Name: item.FullName,
                Gender: item.Gender,
                Username: item.LoginID,
                Password: item.Password,
                Email: item.Email,
                Role: item.GroupID,
                DepartmentId: item.DepartmentId,
                DepartmentName: item.DepartmentName,
                PositionId: item.PositionId,
                PositionName: item.PositionName,
                Status: item.Status,
                Desc: item.Desc,
                Phone: item.Phone,
                // TRUYỀN BIẾN EMAIL TỪ SQL VÀO ĐÂY:
                Lines: getUserLines(item.Email),
                Override: getUserModuleOverride(item.Email) || (!item.GroupID ? { modules: {} } : null)
            });
        });
        merGroupList()
    } catch (error) {
        console.error(error.message);
    }
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
    } catch (error) {
        console.error(error.message);
    }
}
async function GetLine() {
    var url = `/api/ERP_DicUser/Get?action=GetTenLine`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        DB_LINES = data
    } catch (error) {
        console.error(error.message);
    }
}
async function GetModule() {
    var url = `/api/ERP_DicUser/Get?action=GetTenModule`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        DB_MODULES = data
    } catch (error) {
        console.error(error.message);
    }
}
async function GetGroupModule() {
    var url = `/api/ERP_DicUser/Get?action=GetTenGroupModule`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        moduleList = data
    } catch (error) {
        console.error(error.message);
    }
}
async function GetUserLines() {
    var url = `/api/ERP_DicUser/Get?action=GetPhanQuyenModule`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        userLineList = data
        console.log(userLineList)
    } catch (error) {
        console.error(error.message);
    }
}
async function GetUserModules() {
    var url = `/api/ERP_DicUser/Get?action=GetPhanQuyenModule`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        userModuleList = data
    } catch (error) {
        console.error(error.message);
    }
}
$(document).ready(async function () {
    // Instantiate Bootstrap Modal
    createModalInstance = new bootstrap.Modal(document.getElementById('create-modal'));
    editUserModalInstance = new bootstrap.Modal(document.getElementById('edit-user-modal'));
    changePasswordModalInstance = new bootstrap.Modal(document.getElementById('change-password-modal'));
    editRoleModalInstance = new bootstrap.Modal(document.getElementById('edit-role-modal'));
    await GetUserLines()
    await GetUserModules()
    await GetGroupModule()
    await GetLine()
    await GetModule()
    await GetRoleGroup()
    await GetTblUser()
    await GetDepartments()
    await GetPosition()

    // Handle form submissions
    $('#modal-form').on('submit', handleFormSubmit);
    $('#edit-user-form').on('submit', handleEditUserSubmit);
    $('#change-password-form').on('submit', handleChangePasswordSubmit);
    $('#edit-role-form').on('submit', handleEditRoleSubmit);
});


// Left section tab switcher (NHÓM QUYỀN vs TÀI KHOẢN)
function switchLeftTab(tab) {
    state.leftTab = tab;
    const isRoles = (tab === 'roles');

    // Reset Search Input on tab change
    $('#left-search').val('');

    if (isRoles) {
        // Style Roles Tab Active
        $('#tab-roles-btn').removeClass('btn-link text-muted').addClass('btn-white text-primary shadow-sm');
        $('#tab-users-btn').removeClass('btn-white text-primary shadow-sm').addClass('btn-link text-muted');
        $('#create-btn-text').text("TẠO NHÓM MỚI");

        $('#tab-line-item').hide();

        switchRightTab('modules');
        $("#user-action-buttons").addClass("d-none");

        const activeRoleIds = Object.keys(roles).filter(id => roles[id].isActive !== 1);
        state.selectedRoleId = activeRoleIds.length > 0 ? activeRoleIds[0] : null;
    } else {
        $('#tab-users-btn').removeClass('btn-link text-muted').addClass('btn-white text-primary shadow-sm');
        $('#tab-roles-btn').removeClass('btn-white text-primary shadow-sm').addClass('btn-link text-muted');
        $('#create-btn-text').text("THÊM TÀI KHOẢN");

        $('#tab-line-item').show();

        switchRightTab('lines');
        $("#user-action-buttons").removeClass("d-none");

        state.selectedUserId = users.length > 0 ? users[0].Email : null;
    }

    renderLeftList();
    renderActiveWorkspace();
}

// Right side sub-tab switcher (LINE vs MODULE)
function switchRightTab(tab) {
    // Nếu đang ở Nhóm Quyền thì không cho phép chuyển sang tab Line
    if (state.leftTab === 'roles') {
        tab = 'modules';
    }

    state.rightTab = tab;
    const isLines = (tab === 'lines');

    if (isLines) {
        $('#rtab-lines-btn').addClass('active fw-bold text-primary border-bottom border-primary border-2').removeClass('text-muted');
        $('#rtab-modules-btn').removeClass('active fw-bold text-primary border-bottom border-primary border-2').addClass('text-muted');
        $('#content-lines').show().addClass('show active');
        $('#content-modules').hide().removeClass('show active');
    } else {
        $('#rtab-modules-btn').addClass('active fw-bold text-primary border-bottom border-primary border-2').removeClass('text-muted');
        $('#rtab-lines-btn').removeClass('active fw-bold text-primary border-bottom border-primary border-2').addClass('text-muted');
        $('#content-modules').show().addClass('show active');
        $('#content-lines').hide().removeClass('show active');
    }

    renderActiveWorkspace();
}

// Left List Builder with Filters
function renderLeftList() {
    const $container = $('#left-list-container');
    const searchVal = $('#left-search').val().toLowerCase();
    $container.empty();

    if (state.leftTab === 'roles') {
        Object.keys(roles).forEach(id => {
            const role = roles[id];
            if (role.isActive === 1) return; // Nhóm đã bị xóa -> ẩn khỏi danh sách
            if (role.name.toLowerCase().includes(searchVal) || role.desc.toLowerCase().includes(searchVal)) {
                const isActive = (state.selectedRoleId === id) ? 'list-item-active' : '';
                const element = `
                                            <button onclick="selectRole('${id}')" class="list-group-item list-group-item-action border-0 py-3 px-4 ${isActive}">
                                                <div class="d-flex w-100 justify-content-between align-items-center">
                                                    <h6 class="font-display mb-1 fw-bold text-dark small">${role.name}</h6>
                                                    <span class="badge bg-light text-muted border" style="font-size: 9px;">NHÓM</span>
                                                </div>
                                                <p class="mb-0 text-muted small text-truncate" style="font-size: 11px;">${role.desc}</p>
                                            </button>
                                        `;
                $container.append(element);
            }
        });
    } else {
        const UNASSIGNED_KEY = '__unassigned__';
        const groups = {};

        users.forEach(u => {
            const groupKey = (u.Role && roles[u.Role] && roles[u.Role].isActive !== 1) ? u.Role : UNASSIGNED_KEY;
            const roleName = (groupKey === UNASSIGNED_KEY) ? 'Chưa gán nhóm' : roles[groupKey].name;
            if (u.Name.toLowerCase().includes(searchVal) || u.Email.toLowerCase().includes(searchVal) || roleName.toLowerCase().includes(searchVal)) {
                if (!groups[groupKey]) groups[groupKey] = [];
                groups[groupKey].push(u);
            }
        });

        const orderedGroupKeys = [
            ...Object.keys(roles).filter(id => groups[id] && roles[id].isActive !== 1),
            ...(groups[UNASSIGNED_KEY] ? [UNASSIGNED_KEY] : [])
        ];

        if (orderedGroupKeys.length === 0) {
            $container.append(`
                            <div class="text-center text-muted small py-4">
                                <i class="fa-solid fa-magnifying-glass mb-2 d-block fs-4 opacity-50"></i>
                                Không tìm thấy tài khoản phù hợp.
                            </div>
                        `);
        }

        orderedGroupKeys.forEach(groupKey => {
            const groupUsers = groups[groupKey];
            const isUnassigned = (groupKey === UNASSIGNED_KEY);
            const groupDisplayName = isUnassigned ? 'Chưa gán nhóm' : roles[groupKey].name;
            const isCollapsed = !!collapsedGroups[groupKey];

            $container.append(`
                            <div onclick="toggleGroupCollapse('${groupKey}')" class="px-4 pt-3 pb-2 bg-light border-bottom d-flex align-items-center justify-content-between" style="cursor: pointer; user-select: none;">
                                <span class="font-display fw-bold text-uppercase ${isUnassigned ? 'text-warning-emphasis' : 'text-primary'}" style="font-size: 10.5px; letter-spacing: .04em;">
                                    <i class="fa-solid fa-chevron-right me-2 text-muted" style="font-size: 9px; display:inline-block; width:9px; transition: transform .15s ease; transform: rotate(${isCollapsed ? '0' : '90'}deg);"></i>
                                    <i class="fa-solid ${isUnassigned ? 'fa-triangle-exclamation' : 'fa-shield-halved'} me-1"></i>${groupDisplayName}
                                </span>
                                <span class="badge bg-white text-muted border" style="font-size: 9px;">${groupUsers.length}</span>
                            </div>
                        `);

            if (!isCollapsed) {
                groupUsers.forEach(u => {
                    const isActive = (state.selectedUserId === u.Email) ? 'list-item-active' : '';
                    const statusDot = (u.Status === 'Active') ? 'bg-success' : 'bg-danger';
                    const isOverridden = u.Override ? '<span class="badge bg-warning-subtle text-warning border small ms-1" style="font-size: 8px;">Override</span>' : '';

                    const element = `
                                                <button onclick="selectUser('${u.Email}')" class="list-group-item list-group-item-action border-0 py-3 px-4 ${isActive}">
                                                    <div class="d-flex w-100 justify-content-between align-items-center">
                                                        <h6 class="font-display mb-1 fw-bold text-dark small">${u.Name} </h6>
                                                        <span class="d-inline-block rounded-circle ${statusDot}" style="width: 8px; height: 8px;"></span>
                                                    </div>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <p class="mb-0 text-muted small font-mono" style="font-size: 10.5px;">${u.Email}</p>
                                                    </div>
                                                </button>
                                            `;
                    $container.append(element);
                });
            }
        });
    }
}

// Active permission Workspace Builder
function renderActiveWorkspace() {
    const isUser = (state.leftTab === 'users');
    const data = isUser
        ? users.find(u => u.Email === state.selectedUserId)
        : roles[state.selectedRoleId];

    if (isUser && data) {
        $('#role-action-buttons').addClass('d-none');
    } else if (!isUser && data) {
        $('#role-action-buttons').removeClass('d-none');
    } else {
        $('#role-action-buttons').addClass('d-none');
    }

    if (!data) return;

    if (isUser) {
        // Header
        $('#obj-avatar')
            .text(data.Name.charAt(0))
            .removeClass('bg-primary-subtle text-primary')
            .addClass('bg-success-subtle text-success');

        $('#obj-name').text(`${data.EmployeeCode} - ${data.Name}`);

        $('#obj-type')
            .text("")
            .removeClass('bg-primary-subtle text-primary')
            .addClass('bg-success-subtle text-success');

        // Hiển thị thông tin User
        $('#obj-role-desc').hide();
        $('#obj-user-info').show();
        $('#info-employee-code').text(data.EmployeeCode);
        $('#info-username').text(data.Username);
        $('#info-email').text(data.Email);
        $('#info-gender').text(data.Gender == 0 ? "Nam" : data.Gender == 1 ? "Nữ" : "Khác");
        $('#info-department').text(data.DepartmentName);
        $('#info-position').text(data.PositionName);
        $('#info-role').text((data.Role && roles[data.Role]) ? roles[data.Role].name : 'Chưa gán nhóm');
        $('#info-status').text(data.Status);

        const hasRole = !!(data.Role && roles[data.Role] && roles[data.Role].isActive !== 1);
        const hasOverride = !!data.Override || !hasRole;

        if (!data.Override && !hasRole) {
            data.Override = { modules: {} };
        }

        if (state.rightTab === 'modules') {
            $('#user-override-panel').hide();
        } else {
            $('#user-override-panel').hide();
        }
        $('#override-toggle').prop('checked', hasOverride);

        if (!hasRole) {
            $('#override-toggle').prop('disabled', true);
            $('#override-panel-title').text("TÀI KHOẢN KHÔNG CÓ NHÓM QUYỀN - CẤU HÌNH MODULE RIÊNG");
            $('#override-panel-desc').html('Tài khoản này chưa được gán <strong>Nhóm quyền</strong> nên không có gì để kế thừa. Quyền <strong>Module</strong> bên dưới được cấu hình trực tiếp, riêng biệt cho tài khoản này.');
        } else {
            $('#override-toggle').prop('disabled', false);
            $('#override-panel-title').html('CHẾ ĐỘ PHÂN QUYỀN MODULE ĐẶC THÙ<br>(GHI ĐÈ)');
            $('#override-panel-desc').html('Kích hoạt chế độ này để tùy chỉnh quyền <strong>Module</strong> trực tiếp cho tài khoản mà không kế thừa từ nhóm. Quyền truy cập <strong>Line</strong> luôn được cấu hình riêng theo từng tài khoản, không phụ thuộc vào công tắc này.');
        }

        const activeModules = hasOverride
            ? (data.Override ? data.Override.modules : {})
            : roles[data.Role].modules;
        const isModuleEditable = hasOverride;

        toggleLineControlsState(true);
        toggleModuleControlsState(isModuleEditable);

        renderLines(data.Lines, true);
        renderModules(activeModules, isModuleEditable);

    }
    else {
        // Header
        $('#obj-avatar')
            .text(data.name.charAt(0))
            .removeClass('bg-success-subtle text-success')
            .addClass('bg-primary-subtle text-primary');

        $('#obj-name').text(data.name);

        $('#obj-type')
            .text("Nhóm Phân Quyền")
            .removeClass('bg-success-subtle text-success')
            .addClass('bg-primary-subtle text-primary');

        $('#obj-user-info').hide();
        $('#obj-role-desc').show();

        $('#obj-role-desc').text(data.desc);

        $('#user-override-panel').hide();

        toggleModuleControlsState(true);

        renderModules(data.modules, true);

        $('#content-lines').hide().removeClass('show active');
        $('#content-modules').show().addClass('show active');
    }
}

// Toggle state of Line buttons
function toggleLineControlsState(isEditable) {
    if (isEditable) {
        $('#line-select-all, #line-deselect-all').prop('disabled', false).removeClass('disabled');
    } else {
        $('#line-select-all, #line-deselect-all').prop('disabled', true).addClass('disabled');
    }
}

// Toggle state of Module action buttons
function toggleModuleControlsState(isEditable) {
    if (isEditable) {
        $('#module-select-all, #module-select-read, #module-deselect-all').prop('disabled', false).removeClass('disabled');
    } else {
        $('#module-select-all, #module-select-read, #module-deselect-all').prop('disabled', true).addClass('disabled');
    }
}

function renderLines(selectedLines, isEditable) {
    const $container = $('#lines-grid-container');
    $container.empty();

    DB_LINES.forEach(line => {
        const isChecked = selectedLines.includes(line.MaLine) ? 'checked' : '';
        const isDisabled = !isEditable ? 'disabled' : '';

        const card = `
                        <div class="col">
                            <div class="card bg-white border h-100 p-3 shadow-sm d-flex align-items-center justify-content-between flex-row">
                                <div class="form-check m-0">
                                    <input
                                        type="checkbox"
                                        id="line-${line.MaLine}"
                                        ${isChecked}
                                        ${isDisabled}
                                        onchange="updateLinePermission('${line.MaLine}', this.checked)"
                                        class="form-check-input border-primary"
                                        style="transform: scale(1.15); cursor: pointer;">

                                    <label
                                        class="font-display form-check-label fw-bold small text-dark ms-2"
                                        for="line-${line.MaLine}"
                                        style="cursor: pointer;">
                                        ${line.TenLine}
                                    </label>
                                </div>

                                <div class="text-secondary opacity-50">
                                    <i class="fa-solid fa-industry"></i>
                                </div>
                            </div>
                        </div>
                    `;

        $container.append(card);
    });
}

// Render Module CRUD table
function renderModules(selectedModules, isEditable) {
    const $tbody = $('#module-matrix-body');
    $tbody.empty();

    DB_MODULES.forEach(module => {
        const actions = selectedModules[module.MaModule] || [];
        const isDisabled = !isEditable ? 'disabled' : '';

        const readCheck = actions.includes('R') ? 'checked' : '';
        const updateCheck = actions.includes('U') ? 'checked' : '';
        const deleteCheck = actions.includes('D') ? 'checked' : '';
        const isFull = actions.length === 3 ? 'checked' : '';

        const row = `
                        <tr>
                            <td class="font-display py-3 px-4 fw-bold text-dark small">
                                <i class="fa-solid fa-cube text-primary opacity-75 me-2"></i>
                                ${module.TenModule}
                            </td>

                            <td class="text-center">
                                <input type="checkbox"
                                    ${readCheck}
                                    ${isDisabled}
                                    onchange="updateModuleAction('${module.MaModule}','R',this.checked)"
                                    class="form-check-input border-primary"
                                    style="transform: scale(1.1); cursor:pointer;">
                            </td>
                            <td class="text-center">
                                <input type="checkbox"
                                    ${updateCheck}
                                    ${isDisabled}
                                    onchange="updateModuleAction('${module.MaModule}','U',this.checked)"
                                    class="form-check-input border-primary"
                                    style="transform: scale(1.1); cursor:pointer;">
                            </td>

                            <td class="text-center">
                                <input type="checkbox"
                                    ${deleteCheck}
                                    ${isDisabled}
                                    onchange="updateModuleAction('${module.MaModule}','D',this.checked)"
                                    class="form-check-input border-primary"
                                    style="transform: scale(1.1); cursor:pointer;">
                            </td>

                            <td class="text-center bg-light-subtle">
                                <input type="checkbox"
                                    ${isFull}
                                    ${isDisabled}
                                    onchange="toggleModuleFull('${module.MaModule}',this.checked)"
                                    class="form-check-input border-primary"
                                    style="transform: scale(1.15); cursor:pointer;">
                            </td>
                        </tr>
                    `;

        $tbody.append(row);
    });
}

// Selection trigger handlers
function selectRole(r) {
    state.selectedRoleId = r;
    renderActiveWorkspace();
    renderLeftList();
}

function selectUser(email) {
    state.selectedUserId = email;
    renderActiveWorkspace();
    renderLeftList();
}

// Line modifications helper
// Line modifications helper
async function updateLinePermission(line, checked) {
    let target = getTargetLines();
    if (checked) {
        if (!target.Lines.includes(line)) target.Lines.push(line);
    } else {
        target.Lines = target.Lines.filter(l => l !== line);
    }

    let arrSave = target.Lines.map(maLine => ({
        UserID: target.Email,
        Module: maLine,
        IsView: 1,
        IsEdit: 1,
        IsDelete: 1,
    }));
    if (arrSave.length == 0) {
        arrSave = [{
            UserID: target.Email,
            Module: "",
            IsView: 1,
            IsEdit: 1,
            IsDelete: 1,
        }];
    }
    const checkSave = await ApiSave(arrSave, 'UpdatePhanQuyenLine', 'PostPQ')
    if (checkSave != "True") return
    showToast("Lưu phân quyền thành công!");
    renderActiveWorkspace();
}

async function quickSelectLines(selectAll) {
    let target = getTargetLines();
    if (selectAll) {
        target.Lines = DB_LINES.map(x => x.MaLine);
    } else {
        target.Lines = [];
    }

    var arrSave = target.Lines.map(maLine => ({
        UserID: target.Email,
        Module: maLine,
        IsView: 1,
        IsEdit: 1,
        IsDelete: 1,
    }));
    if (arrSave.length == 0) {
        arrSave = [{
            UserID: target.Email,
            Module: "",
            IsView: 1,
            IsEdit: 1,
            IsDelete: 1,
        }];
    }
    const checkSave = await ApiSave(arrSave, 'UpdatePhanQuyenLine', 'PostPQ')
    if (checkSave != "True") return

    showToast(selectAll ? "Đã chọn tất cả các Line khả dụng!" : "Đã bỏ chọn toàn bộ Line!");
    renderActiveWorkspace();
}

// Module modifications helper
async function updateModuleAction(mod, act, checked) {
    // 1. Kiểm tra nếu đang ở tab Tài khoản (users)
    if (state.leftTab === 'users') {
        const currentUser = users.find(u => u.Email === state.selectedUserId);

        // Nếu user có Role và CHƯA BẬT chế độ ghi đè (Override) thì chặn lại
        if (currentUser && currentUser.Role) {
            showToast(`Tài khoản này đang thuộc nhóm quyền, không được tự ý chỉnh sửa module!`, true);

            // Render lại workspace để hoàn tác (reset) trạng thái ô checkbox vừa click trên giao diện
            renderActiveWorkspace();
            return false;
        }
    }

    // 2. Logic xử lý cũ nếu hợp lệ
    let target = getTargetModules();
    if (!target.modules[mod]) target.modules[mod] = [];

    if (checked) {
        if (!target.modules[mod].includes(act)) target.modules[mod].push(act);
    } else {
        target.modules[mod] = target.modules[mod].filter(a => a !== act);
    }
    if (state.leftTab === 'users') {
        // Log dung theo cau truc userModuleList, lay dung user dang chon
        const currentUserId = state.selectedUserId;
        const arrSaveUser = DB_MODULES.map(module => {
            const actions = target.modules[module.MaModule] || [];
            return {
                UserID: currentUserId,
                Module: module.MaModule,
                IsView: actions.includes('R') ? 1 : 0,
                IsEdit: actions.includes('U') ? 1 : 0,
                IsDelete: actions.includes('D') ? 1 : 0
            };
        });
        const checkSave = await ApiSave(arrSaveUser, 'UpdatePhanQuyenModule', 'PostPQ')
        if (checkSave != "True") return
        showToast(`Lưu phân quyền thành công!`);

    } else {
        // Log dung theo cau truc moduleList (theo Nhom quyen), lay dung nhom dang chon
        const currentRoleId = state.selectedRoleId;
        const arrSave = Object.keys(target.modules).map(moduleKey => {
            const actions = target.modules[moduleKey] || [];
            return {
                GroupID: currentRoleId,
                ModuleQTY: moduleKey,
                IsView: actions.includes('R') ? 1 : 0,
                IsEdit: actions.includes('U') ? 1 : 0,
                IsDelete: actions.includes('D') ? 1 : 0
            };
        });
        console.log('moduleList (moi):', arrSave);

        const checkSave = await ApiSave(arrSave, 'PostGroupModule', 'PostGroupModule')
        if (checkSave != "True") return
        showToast(`Lưu phân quyền thành công!`);
    }

    renderActiveWorkspace();
}

// Row full checkbox trigger
// Row full checkbox trigger
async function toggleModuleFull(mod, checked) {
    let target = getTargetModules();
    target.modules[mod] = checked ? ["R", "U", "D"] : [];

    if (state.leftTab === 'users') {
        // Lưu theo cấu trúc userModuleList, lấy TẤT CẢ module
        const currentUserId = state.selectedUserId;
        const arrSaveUser = DB_MODULES.map(module => {
            const actions = target.modules[module.MaModule] || [];
            return {
                UserID: currentUserId,
                Module: module.MaModule,
                IsView: actions.includes('R') ? 1 : 0,
                IsEdit: actions.includes('U') ? 1 : 0,
                IsDelete: actions.includes('D') ? 1 : 0
            };
        });

        const checkSave = await ApiSave(arrSaveUser, 'UpdatePhanQuyenModule', 'PostPQ')
        if (checkSave != "True") return
        showToast(`Lưu phân quyền thành công!`);
    } else {
        // Lưu theo cấu trúc moduleList (theo Nhóm quyền), lấy TẤT CẢ module
        const currentRoleId = state.selectedRoleId;
        const arrSave = DB_MODULES.map(module => {
            const actions = target.modules[module.MaModule] || [];
            return {
                GroupID: currentRoleId,
                ModuleQTY: module.MaModule,
                IsView: actions.includes('R') ? 1 : 0,
                IsEdit: actions.includes('U') ? 1 : 0,
                IsDelete: actions.includes('D') ? 1 : 0
            };
        });
        console.log(arrSave)

        const checkSave = await ApiSave(arrSave, 'PostGroupModule', 'PostGroupModule')
        if (checkSave != "True") return
        showToast(`Lưu phân quyền thành công!`);
    }

    renderActiveWorkspace();
}
function getTargetLines() {
    return users.find(u => u.Email === state.selectedUserId);
}

function getTargetModules() {
    if (state.leftTab === 'roles') return roles[state.selectedRoleId];

    const user = users.find(u => u.Email === state.selectedUserId);
    if (!user.Override) {
        if (user.Role && roles[user.Role] && roles[user.Role].isActive !== 1) {
            user.Override = { modules: JSON.parse(JSON.stringify(roles[user.Role].modules)) };
        } else {
            user.Override = { modules: {} };
        }
    }
    return user.Override;
}

// Handle override state switch (chỉ áp dụng cho Module)
function toggleOverride(checked) {
    const user = users.find(u => u.Email === state.selectedUserId);

    if (!user.Role || !roles[user.Role] || roles[user.Role].isActive === 1) {
        if (!user.Override) user.Override = { modules: {} };
        showToast(`Tài khoản "${user.Name}" chưa có Nhóm quyền nên luôn cấu hình Module riêng!`, true);
        renderActiveWorkspace();
        renderLeftList();
        return;
    }

    if (checked) {
        user.Override = { modules: JSON.parse(JSON.stringify(roles[user.Role].modules)) };
        showToast(`Đã kích hoạt chế độ ghi đè Module thành công cho ${user.Name}!`);
    } else {
        user.Override = null;
        showToast(`Đã hủy chế độ ghi đè, Module quay về kế thừa quyền nhóm ${roles[user.Role] ? roles[user.Role].name : ''}!`);
    }
    renderActiveWorkspace();
    renderLeftList();
}

// Create Modal Trigger
function handleCreateBtn() {
    const isRoles = (state.leftTab === 'roles');

    $('#modal-form')[0].reset();

    if (isRoles) {
        $('#modal-title').text("TẠO NHÓM MỚI");
        $('#m-name-label').text("Tên Nhóm Phân Quyền");
        $('#user-fields').hide();
        $('#username-field').hide();
        $('#password-field').hide();
        $('#confirm-password-field').hide();
        $('#role-select-field').hide();
        $('#phongban-select-field').hide();
        $('#chucvu-select-field').hide();

        $('#employee-code-field').hide();
        $('#phone-code-field').hide();
        $('#gender-field').hide();

        $('#m-email').prop('required', false);
    } else {
        $('#modal-title').text("THÊM TÀI KHOẢN MỚI");
        $('#m-name-label').text("Tên Hiển Thị (Họ & Tên)");
        $('#user-fields').show();
        $('#m-email').prop('required', true);

        const $rSelect = $('#m-role');
        $rSelect.empty();
        $rSelect.append(`<option value="">-- Không có (Cấu hình Module riêng) --</option>`);

        Object.keys(roles).forEach(id => {
            if (roles[id].isActive === 1) return;
            $rSelect.append(`<option value="${id}">${roles[id].name}</option>`);
        });

        const $department = $('#m-phongban');
        $department.empty();

        departments.forEach(d => {
            $department.append(`
                                <option value="${d.ID}">
                                    ${d.DepartmentName}
                                </option>
                            `);
        });

        const $position = $('#m-chucvu');
        $position.empty();

        positions.forEach(p => {
            $position.append(`
                                <option value="${p.ID}">
                                    ${p.PositionName}
                                </option>
                                `);
        });

        $('#user-fields').show();
        $('#username-field').show();
        $('#password-field').show();
        $('#confirm-password-field').show();
        $('#role-select-field').show();
        $('#phongban-select-field').show();
        $('#chucvu-select-field').show();
        $('#employee-code-field').show();
        $('#phone-code-field').show();
        $('#gender-field').show();
    }

    createModalInstance.show();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const name = $('#m-name').val().trim();
    const desc = $('#m-desc').val().trim();

    if (state.leftTab === 'roles') {
        const isDuplicateName = Object.values(roles).some(r => r.isActive !== 1 && r.name.toLowerCase() === name.toLowerCase());
        if (isDuplicateName) {
            showToast("Tên nhóm này đã tồn tại trên hệ thống!", true);
            return;
        }

        const groupId = generateGuid();

        roles[groupId] = {
            name: name,
            desc: desc || "Không có mô tả.",
            modules: {},
            isActive: 0
        };
        const save = [{
            GroupID: groupId,
            GroupName: name,
            Description: desc,
            IsActive: 0,
        }];
        const checkSave = await ApiSave(save, 'PostRoleGroup', 'PostRoleGroup')
        if (checkSave != "True") return

        state.selectedRoleId = groupId;

        showToast(`Đã khởi tạo thành công nhóm "${name}"!`);
    }
    else {
        const email = $('#m-email').val().trim();
        const username = $('#m-username').val().trim();
        const password = $('#m-password').val().trim();
        const confirmPassword = $('#m-confirm-password').val().trim();
        const role = $('#m-role').val();
        const employeeCode = $('#m-employee-code').val().trim();
        const phoneCode = $('#m-phone-code').val().trim();
        const gender = $('#m-gender').val();
        const departmentId = $('#m-phongban').val();
        const positionId = $('#m-chucvu').val();

        const department = departments.find(x => x.ID == departmentId);
        const position = positions.find(x => x.ID == positionId);

        if (!name) { showToast("Vui lòng nhập họ và tên!", true); $('#m-name').focus(); return; }
        if (!email) { showToast("Vui lòng nhập Email!", true); $('#m-email').focus(); return; }
        if (!employeeCode) { showToast("Vui lòng nhập Mã nhân viên!", true); $('#m-employee-code').focus(); return; }
        if (!gender) { showToast("Vui lòng chọn Giới tính!", true); $('#m-gender').focus(); return; }
        if (!username) { showToast("Vui lòng nhập Username!", true); $('#m-username').focus(); return; }
        if (!password) { showToast("Vui lòng nhập Password!", true); $('#m-password').focus(); return; }
        if (!confirmPassword) { showToast("Vui lòng nhập Xác nhận Password!", true); $('#m-confirm-password').focus(); return; }

        if (password !== confirmPassword) {
            showToast("Password và Xác nhận Password không khớp!", true);
            $('#m-confirm-password').focus();
            return;
        }

        if (!departmentId || departmentId == "") { showToast("Vui lòng chọn Phòng ban!", true); $('#m-phongban').focus(); return; }
        if (!positionId || positionId == "") { showToast("Vui lòng chọn Chức vụ!", true); $('#m-chucvu').focus(); return; }

        if (users.some(x => x.Email === email)) { showToast("Email đã tồn tại!", true); return; }
        if (users.some(x => x.Username === username)) { showToast("Username đã tồn tại!", true); return; }


        const save = [{
            EmployeeCode: employeeCode,
            Gender: gender,
            Email: email,
            LoginID: username,
            Password: password,
            FullName: name,
            Phone: phoneCode,
            Role: "",
            DepartmentId: departmentId,
            PositionId: positionId,
            GroupID: role,
            Status: 0,
            Desc: desc,
        }];
        const checkSave = await ApiSave(save, 'PostTblUser', 'PostUser')
        if (checkSave != "True") return

        users.push({
            EmployeeCode: employeeCode,
            Gender: gender,
            Email: email,
            Username: username,
            Password: password,
            Name: name,
            Phone: phoneCode,
            Role: role,
            DepartmentId: departmentId,
            DepartmentName: department?.DepartmentName || "",
            PositionId: positionId,
            PositionName: position?.PositionName || "",
            Status: "Active",
            Desc: desc,
            Lines: [],
            Override: getUserModuleOverride(email) || (!role ? { modules: {} } : null)
        });
        state.selectedUserId = email;
        showToast(`Đã thêm thành công tài khoản "${name}"!`);
    }

    renderLeftList();
    renderActiveWorkspace();
    createModalInstance.hide();
}
function saveChanges() {
    showToast("Mọi thay đổi cấu hình bảo mật đã được ghi nhận trên cơ sở dữ liệu!");
}

function openEditUserModal() {
    const user = users.find(u => u.Email === state.selectedUserId);
    if (!user) return;

    const $rSelect = $('#eu-role');
    $rSelect.empty();
    $rSelect.append(`<option value="">-- Không có (Cấu hình Module riêng) --</option>`);
    Object.keys(roles).forEach(id => {
        if (roles[id].isActive === 1) return;
        $rSelect.append(`<option value="${id}">${roles[id].name}</option>`);
    });

    const $department = $('#eu-phongban');
    $department.empty();
    departments.forEach(d => {
        $department.append(`<option value="${d.ID}">${d.DepartmentName}</option>`);
    });

    const $position = $('#eu-chucvu');
    $position.empty();
    positions.forEach(p => {
        $position.append(`<option value="${p.ID}">${p.PositionName}</option>`);
    });

    $('#eu-name').val(user.Name);
    $('#eu-phone-code').val(user.Phone);
    $('#eu-email').val(user.Email);
    $('#eu-employee-code').val(user.EmployeeCode);
    $('#eu-gender').val(user.Gender);
    $('#eu-username').val(user.Username);
    $('#eu-role').val(user.Role || "");
    $('#eu-phongban').val(user.DepartmentId);
    $('#eu-chucvu').val(user.PositionId);
    $('#eu-desc').val(user.Desc);

    editUserModalInstance.show();
}

async function handleEditUserSubmit(e) {
    e.preventDefault();

    const originalEmail = state.selectedUserId;
    const user = users.find(u => u.Email === originalEmail);
    if (!user) return;

    const name = $('#eu-name').val().trim();
    const userName = $('#eu-username').val().trim();
    const email = $('#eu-email').val().trim();
    const employeeCode = $('#eu-employee-code').val().trim();
    const phoneCode = $('#eu-phone-code').val().trim();
    const gender = $('#eu-gender').val();
    const role = $('#eu-role').val();
    const departmentId = $('#eu-phongban').val();
    const positionId = $('#eu-chucvu').val();
    const desc = $('#eu-desc').val().trim();

    if (!name) { showToast("Vui lòng nhập họ và tên!", true); $('#eu-name').focus(); return; }
    if (!email) { showToast("Vui lòng nhập Email!", true); $('#eu-email').focus(); return; }
    if (!employeeCode) { showToast("Vui lòng nhập Mã nhân viên!", true); $('#eu-employee-code').focus(); return; }
    if (!gender) { showToast("Vui lòng chọn Giới tính!", true); $('#eu-gender').focus(); return; }
    if (!departmentId || isNaN(departmentId)) { showToast("Vui lòng chọn Phòng ban!", true); $('#eu-phongban').focus(); return; }
    if (!positionId || isNaN(positionId)) { showToast("Vui lòng chọn Chức vụ!", true); $('#eu-chucvu').focus(); return; }

    if (users.some(x => x.Email === email && x.Email !== originalEmail)) {
        showToast("Email này đã được sử dụng bởi tài khoản khác!", true);
        return;
    }

    const department = departments.find(x => x.ID === departmentId);
    const position = positions.find(x => x.ID === positionId);

    const hadRole = !!user.Role;

    const save = [{
        EmployeeCode: employeeCode,
        Gender: gender,
        Email: email,
        LoginID: userName,
        Password: "",
        FullName: name,
        Phone: phoneCode,
        Role: "",
        DepartmentId: departmentId,
        PositionId: positionId,
        GroupID: role,
        Status: 0,
        Desc: desc,
    }];
    const checkSave = await ApiSave(save, 'PostTblUser', 'PostUser')
    if (checkSave != "True") return


    user.Name = name;
    user.Email = email;
    user.EmployeeCode = employeeCode;
    user.Gender = gender;
    user.Role = role;
    user.Phone = phoneCode;
    user.DepartmentId = departmentId;
    user.DepartmentName = department?.DepartmentName || "";
    user.PositionId = positionId;
    user.PositionName = position?.PositionName || "";
    user.Desc = desc;

    if (!role && hadRole && !user.Override) {
        user.Override = { modules: {} };
    }
    if (!role && !user.Override) {
        user.Override = { modules: {} };
    } else {
        user.Override = null;
    }

    state.selectedUserId = email;
    showToast(`Đã cập nhật thông tin tài khoản "${name}"!`);
    renderLeftList();
    renderActiveWorkspace();
    editUserModalInstance.hide();
}

function openEditRoleModal() {
    const roleId = state.selectedRoleId;
    const role = roles[roleId];
    if (!role) return;

    $('#er-id').val(roleId);
    $('#er-name').val(role.name);
    $('#er-desc').val(role.desc);

    editRoleModalInstance.show();
}

// Quick module actions helper (ALL / READ-ONLY / NONE)
async function quickSelectModules(mode) {
    let target = getTargetModules();

    // 1. Cập nhật quyền cho đối tượng đích (Role hoặc User cụ thể) - trên bộ nhớ
    DB_MODULES.forEach(module => {
        if (mode === 'all') {
            target.modules[module.MaModule] = ["R", "U", "D"];
        }
        else if (mode === 'read-only') {
            target.modules[module.MaModule] = ["R"];
        }
        else {
            target.modules[module.MaModule] = [];
        }
    });

    const isRoleContext = (state.leftTab === 'roles');
    let affectedUsersMessage = "";

    if (isRoleContext) {
        const currentRoleId = state.selectedRoleId;

        // 2. Build danh sách quyền Module mới nhất của Nhóm quyền này (theo GroupId + IsView/IsCreate/IsEdit/IsDelete)
        const modulePermissionSave = DB_MODULES.map(module => {
            const actions = target.modules[module.MaModule] || [];
            return {
                GroupId: currentRoleId,
                Module: module.MaModule,
                IsView: actions.includes('R') ? 1 : 0,
                IsCreate: actions.includes('C') ? 1 : 0,
                IsEdit: actions.includes('U') ? 1 : 0,
                IsDelete: actions.includes('D') ? 1 : 0
            };
        });

        // 2.1. Đồng bộ lại vào moduleList: đã có thì UPDATE tại chỗ, chưa có thì ADD mới -> không gọi API
        modulePermissionSave.forEach(row => {
            const existing = moduleList.find(m => m.GroupId === row.GroupId && m.Module === row.Module);
            if (existing) {
                existing.IsView = row.IsView;
                existing.IsCreate = row.IsCreate;
                existing.IsEdit = row.IsEdit;
                existing.IsDelete = row.IsDelete;
            } else {
                moduleList.push(row);
            }
        });
        const dataModule = moduleList.filter(x => x.GroupId == currentRoleId)
        const arrSave = dataModule.map(x => ({
            GroupID: x.GroupId,
            ModuleQTY: x.Module,
            IsView: x.IsView,
            IsEdit: x.IsEdit,
            IsDelete: x.IsDelete
        }));
        const checkSave = await ApiSave(arrSave, 'PostGroupModule', 'PostGroupModule')
        if (checkSave != "True") return

        // 3. Lọc ra danh sách tài khoản đang thuộc Nhóm quyền này để đồng bộ hiển thị
        const usersInGroup = users.filter(u => u.Role === currentRoleId);
        if (usersInGroup.length > 0) {
            const userNames = usersInGroup.map(u => u.Username || u.Name).join(", ");
            affectedUsersMessage = ` (Áp dụng cho các tài khoản: ${userNames})`;
            usersInGroup.forEach(u => {
                u.Override = null;
            });
        }
    }
    else {
        // 2b. Build danh sách quyền Module mới nhất cho USER đang chọn (theo UserID)
        const currentUserId = state.selectedUserId;
        const arrSaveUser = DB_MODULES.map(module => {
            const actions = target.modules[module.MaModule] || [];
            return {
                UserID: currentUserId,
                Module: module.MaModule,
                IsView: actions.includes('R') ? 1 : 0,
                IsEdit: actions.includes('U') ? 1 : 0,
                IsDelete: actions.includes('D') ? 1 : 0
            };
        });
        const checkSave = await ApiSave(arrSaveUser, 'UpdatePhanQuyenModule', 'PostPQ')
        if (checkSave != "True") return
    }
    // 4. Hiển thị thông báo Toast thông minh
    if (mode === 'all') {
        showToast(`Đã bật toàn bộ các quyền của Modules!${affectedUsersMessage}`);
    }
    else if (mode === 'read-only') {
        showToast(`Đã chuyển đổi toàn bộ Modules về chế độ Đọc!${affectedUsersMessage}`);
    }
    else {
        showToast(`Đã thu hồi toàn bộ quyền của Modules!${affectedUsersMessage}`);
    }

    // 5. Render lại giao diện
    renderActiveWorkspace();
    renderLeftList();
}
function showDeleteRoleModal(message, onConfirm) {

    $("#deleteRoleModalMessage").html(message);

    $("#deleteRoleModalConfirmBtn")
        .off("click")
        .on("click", async function () {

            if (typeof onConfirm === "function") {
                const result = await onConfirm();

                if (result === false) {
                    return;
                }
            }

            $("#deleteRoleModal").modal("hide");
        });

    $("#deleteRoleModal").modal("show");
}
function handleDeleteRole() {
    const roleId = state.selectedRoleId;
    const role = roles[roleId];
    if (!role) return;

    showDeleteRoleModal(
        `Bạn có chắc chắn muốn xóa <b>Nhóm quyền "${role.name}"</b>?<br><br>
        Các tài khoản đang thuộc nhóm này sẽ được chuyển về trạng thái <b>"Chưa gán nhóm"</b>.<br>
        <span class="text-danger">Hành động này không thể hoàn tác.</span>`,
        async function () {
            var url = `/api/ERP_DicUser/Get?action=DeleteRoleGroup&para1=${encodeURIComponent(roleId)}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                var data = await response.json();
                role.isActive = 1;
                let affectedCount = 0;
                users.forEach(u => {
                    if (u.Role === roleId) {
                        u.Role = "";
                        affectedCount++;
                    }
                });
                const remainingRoleId = Object.keys(roles).find(id => roles[id].isActive !== 1);
                state.selectedRoleId = remainingRoleId || null;

                renderLeftList();
                renderActiveWorkspace();

                showToast(
                    affectedCount > 0
                        ? `Đã xóa Nhóm quyền "${role.name}" và chuyển ${affectedCount} tài khoản về "Chưa gán nhóm"!`
                        : `Đã xóa Nhóm quyền "${role.name}"!`
                );

                return true;
            } catch (error) {
                console.error(error.message);
            }
            
        }
    );
}

// ================== ĐỔI MẬT KHẨU ==================
function openChangePasswordModal() {
    const user = users.find(u => u.Email === state.selectedUserId);
    if (!user) return;

    $('#change-password-form')[0].reset();
    $('#cp-modal-title').text(`ĐỔI MẬT KHẨU - ${user.Name}`);

    changePasswordModalInstance.show();
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();

    const user = users.find(u => u.Email === state.selectedUserId);
    if (!user) return;

    const newPassword = $('#cp-new-password').val().trim();
    const confirmPassword = $('#cp-confirm-password').val().trim();

    if (!newPassword) { showToast("Vui lòng nhập mật khẩu mới!", true); $('#cp-new-password').focus(); return; }
    if (!confirmPassword) { showToast("Vui lòng nhập xác nhận mật khẩu mới!", true); $('#cp-confirm-password').focus(); return; }
    if (newPassword !== confirmPassword) {
        showToast("Mật khẩu mới và Xác nhận mật khẩu không khớp!", true);
        $('#cp-confirm-password').focus();
        return;
    }

    user.Password = newPassword;


    var url = `/api/ERP_DicUser/GetUserName?action=UpdatePassWord&para1=${encodeURIComponent(user.Email)}&para2=${encodeURIComponent(user.Password)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        showToast(`Đã đổi mật khẩu thành công cho tài khoản "${user.Name}"!`);
        changePasswordModalInstance.hide();
    } catch (error) {
        console.error(error.message);
    }



}

// ================== XÓA TÀI KHOẢN ==================
function handleDeleteUser() {

    const user = users.find(u => u.Email === state.selectedUserId);
    if (!user) return;

    showConfirmDeleteModal(
        `Bạn có chắc chắn muốn xóa tài khoản <b>${user.Name}</b> (${user.Email})?<br>Hành động này không thể hoàn tác.`,
        async function () {

            var url = `/api/ERP_DicUser/Get?action=DeleteUser&para1=${encodeURIComponent(user.Email)}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                var data = await response.json();
                showToast(`Đã xóa tài khoản "${user.Name}" khỏi hệ thống!`);

                users = users.filter(u => u.Email !== user.Email);
                state.selectedUserId = users.length > 0 ? users[0].Email : null;

                renderLeftList();
                renderActiveWorkspace();

                return true;
            } catch (error) {
                console.error(error.message);
            }


        }
    );
}
function showConfirmDeleteModal(message, onConfirm) {

    $("#confirmDeleteMessage").html(message);

    $("#btnConfirmDelete")
        .off("click")
        .on("click", async function () {

            if (typeof onConfirm === "function") {
                const result = await onConfirm();

                if (result === false) {
                    return; // Không đóng modal
                }
            }

            $("#confirmDeleteModal").modal("hide");
        });

    $("#confirmDeleteModal").modal("show");
}
// Custom Dynamic Toast Popup
function showToast(msg, isError = false) {
    const $toast = $('#toast');
    const $icon = $('#toast-icon');
    $('#toast-message').text(msg);

    if (isError) {
        $icon.attr('class', 'fa-solid fa-triangle-exclamation text-danger fs-5');
        $toast.removeClass('bg-dark').addClass('bg-danger text-white');
    } else {
        $icon.attr('class', 'fa-solid fa-circle-check text-success fs-5');
        $toast.removeClass('bg-danger').addClass('bg-dark text-white');
    }

    $toast.fadeIn();
    setTimeout(() => {
        $toast.fadeOut();
    }, 3000);
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}
async function handleEditRoleSubmit(e) {
    e.preventDefault();

    const roleId = $('#er-id').val();
    const name = $('#er-name').val().trim();
    const desc = $('#er-desc').val().trim();

    const role = roles[roleId];
    if (!role) return;

    if (!name) {
        showToast("Vui lòng nhập tên Nhóm quyền!", true);
        $('#er-name').focus();
        return;
    }

    const save = [{
        GroupID: roleId,
        GroupName: name,
        Description: desc,
        IsActive: role.isActive,
    }];

    const checkSave = await ApiSave(save, 'PostRoleGroup', 'PostRoleGroup')
    if (checkSave != "True") return

    // Cập nhật lại dữ liệu trong bộ nhớ để UI phản ánh ngay
    role.name = name;
    role.desc = desc;

    state.selectedRoleId = roleId;
    editRoleModalInstance.hide();
    showToast(`Cập nhật thành công nhóm "${name}"!`);

    renderLeftList();
    renderActiveWorkspace();
}
// api

async function ApiSave(arrSave, action, router) {
    try {
        const request = new Request(`/api/ERP_DicUser/${router}?action=${action}`, {
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