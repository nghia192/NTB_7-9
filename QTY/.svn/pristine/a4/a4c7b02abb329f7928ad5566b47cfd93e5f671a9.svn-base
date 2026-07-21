

class BaseDevExtremeGrid {
    constructor(Container, Datasource, Setting, Appearance, Events) {
        this.Container = Container;
        this.Datasource = Datasource || [];
        this.Setting = {
            keyExpr: Setting?.keyExpr ?? "_key",
            columnAutoWidth: Setting?.columnAutoWidth ?? false,
            filterRow: { visible: true },
            focusedRowEnabled: Setting?.focusedRowEnabled ?? true,
            focusedRowIndex: 0,
            grouping: { autoExpandAll: true },
            noDataText: "Chưa có dữ liệu",
            rowAlternationEnabled: Setting?.rowAlternationEnabled ?? true,
            showBorders: true,           
            showRowLines: true,
            showColumnLines: true,            
            wordWrapEnabled: true,
            editing: {
                mode: "cell",
                allowUpdating: Setting?.editing?.allowUpdating ?? true
            },
            rowDragging: {
                allowReordering: Setting?.rowDragging?.allowReordering ?? false,
                showDragIcons: Setting?.rowDragging?.showDragIcons ?? false,
                sortField: Setting?.rowDragging?.sortField ?? null,

                onReorder: (e) => {

                    const sortField = this.Setting.rowDragging.sortField;

                    if (!sortField) {
                        return;
                    }

                    const visibleRows = e.component.getVisibleRows();

                    const movedRow = visibleRows[e.fromIndex].data;

                    const oldSort = Number(movedRow[sortField]);
                    const newSort = e.toIndex + 1;

                    if (oldSort === newSort) {
                        return;
                    }

                    if (oldSort < newSort) {

                        this.Datasource.forEach(item => {

                            if (
                                item[sortField] > oldSort &&
                                item[sortField] <= newSort
                            ) {
                                item[sortField]--;
                            }

                        });

                    }
                    else {

                        this.Datasource.forEach(item => {

                            if (
                                item[sortField] >= newSort &&
                                item[sortField] < oldSort
                            ) {
                                item[sortField]++;
                            }

                        });

                    }

                    movedRow[sortField] = newSort;

                    this.Datasource.sort(
                        (a, b) => a[sortField] - b[sortField]
                    );

                    e.component.option("dataSource", this.Datasource);
                    e.component.refresh();

                    this.Events.onMoved?.({
                        row: movedRow,
                        from: oldSort,
                        to: newSort,
                        data: this.Datasource
                    });

                }
            }
        }
        this.Appearance = {
            row: {
                header: {
                    backgroundColor: Appearance?.row?.header?.backgroundColor || "#0d6efd",
                    fontWeight: Appearance?.row?.header?.fontWeight || "bold",
                    textAlign: Appearance?.row?.header?.textAlign || "center",
                    color: Appearance?.row?.header?.color || "white"
                },
                data: {
                    backgroundColor: Appearance?.row?.data?.backgroundColor || "#ffffff",
                    fontWeight: Appearance?.row?.data?.fontWeight || "normal",
                    textAlign: Appearance?.row?.data?.textAlign || "center",
                    color: Appearance?.row?.data?.color || "black"
                }
            },
            cell: {
                header: {
                    backgroundColor: Appearance?.cell?.header?.backgroundColor || "#0d6efd",
                    fontWeight: Appearance?.cell?.header?.fontWeight || "bold",
                    textAlign: Appearance?.cell?.header?.textAlign || "center",
                    color: Appearance?.cell?.header?.color || "white"
                },
                data: {
                    backgroundColor: Appearance?.cell?.data?.backgroundColor || "#ffffff",
                    fontWeight: Appearance?.cell?.data?.fontWeight || "bold",
                    textAlign: Appearance?.cell?.data?.textAlign || "center",
                    color: Appearance?.cell?.data?.color || "black"
                }
            }
        }
        this.Events = Events || {};

        this.BaseData = {};
        this.Columns = [];
        this.ColumnFields = [];
        this.ColumnStyles = [];
        this.Summaries = {
            totalItems: [],
            groupItems: []
        };
        this.Instance = null;
    }

    render() {
        const self = this;
        this.Instance = $(self.Container).dxDataGrid({
            dataSource: self.Datasource,
            ...self.Setting,
            columns: self.buildDefaultColumns(),
            summary: self.Summaries,
            onCellPrepared(e) {
                if (e.rowType === "header") {
                    e.cellElement.css({
                        ...self.Appearance.cell.header
                    });
                }
                self.applyColumnStyle(e);
            },
            onRowPrepared(e) {
                if (e.rowType === "data") {
                    e.rowElement.css({
                        ...self.Appearance.row.data
                    });
                }
            },
            onFocusedRowChanged(e) {
                if (!e.row || e.row.rowType !== "data") return;
                self.Events.onFocusedRowChanged?.(e.row.data);
            }
        }).dxDataGrid("instance");
        $("#Layer_1").click()
    }
    setColumnStyle(option = {}) {

        if (!option.column)
            return;

        const style = {
            column: option.column,
            header: option.header ?? false,
            data: option.data ?? true,
            css: option.css ?? {},
            condition: option.condition ?? null
        };

        const index = this.ColumnStyles.findIndex(
            x => x.column === style.column
        );

        if (index >= 0)
            this.ColumnStyles[index] = style;
        else
            this.ColumnStyles.push(style);

        this.Instance?.refresh();
    }
    removeColumnStyle(column) {

        this.ColumnStyles =
            this.ColumnStyles.filter(
                x => x.column !== column
            );

        this.Instance?.refresh();
    }
    clearColumnStyles() {

        this.ColumnStyles = [];

        this.Instance?.refresh();
    }
    getColumnStyle(column) {

        return this.ColumnStyles.find(
            x => x.column === column
        );
    }
    applyColumnStyle(e) {

        if (!e.column)
            return;

        const style =
            this.getColumnStyle(
                e.column.dataField
            );

        if (!style)
            return;

        if (
            e.rowType == "header" &&
            !style.header
        )
            return;

        if (
            e.rowType == "data" &&
            !style.data
        )
            return;

        if (
            style.condition &&
            !style.condition(e)
        )
            return;

        e.cellElement.css(style.css);
    }
    updateSort(sortField = "Sort", start = 1) {
        if (!Array.isArray(this.Datasource)) {
            return;
        }

        this.Datasource.forEach((row, index) => {
            row[sortField] = start + index;
        });
    }
    updateKeySort(sortField = "Sort", key = "", start = 1) {
        if (!Array.isArray(this.Datasource)) {
            return;
        }

        this.Datasource.forEach((row, index) => {
            const sort = start + index;
            row[sortField] = key + sort;
        });
    }
    buildRows(rows = [], index = null, action = "insert", keyField = "_key", sortField = null) {
        if (!Array.isArray(rows) || !rows.length) return;
        if (!Array.isArray(this.Datasource)) {
            this.Datasource = [];
        }
        if (action == "insert") {
            let addrows = [];
            $.each(rows, (index, row) => {
                const newrow = {};
                this.ColumnFields.forEach(field => {
                    newrow[field] = "";
                });
                Object.assign(newrow, row);
                addrows.push(newrow);
            });
            if (index == null) this.Datasource.push(...addrows);
            else this.Datasource.splice(index, 0, ...addrows);
        }
        else if (action == "delete") {
            const removeKeys = new Set(
                rows.map(x => x[keyField])
            );
            this.Datasource = this.Datasource.filter(
                x => !removeKeys.has(x[keyField])
            );
        }
        if (sortField) {
            this.updateSort(sortField);
        }
        this.Instance?.option("dataSource", this.Datasource);
    }
    buildDefaultColumns() {
        const self = this;
        this.Columns = [
            {
                caption: "",
                width: 50,
                alignment: "center",
                allowSorting: false,
                allowFiltering: false,
                allowResizing: false,
                allowReordering: false,

                headerCellTemplate: function (header, info) {
                    $("<div>")
                        .dxButton({
                            icon: "refresh",
                            hint: "Reload dữ liệu",
                            stylingMode: "text",
                            elementAttr: {
                                class: "btn-reload-header"
                            },
                            onClick: () => {
                                self.Events.onReload?.();
                            }
                        })
                        .appendTo(header);
                }
            },
            {
                dataField: "Ten",
                caption: "Tên",
                width: 70
            },
            {
                dataField: "MoTa",
                caption: "Mô tả",
                width: 70
            },
        ];
        this.ColumnFields = this.Columns
            .filter(col => col.dataField)
            .map(col => col.dataField);
        return this.Columns;
    }
    addColumn(column, index = null) {
        if (!column) return;
        if (index == null) {
            this.Columns.push(column);
        }
        else {
            this.Columns.splice(index, 0, column);
        }
        this.refreshColumns();
    }
    removeColumn(dataField) {
        this.Columns = this.Columns.filter(
            x => x.dataField !== dataField
        );

        this.refreshColumns();
    }
    addGroup(groupName) {
        this.Columns.push({
            caption: groupName,
            name: groupName,
            columns: []
        });

        this.refreshColumns();
    }
    addGroupColumn(groupName, column, index = null) {
        const group = this.Columns.find(
            x => x.name === groupName
        );

        if (!group) return;

        group.columns ??= [];

        if (index == null) {
            group.columns.push(column);
        }
        else {
            group.columns.splice(index, 0, column);
        }

        this.refreshColumns();
    }
    removeGroupColumn(groupName, dataField) {
        const group = this.Columns.find(
            x => x.name === groupName
        );

        if (!group) return;

        group.columns = group.columns.filter(
            x => x.dataField !== dataField
        );

        this.refreshColumns();
    }
    removeGroup(groupName) {
        this.Columns = this.Columns.filter(
            x => x.name !== groupName
        );

        this.refreshColumns();
    }
    refreshColumns() {
        this.ColumnFields = [];

        const walk = (columns) => {
            columns.forEach(col => {

                if (col.dataField) {
                    this.ColumnFields.push(col.dataField);
                }

                if (col.columns) {
                    walk(col.columns);
                }
            });
        };

        walk(this.Columns);

        this.Instance?.option("columns", this.Columns);
    }
    checkRequired(fields) {
        if (!Array.isArray(fields)) {
            fields = [fields];
        }

        for (const row of this.Datasource) {
            for (const field of fields) {
                const value = row[field];

                if (value == null || String(value).trim() == "") {
                    return {
                        result: false,
                        row,
                        field,
                        value
                    };
                }
            }
        }

        return {
            result: true
        };
    }
    buildBaseData(data = {}, action = "create") {
        if (!data || typeof data !== "object") return;
        switch (action) {
            case "create":
                this.BaseData = { ...data };
                break;
            case "insert":
                this.BaseData ??= {};
                Object.assign(this.BaseData, data);
                break;
            case "delete":
                this.BaseData ??= {};
                Object.keys(data).forEach(key => {
                    delete this.BaseData[key];
                });
                break;
        }
    }
    setCellValue(keyValue, dataField, value) {
        if (!this.Instance || !dataField) {
            return;
        }

        const keyField = this.Setting.keyExpr;

        const row = this.Datasource.find(
            x => x[keyField] === keyValue
        );

        if (!row) {
            return;
        }

        row[dataField] = value;

        const rowIndex = this.Instance.getRowIndexByKey(keyValue);

        if (rowIndex < 0) {
            this.Instance.refresh();
            return;
        }

        this.Instance.cellValue(
            rowIndex,
            dataField,
            value
        );
    }
    async closeEdit() {
        if (!this.Instance) {
            return;
        }

        if (typeof this.Instance.saveEditData === "function") {
            await this.Instance.saveEditData();
        }
    }
    refreshSummary() {
        this.Instance?.option("summary", this.Summaries);
    }
    addTotalSummary(summary) {
        this.Summaries.totalItems.push(summary);
        this.refreshSummary();
    }
    addGroupSummary(summary) {
        this.Summaries.groupItems.push(summary);
        this.refreshSummary();
    }
    removeSummary(column, summaryType = null) {

        const filter = item =>
            item.column !== column ||
            (summaryType && item.summaryType !== summaryType);

        this.Summaries.totalItems =
            this.Summaries.totalItems.filter(filter);

        this.Summaries.groupItems =
            this.Summaries.groupItems.filter(filter);

        this.refreshSummary();
    }
    clearSummary() {

        this.Summaries = {
            totalItems: [],
            groupItems: []
        };

        this.refreshSummary();
    }
    getColumnFields() {
        return this.ColumnFields;
    }
    getDataSource() {
        return this.Datasource;
    }
    getBaseData() {
        return this.BaseData;
    }
    
    setReferenceDataSource(data) {
        this.Datasource = data || [];
        this.Instance?.beginUpdate();
        this.Instance?.option("dataSource", this.Datasource);
        this.Instance?.refresh();
        this.Instance?.endUpdate();
    }
    setDataSource(data) {
        this.Datasource = data.map(x => ({ ...x }));
        this.Instance?.beginUpdate();
        this.Instance?.option("dataSource", this.Datasource);
        this.Instance?.refresh();
        this.Instance?.endUpdate();
    }
    setBaseData(data) {
        if (!this.BaseData) return;
        Object.keys(this.BaseData).forEach(key => {
            if (key in data) {
                this.BaseData[key] = data[key];
            }
        });
    }
    
    dispose() {
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseDevExtremeGrid", BaseDevExtremeGrid);