BaseFoundation.requireClass("BaseSingleDevextremeLookup");

class ChuyenMayLookup extends BaseSingleDevextremeLookup {
    constructor(Container, Key, Datasource, Setting, Appearance, Events) {
        super(Container, Key, Datasource, Setting, Appearance, Events);
    }

    buildDefaultColumns() {
        const self = this;
        self.Columns = [
            {
                dataField: "TenChuyenMay",
                caption: "Chuyền may",
                allowEditing: true,
                sortOrder: "asc",
            },            
        ];
        self.ColumnFields = self.Columns
            .filter(col => col.dataField)
            .map(col => col.dataField);
        return self.Columns;
    }
}