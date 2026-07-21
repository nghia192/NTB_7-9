BaseFoundation.requireClass("BaseDevextremeGridPopover");

class PhanLoaiLoiPopover extends BaseDevextremeGridPopover {
    constructor(Container, Key, Datasource, Setting, Appearance, Events) {
        super(Container, Key, Datasource, Setting, Appearance, Events);
    }

    buildDefaultColumns() {
        const self = this;
        self.Columns = [
            {
                dataField: "TenHangMucLoi",
                caption: "Nhóm dạng lỗi",
                allowEditing: false,
                width: 250
            },
            {
                dataField: "CodeHangMucLoi",
                caption: "Code dạng lỗi",
                allowEditing: false,
                width: 100
            },            
            {
                dataField: "GhiChu",
                caption: "Ghi chú",
                allowEditing: false,
                minWidth: 100
            },
        ];
        self.ColumnFields = self.Columns
            .filter(col => col.dataField)
            .map(col => col.dataField);
        return self.Columns;
    }
}