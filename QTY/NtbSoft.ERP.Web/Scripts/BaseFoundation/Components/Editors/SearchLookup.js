

class BaseSingleDevextremeLookup {
    constructor(Container, Key, Datasource, Setting, Appearance, Events) {
        this.Container = Container;
        this.Key = Key;
        this.Datasource = Datasource || [];
        this.Appearance = {
            dropdown: {
                theme: Appearance?.theme ?? "primary",

                classes: {
                    lookup: Appearance?.classes?.lookup ?? "",
                    header: Appearance?.classes?.header ?? "",
                    body: Appearance?.classes?.body ?? "",
                    footer: Appearance?.classes?.footer ?? ""
                },

                styles: {
                    lookup: Appearance?.styles?.lookup ?? {},
                    header: Appearance?.styles?.header ?? {},
                    body: Appearance?.styles?.body ?? {},
                    footer: Appearance?.styles?.footer ?? {}
                }
            },
            grid: {
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
        };
        this.Setting = {
            dropdown: {
                placeholder: Setting?.dropdown?.placeholder ?? "Chọn...",
                display: Setting?.dropdown?.display ?? "",
                options: {
                    container: "body",
                    width: Setting?.dropdown?.width ?? "50vw",
                    maxWidth: Setting?.dropdown?.maxWidth ?? "500px",
                    minWidth: Setting?.dropdown?.minWidth ?? "500px",
                    wrapperAttr: {
                        class: [
                            "lookup-popup-no-padding",
                            this.getThemeClass(),
                            this.Appearance?.dropdown?.classes?.lookup
                        ]
                            .filter(Boolean)
                            .join(" ")
                    },
                    position: {
                        my: "left top",
                        at: "left bottom",
                        of: Container,
                        collision: "flipfit"
                    },
                }
            },
            grid: {
                keyExpr: Key,
                height: Setting?.grid?.height ?? "70vh",
                wordWrapEnabled: true,
                showBorders: true,
                showRowLines: true,
                showColumnLines: true,
                rowAlternationEnabled: true,
                paging: { pageSize: 10 },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50],
                    showInfo: true
                },
                scrolling: {
                    mode: "virtual",
                    useNative: true
                },
                filterRow: {
                    visible: true
                },
                selection: { mode: "single" },
            }
        };

        
        this.Events = Events || {};

        this.BaseData = {};
        this.Columns = [];
        this.ColumnFields = [];

        this.Instance = null;
        this.GridInstance = null;
    }

    render() {
        const self = this;
        console.log(self.Datasource)
        const col = self.buildDefaultColumns();
        this.Instance = $(self.Container).dxDropDownBox({
            valueExpr: self.Key,
            dataSource: self.Datasource,
            placeholder: self.Setting.dropdown.placeholder,
            displayExpr: item => self.buildDisplayExpr(item),
            
            contentTemplate(e) {
                const dropDown = e.component;
                const $grid = $("<div>").dxDataGrid({
                    keyExpr: self.Key,
                    dataSource: self.Datasource,
                    ...self.Setting.grid,

                    columns: col,

                    onSelectionChanged(sel) {
                        const row = sel.selectedRowsData[0];
                        
                        if (!row) return;

                        self.value = row;
                        dropDown.option("value", row[self.Key]);
                        dropDown.close();
                        self.Events.onChanged(row);
                    },
                    onCellPrepared(e) {
                        if (e.rowType === "header") {
                            e.cellElement.css({
                                ...self.Appearance.grid.cell.header
                            });
                        }
                    },

                    onRowPrepared(e) {
                        if (e.rowType === "data") {
                            e.rowElement.css({
                                ...self.Appearance.grid.row.data
                            });
                        }
                    }
                });
                self.GridInstance = $grid.dxDataGrid("instance");
                return $grid;
            },
            dropDownOptions: {
                ...self.Setting.dropdown.options,
                onShown: () => {
                    setTimeout(() => {
                        self.GridInstance?.updateDimensions();
                        self.GridInstance?.repaint();
                    }, 0);
                }
            }
        }).dxDropDownBox("instance");
    }
    async select(key, triggerEvent = false) {
        if (!this.Instance) return;
        const row = this.Datasource.find(x => x[this.Key] == key);

        if (!row) {
            this.Instance.option("value", null);
            this.GridInstance?.clearSelection();
            this.value = null;
            return;
        }

        this.value = row;
        this.Instance.option("value", key);
        this.GridInstance?.selectRows([key], false);

        if (triggerEvent) {
            await this.Events.onChanged?.(row);
        }
    }
    async selectFirst(triggerEvent = false) {
        if (!this.Datasource?.length) {
            return;
        }

        const row = this.Datasource[0];

        await this.select(
            row[this.Key],
            triggerEvent
        );
    }
    buildDisplayExpr(item) {
        if (!item) return "";
        const template = this.Setting.dropdown.display;
        if (!template) {
            return item[this.Key] ?? "";
        }
        return template.replace(
            /\{(\w+)\}/g,
            (match, field) => item[field] ?? ""
        );
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

    getThemeClass() {
        return `lookup-${this.Appearance?.dropdown.theme}`;
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
        this.Instance?.endUpdate();

        this.GridInstance?.option("dataSource", this.Datasource);
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

BaseFoundation.registerClass("BaseSingleDevextremeLookup", BaseSingleDevextremeLookup);