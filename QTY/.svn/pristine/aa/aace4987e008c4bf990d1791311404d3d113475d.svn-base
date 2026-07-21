/// Kiệt
/// Variable
var userNameSave = localStorage.getItem("username1")
var URL_CHECKLIST = '/img/CheckList'
var isEditMode = false;
var isQuickDeleteMode = false;
var quickDeleteSet = new Set();

// Lưu ảnh mới khi đang ở chế độ chỉnh sửa: key = id, value = base64
var editImgMap = new Map();

/// Init
function showToast(type, message, delay = 2000) {
    let toastId, messageId;
    switch (type) {
        case 'success': toastId = 'successToast'; messageId = 'successMessage'; break;
        case 'error': toastId = 'errorToast'; messageId = 'errorMessage'; break;
        case 'warning': toastId = 'warningToast'; messageId = 'warningMessage'; break;
        default: console.error('Unknown toast type:', type); return;
    }
    $('#' + messageId).text(message);
    const toastElement = $('#' + toastId)[0];
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: delay });
    toast.show();
}

function exitEditMode() {
    isEditMode = false;
    $("#btnThemMoi").show();
    $("#btnChinhSua").show();
    $("#btnXoaNhanh").show();
    $("#btnLuuChinhSua").hide();
    $("#btnDongChinhSua").hide();

    $(".card.edit-mode").removeClass("edit-mode");
    $(".edit-card-input").remove();
    $(".edit-img-overlay").remove();
    $(".btnDelete").show().html('<i class="bi bi-trash"></i> Xóa').removeClass("btn-warning").addClass("btn-danger");

    editImgMap.clear();
    GetCheckList();
}

$(document).on("keydown", function (e) {
    if (e.key === "Escape") {
        if (isEditMode) exitEditMode();
        if (isQuickDeleteMode) exitQuickDeleteMode();
    }
});

$(document).on("click", ".btnDelete", function () {
    console.log("Click Delete");
    const id = $(this).attr('data-id')
    const objectDelete = {
        ID: id,
        TenCheckList: '',
        HinhCheckList: '',
        NguoiTao: '',
    }
    showConfirmXoa(async function () {
        deleteCheckList([objectDelete], 'Delete', '@TypeDicCheckList')
    })
});


/// Event
$(function () {
    GetCheckList();
    $("#btnThemMoi").on("click", addNewCardInput);

    console.log(`userNameSave: `, userNameSave)
    if (!userNameSave) {
        window.location.href = '/login'
    }

    // ✅ Đăng ký listener cho modal chọn nguồn ảnh MỘT LẦN DUY NHẤT khi trang load
    // (dùng chung cho cả "thêm mới" và "chỉnh sửa")
    $("#btnChupAnh").on("click", function () {
        const mode = $("#modalChonNguonAnh").data("mode");
        $("#modalChonNguonAnh").modal("hide");

        if (mode === "edit") {
            const editId = $("#modalChonNguonAnh").data("editId");
            setTimeout(() => {
                const $input = $(`#editInputCamera_${editId}`);
                $input.val(""); 
                $input.trigger("click");
            }, 300);
        } else {
            const activeUid = $("#modalChonNguonAnh").data("uid");
            setTimeout(() => {
                const $input = $(`#inputImgCamera_${activeUid}`);
                $input.val("");
                $input.trigger("click");
            }, 300);
        }
    });

    $("#btnChonThuVien").on("click", function () {
        const mode = $("#modalChonNguonAnh").data("mode");
        $("#modalChonNguonAnh").modal("hide");

        if (mode === "edit") {
            const editId = $("#modalChonNguonAnh").data("editId");
            setTimeout(() => {
                const $input = $(`#editInputLibrary_${editId}`);
                $input.val("");
                $input.trigger("click");
            }, 300);
        } else {
            const activeUid = $("#modalChonNguonAnh").data("uid");
            setTimeout(() => {
                const $input = $(`#inputImgLibrary_${activeUid}`);
                $input.val("");
                $input.trigger("click");
            }, 300);
        }
    });

    $("#btnDongChinhSua").on('click', function () {
        exitEditMode();
    })

    $("#btnChinhSua").on("click", function () {
        $(".edit-img-overlay").remove();
        $("[id^='editInputCamera_']").remove();
        $("[id^='editInputLibrary_']").remove();

        isEditMode = true;
        $("#btnThemMoi").hide();
        $("#btnChinhSua").hide();
        $("#btnXoaNhanh").hide();
        $("#btnLuuChinhSua").show();
        $("#btnDongChinhSua").show();
        editImgMap.clear();

        $("#tbody .col-6:not(.card-new-input) .card").each(function () {
            const $card = $(this);
            const id = $card.find(".btnDelete").attr("data-id");
            const tenCheckList = $card.find(".card-title-compact").text();

            const $img = $card.find("img.card-img-compact");
            $img.attr("id", `editImg_${id}`);
            $img.css("cursor", "pointer");

            $card.find(`#editInputCamera_${id}, #editInputLibrary_${id}`).remove();
            $card.find(".edit-img-overlay").remove();
            $card.find(".edit-card-input").remove();

            $card.append(`
                <input type="file" id="editInputCamera_${id}" accept="image/*" capture="environment" style="display:none;">
                <input type="file" id="editInputLibrary_${id}" accept="image/*" style="display:none;">
            `);

            $img.parent().css("position", "relative");
            $img.after(`
                <div class="edit-img-overlay" style="position:absolute;top:6px;right:6px;
                        background:rgba(0,0,0,0.55);color:#fff;border-radius:50%;
                        width:28px;height:28px;display:flex;align-items:center;justify-content:center;
                        font-size:13px;pointer-events:none;">
                    <i class="bi bi-camera-fill"></i>
                </div>
            `);

            $img.off("click.editImg").on("click.editImg", function () {
                $("#modalChonNguonAnh").data("editId", id).data("mode", "edit").modal("show");
            });

            const $cardBody = $card.find(".card-body-compact");
            $cardBody.append(`
                <input type="text" class="form-control form-control-sm edit-card-input mt-2" 
                       value="${tenCheckList}" data-id="${id}" data-original="${tenCheckList}" style="font-size:12px;">
            `);

            (function (cardId, $targetImg) {
                $card.find(`#editInputCamera_${cardId}`).off("change").on("change", function (e) {
                    handleEditImgChange(e, cardId, $targetImg);
                });
                $card.find(`#editInputLibrary_${cardId}`).off("change").on("change", function (e) {
                    handleEditImgChange(e, cardId, $targetImg);
                });
            })(id, $img);

            $card.addClass("edit-mode");
            $card.find(".btnDelete").hide();
        });
    });


    $("#btnLuuChinhSua").on("click", async function () {
        const arrUpdate = [];

        $(".edit-card-input").each(function () {
            const $input = $(this);
            const id = $input.attr("data-id");
            const tenCheckList = $input.val().trim();
            const tenGoc = $input.attr("data-original") || "";
            const newImg = editImgMap.get(id) || "";

            const tenCoDoi = tenCheckList && tenCheckList !== tenGoc;
            const anhCoDoi = !!newImg;

            if (tenCheckList && (tenCoDoi || anhCoDoi)) {
                arrUpdate.push({
                    ID: id,
                    TenCheckList: tenCheckList,
                    HinhCheckList: newImg, 
                    NguoiTao: userNameSave,
                });
            }
        });

        if (arrUpdate.length === 0) {
            showToast("warning", "Không có gì để cập nhật");
            return;
        }

        await ApiSaveCheckList(arrUpdate, 'Post', '@TypeDicCheckList');
        exitEditMode();
    });
    $("#btnXoaNhanh").on("click", function () {
        enterQuickDeleteMode();
    });

    $("#btnHuyXoaNhanh").on("click", function () {
        exitQuickDeleteMode();
    });

    $("#btnXacNhanXoaNhanh").on("click", function () {
        if (quickDeleteSet.size === 0) {
            showToast("warning", "Vui lòng chọn ít nhất 1 CheckList để xóa");
            return;
        }

        const arrDelete = Array.from(quickDeleteSet).map(id => ({
            ID: id,
            TenCheckList: '',
            HinhCheckList: '',
            NguoiTao: '',
        }));

        showConfirmXoa(async function () {
            await deleteCheckList(arrDelete, 'Delete', '@TypeDicCheckList');
            exitQuickDeleteMode();
        });
    });

    // Toggle chọn/bỏ chọn khi bấm vào card trong chế độ xóa nhanh
    $(document).on("click", ".card.quick-delete-mode", function () {
        const id = $(this).find(".btnDelete").attr("data-id");
        const $card = $(this);

        if (quickDeleteSet.has(id)) {
            quickDeleteSet.delete(id);
            $card.removeClass("quick-delete-selected");
        } else {
            quickDeleteSet.add(id);
            $card.addClass("quick-delete-selected");
        }

        updateQuickDeleteCount();
    });
})

/// Function
function enterQuickDeleteMode() {
    isQuickDeleteMode = true;
    quickDeleteSet.clear();

    $("#btnThemMoi").hide();
    $("#btnChinhSua").hide();
    $("#btnXoaNhanh").hide();
    $("#btnXacNhanXoaNhanh").show();
    $("#btnHuyXoaNhanh").show();

    $("#tbody .col-6:not(.card-new-input) .card").each(function () {
        const $card = $(this);

        $card.find(".btnDelete").hide();

        $card.addClass("quick-delete-mode");

        if ($card.find(".quick-delete-checkbox").length === 0) {
            $card.css("position", "relative");
            $card.prepend(`<div class="quick-delete-checkbox"><i class="bi bi-check-lg"></i></div>`);
        }
    });

    updateQuickDeleteCount();
}

function exitQuickDeleteMode() {
    isQuickDeleteMode = false;
    quickDeleteSet.clear();

    $("#btnThemMoi").show();
    $("#btnChinhSua").show();
    $("#btnXoaNhanh").show();
    $("#btnXacNhanXoaNhanh").hide();
    $("#btnHuyXoaNhanh").hide();

    $(".card.quick-delete-mode")
        .removeClass("quick-delete-mode quick-delete-selected");
    $(".quick-delete-checkbox").remove();
    $(".btnDelete").show();
}

function updateQuickDeleteCount() {
    const count = quickDeleteSet.size;
    $("#btnXacNhanXoaNhanh").attr(
        "title",
        count > 0 ? `Xóa ${count} CheckList đã chọn` : "Xóa các mục đã chọn"
    );
}

function handleEditImgChange(e, id, $img) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        const base64 = event.target.result;
        if ($img && $img.length) {
            $img.attr("src", base64);
        } else {
            $(`#editImg_${id}`).attr("src", base64);
        }
        editImgMap.set(id, base64);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
}

function renderCard(data) {
    const $tbody = $("#tbody");

    const $existingNewCards = $tbody.find(".card-new-input").detach();

    let html = "";
    data.forEach(item => {
        html += `
            <div class="col-6 col-sm-4 col-md-3 col-lg-2">
                <div class="card card-compact h-100 shadow-sm border-0 overflow-hidden transition-card">
                    <img class="card-img-top card-img-compact" src="${URL_CHECKLIST}${item.HinhCheckList}" alt="${item.TenCheckList}">
                    <div class="card-body card-body-compact">
                        <h6 class="card-title card-title-compact mb-2 text-center">${item.TenCheckList}</h6>
                    </div>
                    <div class="card-footer card-footer-compact bg-white border-top-0 d-flex gap-2">
                        <button class="btn btn-danger btn-sm flex-grow-1 btnDelete" data-id="${item.ID}" >
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    $tbody.empty();
    $tbody.append($existingNewCards);
    $tbody.append(html || '<div class="col-12 text-center text-muted">Chưa có CheckList nào</div>');
}

function addNewCardInput() {
    const $tbody = $("#tbody");

    const uid = Date.now();

    const newCardHtml = `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2 card-new-input" data-uid="${uid}">
            <div class="card card-compact h-100 shadow-sm border-2 border-primary overflow-hidden">
                <div style="width: 100%; aspect-ratio: 2 / 1.3; background: #f0f0f0; position: relative; border-bottom: 1px solid #ddd;">
                    <input type="file" id="inputImgCamera_${uid}" accept="image/*" capture="environment" style="display: none;">
                    <input type="file" id="inputImgLibrary_${uid}" accept="image/*" style="display: none;">
                    <img id="previewNewImg_${uid}" src="" alt="Ảnh"
                         style="width:100%;height:100%;object-fit:cover;display:none;position:absolute;top:0;left:0;cursor:pointer;">
                    <div id="imgPlaceholder_${uid}"
                         style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;
                                align-items:center;justify-content:center;text-align:center;color:#999;font-size:12px;cursor:pointer;">
                        <i class="bi bi-image" style="font-size:24px;margin-bottom:4px;"></i>
                        <span style="color:#0066cc;">Chọn ảnh</span>
                    </div>
                </div>
                <div class="card-body card-body-compact">
                    <input type="text" class="form-control form-control-sm" id="inputTen_${uid}"
                           placeholder="Nhập tên CheckList" style="font-size:12px;">
                </div>
                <div class="card-footer card-footer-compact bg-white border-top-0 d-flex gap-2">
                    <button class="btn btn-success btn-sm flex-grow-1 btnSaveNew" type="button">
                        <i class="bi bi-check-circle"></i> Lưu
                    </button>
                    <button class="btn btn-secondary btn-sm flex-grow-1 btnCancelNew" type="button">
                        <i class="bi bi-x-circle"></i> Hủy
                    </button>
                </div>
            </div>
        </div>
    `;

    $tbody.prepend(newCardHtml);

    const $wrapper = $tbody.find(`.card-new-input[data-uid="${uid}"]`);
    const $inputCam = $wrapper.find(`#inputImgCamera_${uid}`);
    const $inputLib = $wrapper.find(`#inputImgLibrary_${uid}`);
    const $previewImg = $wrapper.find(`#previewNewImg_${uid}`);
    const $imgPlaceholder = $wrapper.find(`#imgPlaceholder_${uid}`);
    const $inputTen = $wrapper.find(`#inputTen_${uid}`);
    const $btnSave = $wrapper.find(".btnSaveNew");
    const $btnCancel = $wrapper.find(".btnCancelNew");

    let imageBase64 = "";

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            imageBase64 = event.target.result;
            $previewImg.attr("src", imageBase64).show();
            $imgPlaceholder.hide();
        };
        reader.readAsDataURL(file);
    }

    // ✅ Click ảnh/placeholder -> lưu uid vào modal để biết card nào đang chọn
    $imgPlaceholder.on("click", function () {
        $("#modalChonNguonAnh").data("uid", uid).data("mode", "new").modal("show");
    });
    $previewImg.on("click", function () {
        $("#modalChonNguonAnh").data("uid", uid).data("mode", "new").modal("show");
    });

    $inputCam.on("change", handleFileChange);
    $inputLib.on("change", handleFileChange);

    // Nút LƯU
    $btnSave.on("click", async function () {
        const tenCheckList = $inputTen.val().trim();

        if (!tenCheckList) {
            showToast("warning", "Vui lòng nhập tên CheckList");
            return;
        }
        if (!imageBase64) {
            showToast("warning", "Vui lòng chọn ảnh");
            return;
        }

        const arrSave = {
            ID: 0,
            TenCheckList: tenCheckList,
            HinhCheckList: imageBase64,
            NguoiTao: userNameSave,
        };

        $wrapper.remove();

        // Sau đó mới gọi API (API sẽ reload dữ liệu và hiển thị card mới)
        await ApiSaveCheckList([arrSave], "Post", "@TypeDicCheckList");
    });

    // Nút HỦY
    $btnCancel.on("click", function () {
        $wrapper.remove();
    });
}


async function deleteCheckList(arrDelete, action, type) {
    console.log(`arrDelete: `, arrDelete)
    try {
        const url = `/api/Dic_CheckList/Delete?action=${action}&type=${type}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(arrDelete),
        });
        const result = await response.json();
        if (result == "True") {
            showToast("success", "Xóa thành công");
            await GetCheckList();
        } else {
            showToast("error", "Xóa thất bại");
        }
    } catch (err) {
        console.error(err);
        showToast("error", "Xóa thất bại");
    }
}

function showConfirmXoa(onConfirm) {
    $('#btnXacNhanXoa').off('click');

    // Khi nhấn Đồng ý
    $('#btnXacNhanXoa').on('click', function () {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
        // Ẩn modal sau khi xử lý
        $("#confirmModalXoa").modal('hide')
    });

    // Hiện modal
    $("#confirmModalXoa").modal('show')

}


$(function () {
    $("#btnShowModalXacNhanHuy").on('click', function () {
        showConfirmBatDauXaVai(function () {

        })
    })
})



/// API
async function ApiSaveCheckList(arrSave, action, type) {
    try {
        const url = `/api/Dic_CheckList/Post?action=${action}&type=${type}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(arrSave),
        });
        const result = await response.json();
        if (result == "True") {
            showToast("success", "Lưu thành công");
            await GetCheckList();
        } else {
            showToast("error", "Lưu thất bại");
        }
    } catch (err) {
        console.error(err);
        showToast("error", "Lưu thất bại");
    }
}

async function GetCheckList() {
    try {
        const url = `/api/Dic_CheckList/Get?action=GetCheckList`;
        const response = await fetch(url);
        const data = await response.json();
        renderCard(data);
    } catch (err) {
        console.error(err);
        showToast("error", "Lấy dữ liệu thất bại");
    }
}