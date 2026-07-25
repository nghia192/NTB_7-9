
var defectGrid, checklistGrid, loadPanel;

$(function () {
    initFilter();
    initLoadPanel();
    initTab();
});

// ================================================================
// Cột "PCO Number" thường rất dài (vd pco__202607141010382222542).
// renderPcoCell() rút gọn hiển thị dạng "pco__2026...2542" (giữ đầu
// + cuối, đủ để nhận diện), đặt title = chuỗi đầy đủ khi hover, và
// gắn icon copy nhỏ để lấy nhanh mã đầy đủ vào clipboard.
// Dùng chung cho cả grid Defect và Checklist.
// ================================================================
function truncateMiddle(str, front, back, threshold) {
    front = front || 9;
    back = back || 4;
    threshold = threshold || (front + back + 4);
    if (!str || str.length <= threshold) return str || "";
    return str.substring(0, front) + "..." + str.slice(-back);
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            DevExpress.ui.notify("Đã copy: " + text, "success", 1200);
        }, function () {
            DevExpress.ui.notify("Không thể copy mã.", "error", 1200);
        });
    } else {
        // Fallback cho trình duyệt cũ / môi trường không có Clipboard API
        var $temp = $("<textarea readonly>").css({ position: "fixed", opacity: 0 }).val(text).appendTo("body");
        $temp[0].select();
        try {
            document.execCommand("copy");
            DevExpress.ui.notify("Đã copy: " + text, "success", 1200);
        } catch (err) {
            DevExpress.ui.notify("Không thể copy mã.", "error", 1200);
        }
        $temp.remove();
    }
}

function renderPcoCell(container, options) {
    var full = options.value != null ? String(options.value) : "";
    var display = truncateMiddle(full);

    var $wrap = $("<div>").addClass("qc-pco-cell");
    $("<span>")
        .addClass("qc-mono-col qc-pco-text")
        .text(display)
        .attr("title", full)
        .appendTo($wrap);

    if (full) {
        $("<i>")
            .addClass("bi bi-clipboard qc-copy-icon")
            .attr("title", "Copy mã PCO đầy đủ")
            .on("click", function (e) {
                e.stopPropagation();
                copyToClipboard(full);
            })
            .appendTo($wrap);
    }

    container.append($wrap);
}

function initFilter() {
    // Khởi tạo Từ ngày (Mặc định lấy ngày hiện tại hoặc lùi 7 ngày tùy ý)
    $("#txtFromDate").dxDateBox({
        type: "date",
        value: new Date(),
        displayFormat: "dd/MM/yyyy"
    });

    // Khởi tạo Đến ngày
    $("#txtToDate").dxDateBox({
        type: "date",
        value: new Date(),
        displayFormat: "dd/MM/yyyy"
    });

    $("#tagLine").dxTagBox({
        dataSource: lineData,
        displayExpr: "Text",
        valueExpr: "Value",
        searchEnabled: true,
        showSelectionControls: true
    });

    $("#tagPCO").dxTagBox({
        dataSource: pcoData,
        displayExpr: "Text",
        valueExpr: "Value",
        searchEnabled: true,
        showSelectionControls: true
    });

    $("#btnSearch").dxButton({
        text: "Search",
        icon: "search",
        type: "default",
        onClick: function () {
            loadReport();
        }
    });

    $("#btnExport").dxButton({
        text: "Excel",
        icon: "export",
        type: "success",
        onClick: function () {
            var selectedTabIndex = $("#tabReport").dxTabPanel("instance").option("selectedIndex");

            var fromDate = $("#txtFromDate").dxDateBox("instance").option("text");
            var toDate = $("#txtToDate").dxDateBox("instance").option("text");
            var lines = $("#tagLine").dxTagBox("instance").option("value") || [];
            var pcos = $("#tagPCO").dxTagBox("instance").option("value") || [];

            var $form = $("<form>", {
                method: "POST",
                action: "/Report/ExportExcel"
            });

            $form.append($("<input>", { type: "hidden", name: "FromDate", value: fromDate }));
            $form.append($("<input>", { type: "hidden", name: "ToDate", value: toDate }));
            $form.append($("<input>", { type: "hidden", name: "TabIndex", value: selectedTabIndex }));

            lines.forEach(function (line) {
                $form.append($("<input>", { type: "hidden", name: "SelectedLines", value: line }));
            });
            pcos.forEach(function (pco) {
                $form.append($("<input>", { type: "hidden", name: "SelectedPCONumbers", value: pco }));
            });

            $("body").append($form);
            $form.submit();
            $form.remove();
        }
    });
}

function initLoadPanel() {
    loadPanel = $("#loadPanel").dxLoadPanel({
        shadingColor: "rgba(0,0,0,0.4)",
        visible: false,
        showIndicator: true,
        showPane: true,
        shading: true
    }).dxLoadPanel("instance");
}

function initTab() {
    $("#tabReport").dxTabPanel({
        deferRendering: false,
        items: [
            {
                title: "Defect (Rework log)",
                template: function () {
                    return $("<div id='gridDefect'>");
                }
            },
            {
                title: "Checklist",
                template: function () {
                    return $("<div id='gridChecklist'>");
                }
            }
        ],
        onContentReady: function () {
            initDefectGrid();
            initChecklistGrid();
        }
    });
}

function initDefectGrid() {
    defectGrid = $("#gridDefect").dxDataGrid({
        dataSource: [],
        showBorders: true,
        columnAutoWidth: true,
        wordWrapEnabled: true,
        allowColumnResizing: true,
        columnResizingMode: "widget",
        rowAlternationEnabled: true,
        hoverStateEnabled: true,
        filterRow: { visible: true },
        headerFilter: { visible: true },
        columns: [
            {
                dataField: "Date",
                dataType: "date",
                format: "dd/MM/yyyy",
                selectedFilterOperation: "between",
                filterOperations: ["between", "=", ">", "<", ">=", "<="],
                cssClass: "qc-mono-col",
                minWidth: 115
            },
            { dataField: "Location", minWidth: 100 },
            { dataField: "line_id", caption: "Line ID", cssClass: "qc-mono-col", minWidth: 100 },
            { dataField: "QCName", caption: "QC Name", minWidth: 95 },
            { dataField: "BuyerSeason", caption: "Buyer Season", minWidth: 130 },
            { dataField: "PCONumber", caption: "PCO Number", cssClass: "qc-mono-col", minWidth: 180, cellTemplate: renderPcoCell },
            { dataField: "Style", minWidth: 90 },
            { dataField: "Color", minWidth: 130 },
            { dataField: "OrderQuantity", caption: "Order Quantity", minWidth: 130 },
            { dataField: "DefectCode", caption: "Defect Code", cssClass: "qc-mono-col", minWidth: 130 },
            { dataField: "DefectVN", caption: "Defect Code VN", minWidth: 140 },
            { dataField: "DefectENG", caption: "Defect Code END", minWidth: 200 }, // Cột mới
            { dataField: "Count", caption: "Rework Count", minWidth: 110 }         // Cột mới
        ],
        // Tô badge hổ phách cho "Số lần sửa" >= 2 — thuần trình bày,
        // giúp nhận diện nhanh lỗi bị sửa lại nhiều lần.
        onCellPrepared: function (e) {
            if (e.rowType === "data" && e.column.dataField === "Count") {
                var v = e.value;
                if (v !== null && v !== undefined && Number(v) >= 2) {
                    e.cellElement.html("<span class='qc-badge-warn'>" + v + "</span>");
                }
            }
        }
    }).dxDataGrid("instance");
}
function initChecklistGrid() {
    checklistGrid = $("#gridChecklist").dxDataGrid({
        dataSource: [],
        showBorders: true,
        columnAutoWidth: true,
        wordWrapEnabled: true,
        allowColumnResizing: true,
        columnResizingMode: "widget",
        rowAlternationEnabled: true,
        hoverStateEnabled: true,
        filterRow: { visible: true },
        headerFilter: { visible: true },
        columns: [
            {
                dataField: "Date",
                dataType: "date",
                format: "dd/MM/yyyy",
                selectedFilterOperation: "between",
                filterOperations: ["between", "=", ">", "<", ">=", "<="],
                cssClass: "qc-mono-col",
                minWidth: 115
            },
            { dataField: "Location", minWidth: 100 },
            { dataField: "line_id", caption: "Line ID", cssClass: "qc-mono-col", minWidth: 100 },
            { dataField: "QCName", caption: "QC Name", minWidth: 95 },
            { dataField: "BuyerSeason", caption: "Buyer Season", minWidth: 130 },
            { dataField: "PCONumber", caption: "PCO Number", cssClass: "qc-mono-col", minWidth: 180, cellTemplate: renderPcoCell },
            { dataField: "Style", minWidth: 90 },
            { dataField: "Color", minWidth: 130 },
            { dataField: "OrderQuantity", caption: "Order Quantity", minWidth: 130 },
            { dataField: "ChecklistTime", caption: "Checklist Time", cssClass: "qc-mono-col", minWidth: 130 },
            { dataField: "ChecklistNames", caption: "Checklist Names", minWidth: 150 },
            { dataField: "ChecklistCount", caption: "Checklist Count", minWidth: 140 }
        ],
        // Tô badge ĐỎ cho "Check list count" = 0 — cảnh báo chưa
        // kiểm tra đủ công cụ (kim, kéo, thước...) tại thời điểm đó.
        onCellPrepared: function (e) {
            if (e.rowType === "data" && e.column.dataField === "ChecklistCount") {
                var v = e.value;
                if (v !== null && v !== undefined && Number(v) === 0) {
                    e.cellElement.html("<span class='qc-badge-fail'>" + v + "</span>");
                }
            }
        }
    }).dxDataGrid("instance");
}

function loadReport() {
    var model = {
        FromDate: $("#txtFromDate").dxDateBox("instance").option("text"),
        ToDate: $("#txtToDate").dxDateBox("instance").option("text"),

        SelectedLines: $("#tagLine").dxTagBox("instance").option("value"),
        SelectedPCONumbers: $("#tagPCO").dxTagBox("instance").option("value")
    };

    $.ajax({
        url: "/Report/Search",
        type: "POST",
        traditional: true,
        data: model,
        beforeSend: function () {
            loadPanel.show();
        },
        success: function (response) {
            if (!response.Success) {
                DevExpress.ui.notify(response.Message, "error", 2000);
                return;
            }

            var dData = response.DefectData || response.defectData || [];
            var cData = response.ChecklistData || response.checklistData || [];

            defectGrid.option("dataSource", dData);
            checklistGrid.option("dataSource", cData);
        },
        error: function () {
            DevExpress.ui.notify("Load failed", "error", 2000);
        },
        complete: function () {
            loadPanel.hide();
        }
    });
}