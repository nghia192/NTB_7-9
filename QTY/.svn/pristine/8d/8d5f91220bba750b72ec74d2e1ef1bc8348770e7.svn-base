BaseFoundation.requireClass("BaseDevExtremeGrid");

class PCOGrid extends BaseDevExtremeGrid {
    constructor(Container, Datasource, Setting, Appearance, Events) {
        super(Container, Datasource, Setting, Appearance, Events);
    }

    buildDefaultColumns() {
        const self = this;
        self.Columns = [
            {
                dataField: "TenPCO",
                caption: "PCO",
                allowSorting: false,
                allowEditing: false,
                width: 120
            },
            {
                dataField: "MoTaHang",
                caption: "Style",
                allowSorting: false,
                allowEditing: false,
                minWidth: 90
            },
            {
                dataField: "TenHang",
                caption: "Mã hàng",
                allowSorting: false,
                allowEditing: false,
                width: 100
            },
            {
                dataField: "TenKH",
                caption: "Khách hàng",
                allowSorting: false,
                allowEditing: false,
                width: 100
            },
            {
                dataField: "TrangThaiPCO",
                caption: "Trạng thái",
                allowSorting: false,
                allowEditing: false,
                width: 200
            },
            {
                dataField: "Season",
                caption: "Season",
                alignment: "center",
                allowSorting: false,
                allowEditing: false,
                width: 70
            },
            {
                dataField: "SeasonBuy",
                caption: "Season Buy",
                alignment: "center",
                allowSorting: false,
                allowEditing: false,
                width: 150
            },
            {
                dataField: "NewCo",
                caption: "NEW/CO",
                alignment: "center",
                allowSorting: false,
                allowEditing: false,
                width: 90
            },
            {
                dataField: "SoLuong",
                caption: "Số lượng",
                alignment: "center",
                allowSorting: false,
                allowEditing: false,
                width: 70
            },
            {
                dataField: "TGGiaoHangDK",
                caption: "Ngày giao hàng",
                alignment: "right",
                allowSorting: false,
                allowEditing: false,
                width: 120,
                calculateCellValue: (row) => {
                    if (!row.TGGiaoHangDK) return "";
                    return new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour12: false
                    }).format(new Date(row.TGGiaoHangDK));
                }
            },     
        ];
        self.ColumnFields = self.Columns
            .filter(col => col.dataField)
            .map(col => col.dataField);
        return self.Columns;
    }
}

class PCOChiTietGrid extends BaseDevExtremeGrid {
    constructor(Container, Datasource, Setting, Appearance, Events) {
        super(Container, Datasource, Setting, Appearance, Events);
    }

    buildDefaultColumns() {
        const self = this;
        self.Columns = [
            {
                dataField: "TenMau",
                caption: "Màu",
                allowSorting: false,
                allowEditing: false,
                sortOrder: "asc",
                minWidth: 250
                //groupIndex: 0
            },
            {
                dataField: "TenChuyenMay",
                caption: "Chuyền may",
                allowSorting: false,
                allowEditing: false,
                width: 120
            },
            {
                dataField: "NhomSize",
                caption: "Nhóm size",
                allowSorting: false,
                allowEditing: false,
                width: 80
            },
             
        ];
        self.ColumnFields = self.Columns
            .filter(col => col.dataField)
            .map(col => col.dataField);
        return self.Columns;
    }
}

class ChiaChuyenGrid extends BaseDevExtremeGrid {
    constructor(Container, Datasource, Setting, Appearance, Events) {
        super(Container, Datasource, Setting, Appearance, Events);
    }

    buildDefaultColumns() {
        const self = this;
        self.Columns = [           
            {
                dataField: "TenMau",
                caption: "Màu",
                allowSorting: false,
                allowEditing: false,
                minWidth: 150,
                fixed: true,
                fixedPosition: "left"
            },
        ];
        self.ColumnFields = self.Columns
            .filter(col => col.dataField)
            .map(col => col.dataField);
        return self.Columns;
    }
}