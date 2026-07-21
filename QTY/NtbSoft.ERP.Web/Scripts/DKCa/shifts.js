$(function () {
    // Đồng hồ thời gian bắt đầu
    $("#btnClockStart").click(function () {

        $("#inpTGBatDau")
            .show()
            .trigger("focus")
            .trigger("click");
    });

    $("#inpTGBatDau").on("change", function () {

        $("#txtTGBatDau").text(formatDisplayTime($(this).val()));

        $(this).hide();
    });

    $("#inpTGBatDau").blur(function () {

        $(this).hide();
    });


    // Đồng hồ thời gian kết thúc
    $("#btnClockEnd").click(function () {

        $("#inpTGKetThuc")
            .show()
            .trigger("focus")
            .trigger("click");
    });

    $("#inpTGKetThuc").on("change", function () {

        $("#txtTGKetThuc").text(formatDisplayTime($(this).val()));

        $(this).hide();
    });

    $("#inpTGKetThuc").blur(function () {

        $(this).hide();
    });
    var shifts = [];
    var details = [];
    var selectedCa = null;

    // ── Helpers ──────────────────────────────────────────────────────────────

    function swalConfirm(message, title) {
        title = title || 'Xác nhận';
        return new Promise(function (resolve) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: title,
                    text: message || '',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Xóa',
                    cancelButtonText: 'Hủy',
                    reverseButtons: true,
                    focusCancel: true
                }).then(function (res) { resolve(!!res.isConfirmed); });
            } else {
                resolve(confirm(message));
            }
        });
    }

    function swalAlert(message, type, title) {
        type = type || 'info';
        title = title || (type === 'error' ? 'Lỗi' : (type === 'warning' ? 'Cảnh báo' : 'Thông báo'));
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'),
                title: title,
                text: message
            });
        } else {
            alert((title ? title + ': ' : '') + message);
        }
    }

    function padTimeInput(str) {
        if (!str) return '';
        var p = str.split(':');
        return String(parseInt(p[0], 10)).padStart(2, '0') + ':' + String(parseInt(p[1], 10)).padStart(2, '0');
    }

    function formatDisplayTime(str) {
        if (!str) return '';
        var p = str.split(':');
        return parseInt(p[0], 10) + ':' + String(parseInt(p[1], 10)).padStart(2, '0');
    }

    function parseTimeToMinutes(str) {
        var p = str.split(':');
        return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    }

    function minutesToDisplayTime(totalMinutes) {
        totalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
        return formatDisplayTime(Math.floor(totalMinutes / 60) + ':' + (totalMinutes % 60));
    }

    function addMinutesToTime(startStr, minutes) {
        return minutesToDisplayTime(parseTimeToMinutes(startStr) + minutes);
    }

    function buildDescription(startStr, minutes) {
        return formatDisplayTime(startStr) + '-' + addMinutesToTime(startStr, minutes);
    }

    function padShiftId(id) {
        return String(id).padStart(3, '0');
    }

    function displayShiftId(id) {
        return parseInt(id, 10);
    }

    function timeInputToDb(str) {
        if (!str) return '';
        var p = str.split(':');
        return parseInt(p[0], 10) + ':' + String(parseInt(p[1], 10)).padStart(2, '0');
    }

    function mapDetailRows(rows, caStartTime) {
        var prevEnd = caStartTime;
        return (rows || []).map(function (r, i) {
            var start = i === 0 ? caStartTime : prevEnd;
            var desc = buildDescription(start, r.Minutes);
            prevEnd = addMinutesToTime(start, r.Minutes);
            return {
                timeShiftIdRaw: r.TimeShiftID,
                timeShiftId: displayShiftId(r.TimeShiftID),
                startTime: formatDisplayTime(start),
                descriptions: desc,
                minutes: r.Minutes
            };
        });
    }

    function updateShiftTime(shift, field, newVal, $display) {
        var payload = {
            CaLV: shift.CaLV,
            TGBatDau: field === 'TGBatDau' ? newVal : shift.TGBatDau,
            TGKetThuc: field === 'TGKetThuc' ? newVal : shift.TGKetThuc
        };

        if (parseTimeToMinutes(payload.TGKetThuc) <= parseTimeToMinutes(payload.TGBatDau)) {
            swalAlert('Giờ kết thúc phải lớn hơn giờ bắt đầu.', 'warning', 'Giờ không hợp lệ');
            loadShifts();
            return;
        }

        $.ajax({
            url: '/DKCa/UpdateShiftTime',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (resp) {
                if (resp && resp.success === false) {
                    swalAlert(resp.error || 'Không thể cập nhật giờ', 'error', 'Lỗi');
                    loadShifts();
                    return;
                }
                shift.TGBatDau = payload.TGBatDau;
                shift.TGKetThuc = payload.TGKetThuc;
                if ($display) $display.text(formatDisplayTime(newVal));

                // Đồng bộ header + bảng chi tiết bên phải nếu đang chọn đúng ca này
                if (resp && resp.shift) {
                    refreshDetailsFromResponse(resp);
                }
            },
            error: function () {
                swalAlert('Lỗi khi lưu giờ.', 'error', 'Lỗi');
                loadShifts();
            }
        });
    }
    // ── Đồng hồ sửa giờ dùng chung (view 1: danh sách ca) ───────────────────

    function buildTimeEditCell(shift, field) {
        var $cell = $('<div class="time-cell"></div>');
        var $display = $('<span class="time-display"></span>').text(formatDisplayTime(shift[field]));
        var $clockBtn = $('<button type="button" class="btn-clock" title="Sửa giờ"><i class="bi bi-clock"></i></button>');
        var $input = $('<input type="time" class="form-control form-control-sm" style="width:110px;display:none" />');
        $input.val(padTimeInput(shift[field]));

        $clockBtn.on('click', function () {
            $input.val(padTimeInput(shift[field]));
            $display.hide();
            $clockBtn.hide();
            $input.fadeIn(150).trigger('focus'); // Dùng fadeIn
        });

        $input.on('blur', function () {
            $input.hide();
            $clockBtn.fadeIn(150); // Dùng fadeIn
            $display.fadeIn(150);  // Dùng fadeIn
        });

        $input.on('change', function () {
            var newVal = timeInputToDb($input.val());
            $input.trigger('blur'); // Gọi hàm blur để tự động đóng
            if (!newVal || newVal === shift[field]) return;
            updateShiftTime(shift, field, newVal, $display);
        });

        $cell.append($display, $clockBtn, $input);
        return $cell;
    }

    function updateShiftTime(shift, field, newVal, $display) {
        var payload = {
            CaLV: shift.CaLV,
            TGBatDau: field === 'TGBatDau' ? newVal : shift.TGBatDau,
            TGKetThuc: field === 'TGKetThuc' ? newVal : shift.TGKetThuc
        };

        // Thêm logic chặn lỗi giờ kết thúc <= giờ bắt đầu
        if (parseTimeToMinutes(payload.TGKetThuc) <= parseTimeToMinutes(payload.TGBatDau)) {
            swalAlert('Giờ kết thúc phải lớn hơn giờ bắt đầu.', 'warning', 'Giờ không hợp lệ');
            loadShifts(); // Load lại để reset UI
            return;
        }

        $.ajax({
            url: '/DKCa/UpdateShiftTime',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (resp) {
                if (resp && resp.success === false) {
                    swalAlert(resp.error || 'Không thể cập nhật giờ', 'error', 'Lỗi');
                    loadShifts();
                    return;
                }
                shift.TGBatDau = payload.TGBatDau;
                shift.TGKetThuc = payload.TGKetThuc;
                if ($display) $display.text(formatDisplayTime(newVal));

                if (selectedCa && selectedCa.CaLV === shift.CaLV) {
                    selectedCa.TGBatDau = shift.TGBatDau;
                    selectedCa.TGKetThuc = shift.TGKetThuc;
                    $('#shiftHeader').text('Ca ' + selectedCa.CaLV + '  (' + formatDisplayTime(selectedCa.TGBatDau) + ' \u2192 ' + formatDisplayTime(selectedCa.TGKetThuc) + ')');
                    if (resp && resp.details) {
                        details = mapDetailRows(resp.details, formatDisplayTime(selectedCa.TGBatDau));
                        filterDetails($('#searchDetails').val());
                    }
                }
            },
            error: function () {
                swalAlert('Lỗi khi lưu giờ.', 'error', 'Lỗi');
                loadShifts();
            }
        });
    }

    function showShiftsView() {
        $('#tblShiftsBody tr').removeClass('active-row');
        selectedCa = null;
        details = [];

        $('#shiftHeader').text('Chưa chọn ca').css('background', '#94a3b8');
        $('#tblTimeShiftBody').html('<tr><td colspan="5" class="empty-state"><i class="bi bi-hand-index-thumb"></i>Vui lòng chọn ca</td></tr>');

        $('#btnAddRow, #searchDetails, #btnSearchDetails').prop('disabled', true);
    }

    function showTimeShiftView(shift, $tr) {
        selectedCa = shift;
        $('#searchDetails').val('');

        $('#btnAddRow, #searchDetails, #btnSearchDetails').prop('disabled', false);

        $('#shiftHeader').text('Ca ' + shift.CaLV + '  (' + formatDisplayTime(shift.TGBatDau) + ' \u2192 ' + formatDisplayTime(shift.TGKetThuc) + ')')
            .css('background', '');

        $('#tblShiftsBody tr').removeClass('active-row');
        if ($tr) $tr.addClass('active-row');

        loadShiftDetails(shift.CaLV);
    }


    function renderShiftsTable(list) {
        var $body = $('#tblShiftsBody');
        $body.empty();

        if (!list || list.length === 0) {
            $body.append('<tr><td colspan="4" class="empty-state"><i class="bi bi-inbox"></i>Chưa có ca nào</td></tr>');
            return;
        }

        list.forEach(function (s) {
            var $tr = $('<tr class="shift-row"></tr>');
            $tr.append($('<td class="id-cell"></td>').text(s.CaLV));

            var $tdStart = $('<td></td>');
            $tdStart.append(buildTimeEditCell(s, 'TGBatDau'));
            $tr.append($tdStart);

            var $tdEnd = $('<td></td>');
            $tdEnd.append(buildTimeEditCell(s, 'TGKetThuc'));
            $tr.append($tdEnd);

            var $actions = $('<td></td>');
            var $btnDelete = $('<button type="button" class="btn btn-outline-danger btn-sm btn-action"><i class="bi bi-trash"></i> Xóa</button>');
            $btnDelete.on('click', function (e) {
                e.stopPropagation(); // không cho nổi bọt lên click chọn dòng
                deleteShift(s);
            });
            $actions.append($btnDelete);
            $tr.append($actions);

            // Click vào bất kỳ đâu trên dòng (trừ nút/input) sẽ chọn ca đó
            $tr.on('click', function (e) {
                if ($(e.target).closest('button, input').length) return;
                showTimeShiftView(s, $tr);
            });

            if (selectedCa && selectedCa.CaLV === s.CaLV) $tr.addClass('active-row');

            $body.append($tr);
        });
    }

    function filterShifts(keyword) {
        keyword = (keyword || '').toLowerCase();
        if (!keyword) {
            renderShiftsTable(shifts);
            return;
        }
        var filtered = shifts.filter(function (s) {
            return String(s.CaLV).indexOf(keyword) >= 0 ||
                (s.TGBatDau || '').indexOf(keyword) >= 0 ||
                (s.TGKetThuc || '').indexOf(keyword) >= 0;
        });
        renderShiftsTable(filtered);
    }

    function filterDetails(keyword) {
        keyword = (keyword || '').toLowerCase().trim();
        if (!keyword) {
            renderTimeShiftTable(details);
            return;
        }
        var filtered = details.filter(function (r) {
            return String(r.timeShiftId).indexOf(keyword) >= 0 ||
                (r.startTime || '').toLowerCase().indexOf(keyword) >= 0 ||
                (r.descriptions || '').toLowerCase().indexOf(keyword) >= 0;
        });
        renderTimeShiftTable(filtered);
    }

    function renderTimeShiftTable(rows) {
        var $body = $('#tblTimeShiftBody');
        $body.empty();

        if (!rows || rows.length === 0) {
            $body.append('<tr><td colspan="5" class="empty-state"><i class="bi bi-inbox"></i>Chưa có khoảng thời gian</td></tr>');
            return;
        }

        rows.forEach(function (row, index) {
            var $tr = $('<tr></tr>');
            $tr.append('<td class="id-cell">' + row.timeShiftId + '</td>');

            var $timeTd = $('<td></td>');
            var $timeCell = $('<div class="time-cell"></div>');
            $timeCell.append('<span class="time-display">' + row.startTime + '</span>');

            var $clockBtn = $('<button type="button" class="btn-clock" title="Sửa giờ kết thúc"><i class="bi bi-clock"></i></button>');
            var $timeInput = $('<input type="time" class="form-control form-control-sm" style="width:110px;display:none" />');

            var curEndTime = addMinutesToTime(row.startTime, row.minutes);

            var $timeTd = $('<td></td>');
            var $timeCell = $('<div class="time-cell"></div>');

            $timeCell.append('<span class="time-display">' + curEndTime + '</span>');

            var $clockBtn = $('<button type="button" class="btn-clock" title="Sửa giờ kết thúc"><i class="bi bi-clock"></i></button>');
            var $timeInput = $('<input type="time" class="form-control form-control-sm" style="width:110px;display:none" />');

            $timeInput.val(padTimeInput(curEndTime));

            $clockBtn.on('click', function () {
                $timeInput.val(padTimeInput(addMinutesToTime(row.startTime, row.minutes)));
                $timeCell.find('.time-display').hide();
                $clockBtn.hide();
                $timeInput.fadeIn(150).trigger('focus');
            });

            $timeInput.on('blur', function () {
                $timeInput.hide();
                $clockBtn.fadeIn(150);
                $timeCell.find('.time-display').fadeIn(150);
            });

            $timeInput.on('change', function () {
                var newEnd = timeInputToDb($timeInput.val());
                $timeInput.trigger('blur'); 

                if (!newEnd) return;

                var oldEnd = addMinutesToTime(row.startTime, row.minutes);
                if (newEnd === oldEnd) return; 

                updateRowEndTime(row, newEnd);
            });

            $timeCell.append($clockBtn).append($timeInput);
            $timeTd.append($timeCell);

            $tr.append($timeTd);

            $tr.append('<td class="desc-cell">' + row.descriptions + '</td>');

            var $minTd = $('<td></td>');
            var $minInput = $('<input type="number" class="input-minutes" min="1" max="1440" />');
            $minInput.val(row.minutes);

            $minInput.on('input', function () {
                var previewMin = parseInt($minInput.val(), 10);
                if (previewMin > 0) {
                    $tr.find('.desc-cell').text(buildDescription(row.startTime, previewMin));
                }
            });

            $minInput.on('change', function () {
                var newMin = parseInt($minInput.val(), 10);
                if (!newMin || newMin <= 0) {
                    $minInput.val(row.minutes);
                    return;
                }
                if (newMin === row.minutes) return;
                updateRowMinutes(row, newMin, $tr);
            });

            $minTd.append($minInput);
            $tr.append($minTd);

            var $delTd = $('<td></td>');
            var $btnDel = $(
                '<button type="button" class="btn btn-outline-danger btn-sm btn-action">' +
                '<i class="bi bi-trash"></i> Xóa' +
                '</button>'
            );
            $btnDel.on('click', function () { deleteDetailRow(row); });
            $delTd.append($btnDel);
            $tr.append($delTd);

            $body.append($tr);
        });
        if ($.ui && $.ui.sortable) {
            if ($body.hasClass('ui-sortable')) $body.sortable('destroy');
            $body.sortable({
                axis: 'y',
                helper: function (e, ui) {
                    ui.children().each(function () { $(this).width($(this).width()); });
                    return ui;
                },
                cancel: 'button, .btn, input',
                placeholder: 'ui-state-highlight',
                update: function () {
                    var order = [];
                    $body.find('tr').each(function () {
                        var id = $(this).find('.id-cell').text().trim();
                        if (id) order.push(padShiftId(id));
                    });

                    $.ajax({
                        url: '/DKCa/UpdateShiftOrder',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ CaLV: selectedCa.CaLV, OrderIDs: order }),
                        success: function (resp) {
                            if (resp && resp.success === false) {
                                swalAlert(resp.error || 'Không thể lưu thứ tự', 'error', 'Lỗi');
                                loadShiftDetails(selectedCa.CaLV); 
                            }
                        }
                    });
                }
            });
        }
    }

    function loadShifts() {
        $.getJSON('/DKCa/GetShifts')
            .done(function (data) {
                if (data && data.error) {
                    swalAlert('Lỗi truy xuất Database: ' + data.error, 'error', 'Lỗi SQL');
                    return;
                }
                shifts = data || [];
                filterShifts($('#searchShifts').val());
            })
            .fail(function () {
                swalAlert('Không thể tải danh sách ca. Kiểm tra kết nối server.', 'error', 'Lỗi Mạng');
            });
    }

    function loadShiftDetails(caLV) {
        $.getJSON('/DKCa/GetShiftDetails', { caLV: caLV })
            .done(function (data) {
                if (data && data.error) {
                    swalAlert('Lỗi truy xuất Database: ' + data.error, 'error', 'Lỗi SQL');
                    return;
                }
                var caStart = selectedCa ? formatDisplayTime(selectedCa.TGBatDau) : '0:00';
                details = mapDetailRows(data || [], caStart);
                filterDetails($('#searchDetails').val());
            })
            .fail(function () {
                details = [];
                renderTimeShiftTable([]);
            });
    }

    function refreshDetailsFromResponse(resp) {
        if (resp && resp.shift) {
            applyShiftUpdate(resp.shift);
        }
        if (resp && resp.details) {
            var caStart = selectedCa ? formatDisplayTime(selectedCa.TGBatDau) : '0:00';
            details = mapDetailRows(resp.details, caStart);
            filterDetails($('#searchDetails').val());
        } else if (selectedCa) {
            loadShiftDetails(selectedCa.CaLV);
        }
    }

    function applyShiftUpdate(shiftInfo) {
        if (!selectedCa || selectedCa.CaLV !== shiftInfo.CaLV) return;

        selectedCa.TGBatDau = shiftInfo.TGBatDau;
        selectedCa.TGKetThuc = shiftInfo.TGKetThuc;

        var localShift = shifts.find(function (s) { return s.CaLV === shiftInfo.CaLV; });
        if (localShift) {
            localShift.TGBatDau = shiftInfo.TGBatDau;
            localShift.TGKetThuc = shiftInfo.TGKetThuc;
            filterShifts($('#searchShifts').val());
        }

        $('#shiftHeader').text('Ca ' + selectedCa.CaLV + '  (' + formatDisplayTime(selectedCa.TGBatDau) + ' \u2192 ' + formatDisplayTime(selectedCa.TGKetThuc) + ')');
    }

    function deleteShift(shift) {
        swalConfirm('Xóa ca ' + shift.CaLV + '?', 'Xóa ca').then(function (confirmed) {
            if (!confirmed) return;
            $.ajax({
                url: '/DKCa/DeleteShift',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ CaLV: shift.CaLV }),
                success: function (resp) {
                    if (resp && resp.success === false) {
                        swalAlert(resp.error || 'Không thể xóa ca', 'error', 'Lỗi');
                        return;
                    }
                    if (selectedCa && selectedCa.CaLV === shift.CaLV) showShiftsView();
                    loadShifts();
                    swalAlert('Đã xóa ca', 'info', 'Thành công');
                },
                error: function () { swalAlert('Lỗi khi xóa ca.', 'error', 'Lỗi'); }
            });
        });
    }

    function updateRowMinutes(row, newMinutes, $tr) {
        $.ajax({
            url: '/DKCa/UpdateShiftMinutes',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                CaLV: selectedCa.CaLV,
                TimeShiftID: padShiftId(row.timeShiftIdRaw),
                Minutes: newMinutes
            }),
            success: function (resp) {
                if (resp && resp.success === false) {
                    swalAlert(resp.error || 'Không thể cập nhật số phút', 'error', 'Lỗi');
                    loadShiftDetails(selectedCa.CaLV);
                    return;
                }
                // resp.details đã chứa toàn bộ các khoảng được dồn lại đúng
                // -> render lại ngay lập tức, không cần load lại từ server
                refreshDetailsFromResponse(resp);
            },
            error: function () {
                swalAlert('Lỗi khi lưu thay đổi.', 'error', 'Lỗi');
                loadShiftDetails(selectedCa.CaLV);
            }
        });
    }

    function updateRowEndTime(row, newEndStr) {
        // Thêm logic chặn lỗi trước khi gửi request xuống DB
        var startMin = parseTimeToMinutes(row.startTime);
        var endMin = parseTimeToMinutes(newEndStr);

        if (endMin <= startMin) {
            swalAlert('Giờ kết thúc khoảng phải lớn hơn giờ bắt đầu (' + row.startTime + ').', 'warning', 'Giờ không hợp lệ');
            return;
        }

        var newName = formatDisplayTime(row.startTime) + '-' + formatDisplayTime(newEndStr);
        $.ajax({
            url: '/DKCa/UpdateShiftName',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                CaLV: selectedCa.CaLV,
                TimeShiftID: padShiftId(row.timeShiftIdRaw),
                NewName: newName
            }),
            success: function (resp) {
                if (resp && resp.success === false) {
                    swalAlert(resp.error || 'Không thể cập nhật giờ kết thúc', 'error', 'Lỗi');
                    loadShiftDetails(selectedCa.CaLV);
                    return;
                }
                refreshDetailsFromResponse(resp);
            },
            error: function () {
                swalAlert('Lỗi khi lưu giờ kết thúc.', 'error', 'Lỗi');
                loadShiftDetails(selectedCa.CaLV);
            }
        });
    }

    function deleteDetailRow(row) {
        swalConfirm('Xóa khoảng ' + row.descriptions + '?', 'Xóa khoảng').then(function (confirmed) {
            if (!confirmed) return;
            $.ajax({
                url: '/DKCa/DeleteShiftDetail',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ caLV: selectedCa.CaLV, timeShiftID: padShiftId(row.timeShiftIdRaw) }),
                success: function (resp) {
                    if (resp && resp.success === false) {
                        swalAlert(resp.error || 'Không thể xóa', 'error', 'Lỗi');
                        return;
                    }
                    refreshDetailsFromResponse(resp);
                },
                error: function () { swalAlert('Lỗi khi xóa khoảng.', 'error', 'Lỗi'); }
            });
        });
    }

    function addShiftRow() {
        if (!selectedCa) return;

        $.ajax({
            url: '/DKCa/AddShiftDetail',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                CaLV: selectedCa.CaLV
            }),
            success: function (resp) {
                if (resp && resp.success === false) {
                    swalAlert(resp.error || 'Không thể thêm khoảng', 'error', 'Lỗi');
                    return;
                }

                refreshDetailsFromResponse(resp);

                setTimeout(function () {
                    $('#tblTimeShiftBody tr:last .input-minutes').trigger('focus').trigger('select');
                }, 100);
            }
        });
    }

    function doCreateShift(CaLV, TGBatDau, TGKetThuc) {
        return $.ajax({
            url: '/DKCa/CreateShift',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ CaLV: CaLV, TGBatDau: TGBatDau, TGKetThuc: TGKetThuc })
        });
    }

    $('#btnOpenAddShift').on('click', function () {
        Swal.fire({
            html:
                '<div class="addshift-form">' +
                '  <div class="addshift-header">' +
                '    <div class="icon-badge"><i class="bi bi-clock-history"></i></div>' +
                '    <div class="title-text">Thêm ca làm việc</div>' +
                '  </div>' +
                '  <div class="addshift-field">' +
                '    <label><i class="bi bi-hash"></i> Mã ca làm việc</label>' +
                '    <input id="swalCaLV" type="number" min="1" class="addshift-input" placeholder="VD: 1">' +
                '  </div>' +
                '  <div class="addshift-row2">' +
                '    <div class="addshift-field">' +
                '      <label><i class="bi bi-sunrise"></i> Bắt đầu</label>' +
                '      <input id="swalTGBatDau" type="time" class="addshift-input">' +
                '    </div>' +
                '    <div class="addshift-field">' +
                '      <label><i class="bi bi-moon-stars"></i> Kết thúc</label>' +
                '      <input id="swalTGKetThuc" type="time" class="addshift-input">' +
                '    </div>' +
                '  </div>' +
                '  <div id="swalValidationMsg" style="color:#dc2626;font-size:13px;font-weight:600;display:none;margin-top:-4px;margin-bottom:8px"></div>' +
                '  <div class="addshift-actions">' +
                '    <button type="button" id="swalBtnCancel" class="addshift-btn addshift-btn-cancel">Hủy</button>' +
                '    <button type="button" id="swalBtnConfirm" class="addshift-btn addshift-btn-confirm"><i class="bi bi-plus-circle"></i>&nbsp; Tạo ca</button>' +
                '  </div>' +
                '</div>',
            showConfirmButton: false,
            showCancelButton: false,
            showCloseButton: false,
            customClass: { popup: 'addshift-popup' },
            width: 440,
            didOpen: function () {
                $('#swalBtnCancel').on('click', function () { Swal.close(); });

                $('#swalBtnConfirm').on('click', function () {
                    var CaLV = parseInt($('#swalCaLV').val(), 10);
                    var TGBatDau = timeInputToDb($('#swalTGBatDau').val());
                    var TGKetThuc = timeInputToDb($('#swalTGKetThuc').val());

                    var $msg = $('#swalValidationMsg');
                    if (!CaLV || !TGBatDau || !TGKetThuc) {
                        $msg.text('Vui lòng nhập đầy đủ Mã ca, giờ bắt đầu và giờ kết thúc.').show();
                        return;
                    }
                    if (parseTimeToMinutes(TGKetThuc) <= parseTimeToMinutes(TGBatDau)) {
                        $msg.text('Giờ kết thúc phải lớn hơn giờ bắt đầu.').show();
                        return;
                    }
                    $msg.hide();

                    doCreateShift(CaLV, TGBatDau, TGKetThuc)
                        .done(function (resp) {
                            if (resp && resp.success === false) {
                                Swal.close();
                                swalAlert(resp.error || 'Không thể tạo ca', 'error', 'Lỗi');
                                return;
                            }
                            Swal.close();
                            loadShifts();
                            swalAlert('Đã tạo ca ' + CaLV, 'info', 'Thành công');
                            var newShift = { CaLV: CaLV, TGBatDau: TGBatDau, TGKetThuc: TGKetThuc };
                            if (resp && resp.details) {
                                selectedCa = newShift;
                                showTimeShiftView(newShift);
                                refreshDetailsFromResponse(resp);
                            }
                        })
                        .fail(function (xhr) {
                            Swal.close();
                            var msg = xhr && xhr.responseText ? xhr.responseText : xhr.statusText;
                            swalAlert('Lỗi khi tạo ca: ' + msg, 'error', 'Lỗi');
                        });
                });
            }
        });
    });
    // ── Form: Tạo ca ─────────────────────────────────────────────────────────

    $('#btnCreateShift').on('click', function () {
        var CaLV = parseInt($('#inpCaLV').val(), 10);
        var TGBatDau = timeInputToDb($('#inpTGBatDau').val());
        var TGKetThuc = timeInputToDb($('#inpTGKetThuc').val());

        if (!CaLV || !TGBatDau || !TGKetThuc) {
            swalAlert('Nhập đầy đủ Mã ca, Thời gian bắt đầu và kết thúc', 'warning', 'Cảnh báo');
            return;
        }

        $.ajax({
            url: '/DKCa/CreateShift',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ CaLV: CaLV, TGBatDau: TGBatDau, TGKetThuc: TGKetThuc }),
            success: function (resp) {
                if (resp && resp.success === false) {
                    swalAlert(resp.error || 'Không thể tạo ca', 'error', 'Lỗi');
                    return;
                }
                loadShifts();
                swalAlert('Đã tạo ca ' + CaLV, 'info', 'Thành công');
                var newShift = { CaLV: CaLV, TGBatDau: TGBatDau, TGKetThuc: TGKetThuc };
                if (resp && resp.details) {
                    selectedCa = newShift;
                    showTimeShiftView(newShift);
                    refreshDetailsFromResponse(resp);
                }
            },
            error: function (xhr) {
                var msg = xhr && xhr.responseText ? xhr.responseText : xhr.statusText;
                swalAlert('Lỗi khi tạo ca: ' + msg, 'error', 'Lỗi');
            }
        });
    });

    $('#btnRefresh').on('click', function () {

        // Reset mã ca
        $('#inpCaLV').val('');

        // Reset input time
        $('#inpTGBatDau').val('');
        $('#inpTGKetThuc').val('');

        // Reset thời gian hiển thị
        $('#txtTGBatDau').text('0:00');
        $('#txtTGKetThuc').text('0:00');

        // Ẩn input time nếu đang mở
        $('#inpTGBatDau').hide();
        $('#inpTGKetThuc').hide();

        // Reset ca đang chọn
        showShiftsView();

        // Load lại danh sách ca
        loadShifts();
    });

    $('#btnAddRow').on('click', addShiftRow);
    $('#searchDetails').on('input', function () { filterDetails($(this).val()); });
    $('#btnSearchDetails').on('click', function () { filterDetails($('#searchDetails').val()); });

    showShiftsView(); // Thêm dòng này
    loadShifts();
});