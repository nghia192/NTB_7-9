var defectGrid, checklistGrid, loadPanel;

$(function () {
    initFilter();
    initLoadPanel();
    initTab();
});

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
        filterRow: { visible: true },
        headerFilter: { visible: true },
        columns: [
            {
                dataField: "Date",
                dataType: "date",
                format: "dd/MM/yyyy",
                selectedFilterOperation: "between",
                filterOperations: ["between", "=", ">", "<", ">=", "<="] },
            { dataField: "Location" },
            { dataField: "line_id", caption: "line_id" },
            { dataField: "QCName", caption: "QC name" },
            { dataField: "BuyerSeason", caption: "Buyer.Season" },
            { dataField: "PCONumber", caption: "PCO Number" },
            { dataField: "Style" },
            { dataField: "Color" },
            { dataField: "OrderQuantity", caption: "Order quantity" },
            { dataField: "DefectCode", caption: "Defect codes" },
            { dataField: "DefectVN", caption: "Defect code VN" },
            { dataField: "DefectENG", caption: "Defect code END" }, // Cột mới
            { dataField: "Count", caption: "Số lần sửa" }          // Cột mới
        ]
    }).dxDataGrid("instance");
}
function initChecklistGrid() {
    checklistGrid = $("#gridChecklist").dxDataGrid({
        dataSource: [],
        showBorders: true,
        columnAutoWidth: true,
        filterRow: { visible: true },
        headerFilter: { visible: true },
        columns: [
            {
                dataField: "Date",
                dataType: "date",
                format: "dd/MM/yyyy",
                selectedFilterOperation: "between",
                filterOperations: ["between", "=", ">", "<", ">=", "<="]
            },
            { dataField: "Location" },
            { dataField: "line_id", caption: "line_id" },
            { dataField: "QCName", caption: "QC name" },
            { dataField: "BuyerSeason", caption: "Buyer.Season" },
            { dataField: "PCONumber", caption: "PCO Number" },
            { dataField: "Style" },
            { dataField: "Color" },
            { dataField: "OrderQuantity", caption: "Order quantity" },
            { dataField: "ChecklistTime", caption: "Check list time" },
            { dataField: "ChecklistNames", caption: "Check list names" },
            { dataField: "ChecklistCount", caption: "Check list count" }
        ]
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