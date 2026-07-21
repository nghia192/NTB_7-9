

class BaseExcelHelper {
    constructor() {

    }

}

class BaseImportExcelHelper extends BaseExcelHelper {

    constructor() {
        super();

        this.Setting = {
            datatable: [],
            keyvalue: []
        };

        this.File = null;
        this.Workbook = null;
        this.Worksheet = null;
    }

    getWorksheet() {
        return this.Worksheet;
    }
    getColLetter(num) {
        let letter = "";
        while (num > 0) {
            let modulo = (num - 1) % 26;
            letter = String.fromCharCode(65 + modulo) + letter;
            num = Math.floor((num - modulo) / 26);
        }
        return letter;
    }
    getColNumber(letter) {
        if (!letter || typeof letter !== 'string') return 0;

        letter = letter.toUpperCase().replace(/[^A-Z]/g, '');
        let num = 0;
        for (let i = 0; i < letter.length; i++) {
            num = num * 26 + (letter.charCodeAt(i) - 64);
        }
        return num;
    }
    getSheetRange() {
        if (!this.Worksheet) return;

        let actualRowCount = 0;
        let actualColumnCount = 0;

        this.Worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            let hasValue = false;

            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                hasValue = true;

                if (colNumber > actualColumnCount) {
                    actualColumnCount = colNumber;
                }
            });

            if (hasValue) {
                actualRowCount = rowNumber;
            }
        });

        return {
            actualColumnCount: actualColumnCount,
            actualRowCount: actualRowCount
        };
    }

    getResultDataTable(tablename) {
        const datatable = this.Setting.datatable.find(item => item.name == tablename);
        if (!datatable) return;
        return datatable.result;
    }

    selectFile() {
        return new Promise((resolve) => {
            const input = document.createElement("input");

            input.type = "file";
            input.accept = ".xlsx,.xls";

            input.onchange = (e) => {
                const file = e.target.files[0];

                this.File = file || null;

                resolve(this.File);
            };

            input.click();
        });
    }
    async open() {
        if (!this.File) {
            throw new Error("Chưa chọn file Excel");
        }

        const buffer = await this.File.arrayBuffer();

        this.Workbook = new ExcelJS.Workbook();

        await this.Workbook.xlsx.load(buffer);

        this.Worksheet =
            this.Workbook.worksheets[0];

        return this.Workbook;
    }
    async chooseAndOpen() {
        const file = await this.selectFile();

        if (!file)
            return null;

        return await this.open();
    }

    addDataTable(datatable = []) {
        if (!Array.isArray(datatable) || !datatable.length) return;
        const checkunique = new Set(datatable.map(item => item.name)).size === datatable.length;
        if (!checkunique) return;
        datatable.forEach(item => {
            this.Setting.datatable.push({
                name: item.name,
                type: item.type,
                direction: item.direction,
                columns: [],
                groupRows: [],
                summaryRows: {
                    total: [],
                    group: []
                },
                result: []
            })
        })
    }
    clearDataTable() {
        this.Setting.datatable = [];
    }

    buildColumns(tablename = "", data = []) {
        if (!Array.isArray(data) || !data.length) return;
        const datatable = this.Setting.datatable.find(item => item.name == tablename);
        if (!datatable) return;
        data.forEach(item => {
            datatable.columns.push({
                header: {
                    caption: item.caption,
                    dataField: item.dataField,
                    position: item.position,
                    type: item.type,
                    mergeState: {
                        isMerge: item.isMerge ?? 0,
                        range: {
                            top: item.top,
                            right: item.right,
                            bottom: item.bottom,
                            left: item.left
                        }
                    },
                },
                data: {
                    type: item.data.type,
                    format: item.data.format,
                    formulas: item.data.formulas,
                    isNull: item.data.isNull,
                    staticValue: item.data.staticValue
                }
            })
        })
    }

    readDataTable(tablename) {
        const datatable = this.Setting.datatable.find(item => item.name == tablename);
        if (!datatable) return;
        const self = this;
        const sheetrange = this.getSheetRange();
        const maxColumn = sheetrange.actualColumnCount;
        let isHeaderFound = false;
        datatable.result = [];
        this.Worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            const datarow = [];
            for (let col = 1; col <= maxColumn; col++) {
                const cell = row.getCell(col);
                datarow.push({
                    colIndex: col,
                    conName: self.getColLetter(col),
                    value: cell.value === undefined ? "[empty]" : cell.value
                });
            }
            if (!isHeaderFound) {
                const isHeader = self.detectHeader(datatable, datarow);
                if (isHeader) {
                    isHeaderFound = true;
                    console.log(`📌 Đã tìm thấy Header tại dòng: ${rowNumber}`);
                }
                return;
            }
            const isValidDataRow = self.detectDataRow(datatable, datarow);
            if (isValidDataRow) {
                const rowData = {};
                datatable.columns.forEach(col => {
                    const cell = datarow.find(c => c.colIndex === col.actualColIndex);

                    let finalValue = cell.value === "[empty]" ? null : cell.value;
                    if (finalValue && typeof finalValue === 'object' && finalValue.richText) {
                        finalValue = finalValue.richText.map(p => p.text).join("");
                    }

                    rowData[col.header.dataField] = { caption: col.header.caption, value: finalValue };
                });

                datatable.result.push(rowData);
                //console.log(`✅ Đã đọc dòng dữ liệu hợp lệ ${rowNumber}:`, rowData);
            } else {
                console.log(`⚠️ Bỏ qua dòng không đúng định dạng (Rác/Group/Summary) tại dòng: ${rowNumber}`);
            }
        });
        return datatable.result;
    }

    detectHeader(datatable, datarow) {
        let matchedCount = 0;
        datatable.columns.forEach(col => col.actualColIndex = null);
        datatable.columns.forEach(col => {
            const captions = Array.isArray(col.header.caption)
                ? col.header.caption.map(c => this.cleanText(c))
                : [this.cleanText(col.header.caption)];
            const matchedCell = datarow.find(cell => {
                let cellText = "";

                if (cell.value && typeof cell.value === 'object' && cell.value.richText) {
                    cellText = cell.value.richText.map(part => part.text).join(" ");
                } else {
                    cellText = String(cell.value === "[empty]" ? "" : cell.value);
                }
                const cleanedCellText = this.cleanText(cellText);

                return captions.some(caption => cleanedCellText.includes(caption) && caption !== "");
            });
            if (matchedCell) {
                col.actualColIndex = matchedCell.colIndex;
                matchedCount++;
            }
        })
        return matchedCount === datatable.columns.length;
    }

    detectDataRow(datatable, datarow) {
        return datatable.columns.every((col) => {
            // Nếu cột này không tìm thấy ở bước detectHeader, coi như dòng này không hợp lệ
            if (!col.actualColIndex) return false;

            // Tìm đúng ô dựa vào actualColIndex đã lưu lúc quét Header
            const cell = datarow.find(c => c.colIndex === col.actualColIndex);
            const cellValue = cell?.value === "[empty]" ? null : cell?.value;

            const data = col.data;

            // --- TRƯỜNG HỢP 1: Ô TRỐNG (Null / Undefined) ---
            if (cellValue === null || cellValue === undefined || cellValue === "") {
                return data.isNull;
            }

            // --- TRƯỜNG HỢP 2: RICH TEXT ---
            if (cellValue && typeof cellValue === 'object' && cellValue.richText) {
                if (data.type !== "richtext") return false;
                return cellValue.richText.every(part => typeof part.text === data.format);
            }

            if (data.type === "value") {
                let isCorrectFormat = false;
                if (data.format === "date") {
                    isCorrectFormat = cellValue instanceof Date;
                } else {
                    isCorrectFormat = typeof cellValue === data.format;
                }

                if (!isCorrectFormat) return false;

                if (data.staticValue !== null && data.staticValue !== undefined) {
                    return data.staticValue === cellValue;
                }

                return true;
            }

            return false;
        });
    }

    cleanText(text) {
        if (text === undefined || text === null) return "";

        return String(text)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '');
    }
}