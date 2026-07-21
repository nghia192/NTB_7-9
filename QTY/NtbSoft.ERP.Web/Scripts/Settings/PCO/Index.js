

class PCOModule {
    constructor(Container) {
        this.Name = this.constructor.name;
        this.Container = Container;

        this.helper = {
            generate: new GenerateHelper(),
            parse: new ParseHelper(),
            excel: {
                import: new BaseImportExcelHelper(),
            }
        };
        this.baseapi = new BaseFetchAPI("/api/Common");

        this.module = {
            toast: {
                id: this.Name + "Toast",
                instance: null
            },
            loading: {
                id: this.Name + "Loading",
                instance: null
            },
            splitter: {
                id: this.Name + "Splitter",
                instance: null,
                first: {
                    card: {
                        id: this.Name + "PCOCard",
                        instance: null,
                        grid: {
                            id: this.Name + "PCOGrid",
                            instance: null
                        },
                        button: {
                            import: {
                                id: this.Name + "ImportButton",
                                instance: null,
                                loading: {
                                    id: this.Name + "ImportLoading",
                                    instance: null
                                }
                            },
                        }
                    }
                },
                second: {
                    card: {
                        id: this.Name + "PCOChiTietCard",
                        instance: null,
                        grid: {
                            id: this.Name + "PCOChiTietGrid",
                            instance: null,
                            params: {
                                MaPCO: null,
                                Columns: []
                            },
                            
                        },
                        
                        button: {
                            sew: {
                                id: this.Name + "SewButton",
                                instance: null,
                                popup: {
                                    id: this.Name + "SewPopup",
                                    instance: null,
                                    loading: {
                                        id: this.Name + "SewLoading",
                                        instance: null,
                                        index: this.Name + "SewLoadingIndex",
                                    },
                                    lookup: {
                                        chuyengoc: {
                                            id: this.Name + "ChuyenGocLookup",
                                            instance: null,
                                            params: {
                                                MaChuyenMay: null,
                                            }
                                        },
                                        chuyendachon: {
                                            id: this.Name + "ChuyenDaChonLookup",
                                            instance: null,
                                            params: {
                                                MaChuyenMay: null,
                                            }
                                        }
                                    },
                                    text: {
                                        pco: {
                                            id: this.Name + "PCOText",
                                            value: null
                                        },
                                        tenhang: {
                                            id: this.Name + "TenHangText",
                                            value: null
                                        },
                                    },
                                    button: {
                                        doichuyen: {
                                            id: this.Name + "DoiChuyenButton",
                                            instance: null,
                                        },
                                        gopchuyen: {
                                            id: this.Name + "GopChuyenButton",
                                            instance: null,
                                        }
                                    },
                                    grid: {
                                        id: this.Name + "SewGrid",
                                        instance: null,
                                        params: {
                                            MaChuyenMay: null,
                                            TenChuyenMay: null,
                                            MaPCO: null,
                                            MaMau: null,
                                            MaSize: null,
                                            MaChuyenMayDaChon: null,
                                            TenChuyenMayDaChon: null,
                                            TrangThai: null
                                        }
                                    },
                                }
                            },
                            newsew: {
                                id: this.Name + "NewSewButton",
                                instance: null,
                                popover: {
                                    id: this.Name + "NewSewPopover",
                                    instance: null,
                                    params: {
                                        MaChuyenMay: null,
                                        MaPCO: null,
                                        MaMau: null,
                                        MaSize: null,
                                        SoLuong: null,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
        }

        this.Instance = null;
    }

    splitMauSizeChuyen(value) {
        const result = {
            MaSize: null,
            TenSize: null,
            MaChuyenMay: null
        };

        const k2 = value.split("_k2_");

        if (k2.length !== 2)
            return result;

        result.MaChuyenMay = k2[1];

        const k = k2[0].split("_k_");

        if (k.length !== 2)
            return result;

        result.MaSize = k[0];
        result.TenSize = k[1];

        return result;
    }
    splitMauSize(value) {
        const result = {
            MaSize: null,
            TenSize: null,
        };

        const k = value.split("_k_");

        if (k.length !== 2)
            return result;       

        result.MaSize = k[0];
        result.TenSize = k[1];

        return result;
    }

    async render() {
        const splitter = this.module.splitter;
        this.Instance = $(this.Container).html(`
            <div id="${splitter.id}" class="hundred-percent-height-container"></div>          
        `);
        await this.Toast_OnRender();
        await this.Loading_OnRender();
        await this.PCOImportLoading_OnRender();
        await this.Splitter_OnRender();
    }

    async Toast_OnRender() {
        this.module.toast.instance = new BaseDevextremeToast(
            "#" + this.module.toast.id,
            {},
            {}
        );
        this.module.toast.instance.init();
    }

    async Loading_OnRender() {
        this.module.loading.instance = new BaseDevextremeLoading(
            "#" + this.module.loading.id,
            {},
            {}
        );
        this.module.loading.instance.init();
    }

    async Splitter_OnRender() {
        const splitter = this.module.splitter;
        const firstcard = this.module.splitter.first.card;
        const secondcard = this.module.splitter.second.card;
        if (splitter.instance) {
            return;
        }
        splitter.instance = new BaseSplitter(
            "#" + splitter.id,
            {
                direction: "vertical",

                first: {
                    size: "45%"
                },

                second: {
                    size: "55%"
                }
            },
            {},
            {}
        );
        splitter.instance.setPanel({
            first: `
                <div id="${firstcard.id}"
                class="hundred-percent-height-container"></div>
            `,

            second: `
                <div id="${secondcard.id}"
                class="hundred-percent-height-container"></div>
            `
        });
        splitter.instance.render();

        if (!firstcard.instance) {
            await this.PCOCard_OnRender();
        }
        if (!secondcard.instance) {
            await this.PCOChiTietCard_OnRender();
        }
    }

    async PCOCard_OnRender() {
        const card = this.module.splitter.first.card;
        const importbtn = this.module.splitter.first.card.button.import;
        const grid = this.module.splitter.first.card.grid;
        card.instance = new BaseBootstrapCard(
            "#" + card.id,
            {
                title: "Danh sách đơn hàng",
                icon: "fas fa-list"
            }
        );
        card.instance.setBody(`
             <div class="hundred-percent-height-container">
                <div style="display: flex; gap: 10px; align-items: center;">
                </div>
                <div id="${grid.id}" class="hundred-percent-height-container"></div>
            </div>
            
        `);
        card.instance.addHeaderItem(importbtn.id);
        card.instance.render();
        
        if (!importbtn.instance) {
            await this.PCOImportButton_OnRender();
        } 
        if (!grid.instance) {
            await this.PCOGrid_OnRender();
        }     
    }
    async PCOImportLoading_OnRender() {
        const loading = this.module.splitter.first.card.button.import.loading;
        loading.instance = new ProcessBootstrapLoading(
            "#" + loading.id,
            {},
            {}
        );
        loading.instance.init();
    }
    async PCOImportButton_OnRender() {
        const button = this.module.splitter.first.card.button.import;
        button.instance = new BaseBootstrapButton(
            "#" + button.id,
            {
                Base: "Import Excel",
                Pending: "Import...",
            },
            {
                type: "warning",
                icon: "fa-regular fa-file-excel",
                
            },
            {
                width: "160px",
                background: "#162340",
                color: "#fff",
                padding: "4px 6px",
                border: "1px solid #fff",
                borderRadius: "3px",
                hover: {
                    background: "#fff",
                    color: "#162340",
                    border: "1px solid #fff"
                }
            }
        );
        button.instance.setEvent(async () => {
            await this.PCOImportButton_OnClick();
        });
        button.instance.render();
    }
    async PCOImportButton_OnClick() {
        const loading = this.module.splitter.first.card.button.import.loading;
        const file = this.helper.excel.import;
        const self = this;
        file.chooseAndOpen().then(async (workbook) => {
            if (!workbook) return;

            let result = [];
            
            file.clearDataTable();
            file.addDataTable([
                {
                    name: "PCO",
                    type: "a",
                    direction: "vertical"
                }
            ]);
            file.buildColumns("PCO", [
                {
                    caption: ["buyer", "khachhang"],
                    dataField: "TenKH",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["style name"],
                    dataField: "MaHang",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["customer style no."],
                    dataField: "TenHang",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["pco#", "pco"],
                    dataField: "TenPCO",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["order", "donhang"],
                    dataField: "Order",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["type", "loai"],
                    dataField: "Type",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["status", "trangthai"],
                    dataField: "TrangThai",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["season"],
                    dataField: "Season",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },                 
                {
                    caption: ["season-buy"],
                    dataField: "SeasonBuy",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },      
                {
                    caption: ["new/co"],
                    dataField: "NewCo",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },         
                {
                    caption: ["mota"],
                    dataField: "MoTaHang",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["qty", "soluong"],
                    dataField: "SoLuong",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "number",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["requested delivery date"],
                    dataField: "RequestDate",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "date",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["color and size"],
                    dataField: "ColorSize",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: false,
                        staticValue: null
                    }
                },
                {
                    caption: ["sewing location"],
                    dataField: "MaChuyenMay",
                    position: null,
                    type: "value",
                    isMerge: 0,
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    data: {
                        type: "value",
                        format: "string",
                        formulas: null,
                        isNull: true,
                        staticValue: null
                    }
                },
            ]);
            loading.instance.show("Bắt đầu");
            await loading.instance.step("Đang đọc file...", 10, 1000, async () => {
                file.readDataTable("PCO");
            })
            await loading.instance.step("Đang lưu", 81, 1000, async () => {
                result = file.getResultDataTable("PCO");
                console.log(result);
                let pcochitietpayload = [];

                this.baseapi.buildPayload({
                    TableName: "ERP_KHACHHANG",
                    ProcedureName: "SP_ERP_KHACHHANG",
                    Action: "getkhachhang",
                })
                const khachhangdata = await this.baseapi.post();
                this.baseapi.buildPayload({
                    TableName: "ERP_MAHANG",
                    ProcedureName: "SP_ERP_MAHANG",
                    Action: "getmahang",
                })
                const mahangdata = await this.baseapi.post();
                this.baseapi.buildPayload({
                    TableName: "ERP_LENHSX",
                    ProcedureName: "SP_ERP_LENHSX",
                    Action: "getlenhsx",
                })
                const lenhdata = await this.baseapi.post();
                this.baseapi.buildPayload({
                    TableName: "ERP_PCO_TONG",
                    ProcedureName: "SP_ERP_PCO_TONG",
                    Action: "getpco",
                })
                const pcodata = await this.baseapi.post();
                this.baseapi.buildPayload({
                    TableName: "ERP_PCO_CHITIET",
                    ProcedureName: "SP_ERP_PCO_CHITIET",
                    Action: "getpcochitiet",
                })
                const pcochitietdata = await this.baseapi.post();
                this.baseapi.buildPayload({
                    TableName: "PCO_MAUSIZE",
                    ProcedureName: "SP_PCO_MAUSIZE",
                    Action: "getmau",
                })
                const maudata = await this.baseapi.post();
                this.baseapi.buildPayload({
                    TableName: "PCO_MAUSIZE",
                    ProcedureName: "SP_PCO_MAUSIZE",
                    Action: "getsize",
                })
                const sizedata = await this.baseapi.post();
                
                const khmap = new Map();
                khachhangdata.forEach(i => {
                    khmap.set(
                        this.helper.parse.cleanText(i.TenKH),
                        {
                            GhiChu: i.GhiChu,
                            TrangThai: i.TrangThai,
                            MaKH: i.MaKH,
                            KeyKH: i.KeyKH,
                            CodeKH: i.CodeKH,
                            TenKH: i.TenKH,
                            MoTa: i.MoTa,
                        }
                    );
                });
                const mahangmap = new Map();
                mahangdata.forEach(i => {
                    mahangmap.set(
                        [
                            this.helper.parse.cleanText(i.TenKH),
                            this.helper.parse.cleanText(i.TenHang)
                        ].join("|"),
                        {
                            GhiChu: i.GhiChu,
                            TrangThai: i.TrangThai,
                            MaKH: i.MaKH,
                            MaHang: i.MaHang,
                            KeyHang: i.KeyHang,
                            CodeHang: i.CodeHang,
                            TenHang: i.TenHang,  
                            LoaiHang: i.LoaiHang,
                            SoLuong: 0,
                            TGHoanThanhDK: i.TGHoanThanhDK,
                            TGHoanThanhTT: i.TGHoanThanhTT,
                        }
                    );
                });
                const pcomap = new Map();
                pcodata.forEach(i => {
                    pcomap.set(
                        [
                            this.helper.parse.cleanText(i.TenKH),
                            this.helper.parse.cleanText(i.TenHang),
                            this.helper.parse.cleanText(i.TenPCO)
                        ].join("|"), 
                        {
                            GhiChu: i.GhiChu,
                            TrangThai: i.TrangThai,
                            MaKH: i.MaKH,
                            MaHang: i.MaHang,
                            MaLenh: i.MaLenh,
                            MaPCO: i.MaPCO,
                            KeyPCO: i.KeyPCO,
                            TenPCO: i.TenPCO,
                            LoaiPCO: i.LoaiPCO,
                            Season: i.Season,
                            SeasonBuy: i.SeasonBuy,
                            NewCo: i.NewCo,                            
                            SoLuong: 0,
                            TGGiaoHangDK: i.TGGiaoHangDK,
                            TGHoanThanhDK: i.TGHoanThanhDK,
                            TGHoanThanhTT: i.TGHoanThanhTT,
                        }
                    );
                });
                const maumap = new Map();
                maudata.forEach(i => {
                    maumap.set(
                        [
                            this.helper.parse.cleanText(i.TenKH),
                            this.helper.parse.cleanText(i.TenHang),
                            this.helper.parse.cleanText(i.TenMau)
                        ].join("|"), 
                        {
                            MaMau: i.MaMau,
                            TenMau: i.TenMau,
                            MaKH: i.MaKH,
                            MaHang: i.MaHang,                              
                        }
                    );
                });
                const sizemap = new Map();
                sizedata.forEach(i => {
                    sizemap.set(
                        [
                            this.helper.parse.cleanText(i.TenKH),
                            this.helper.parse.cleanText(i.TenHang),
                            this.helper.parse.cleanText(i.TenSize)
                        ].join("|"), 
                        {
                            MaSize: i.MaSize,
                            TenSize: i.TenSize,
                            MaKH: i.MaKH,
                            MaHang: i.MaHang, 
                        }
                    );
                });

                result.forEach((item, index) => {
                    let makhkey = this.helper.generate.generatedTimeKey("makh");
                    let mahangkey = this.helper.generate.generatedTimeKey("mahang");
                    let pcokey = this.helper.generate.generatedTimeKey("pco");
                    let mamaukey = this.helper.generate.generatedTimeKey("mamau");
                    let masizekey = this.helper.generate.generatedTimeKey("masize");
                    
                    const khachhangitem = this.helper.parse.cleanText(item.TenKH.value);
                    const mahangitem = [
                        this.helper.parse.cleanText(item.TenKH.value),
                        this.helper.parse.cleanText(item.MaHang.value)
                    ].join("|");
                    const pcoitem = [
                        this.helper.parse.cleanText(item.TenKH.value),
                        this.helper.parse.cleanText(item.TenHang.value),
                        this.helper.parse.cleanText(item.TenPCO.value)
                    ].join("|");
                    const [mautext, sizetext] = item.ColorSize.value.split(" : ");
                    const mauitem = [
                        this.helper.parse.cleanText(item.TenKH.value),
                        this.helper.parse.cleanText(item.TenHang.value),
                        this.helper.parse.cleanText(mautext)
                    ].join("|");
                    const sizeitem = [
                        this.helper.parse.cleanText(item.TenKH.value),
                        this.helper.parse.cleanText(item.TenHang.value),
                        this.helper.parse.cleanText(sizetext)
                    ].join("|");
                    const [trangthai, trangthaitext] = item.TrangThai.value.split("-");

                    let havekhachhang = khmap.get(khachhangitem);
                    if (!havekhachhang) {
                        havekhachhang = {
                            GhiChu: null,
                            TrangThai: 1,
                            MaKH: makhkey,
                            KeyKH: null,
                            CodeKH: null,
                            TenKH: item.TenKH.value,
                            MoTa: null,
                        }
                        khmap.set(khachhangitem, havekhachhang)
                    }
                    else {
                        makhkey = havekhachhang.MaKH
                    }

                    let havemahang = mahangmap.get(mahangitem);
                    if (!havemahang) {
                        havemahang = {                               
                            GhiChu: item.MoTaHang.value,
                            TrangThai: trangthai,
                            MaKH: makhkey,
                            MaHang: mahangkey,
                            KeyHang: item.MaHang.value,
                            CodeHang: null,
                            TenHang: item.TenHang.value,  
                            LoaiHang: null,
                            SoLuong: item.SoLuong.value,
                            TGHoanThanhDK: null,
                            TGHoanThanhTT: null,
                        }
                        mahangmap.set(mahangitem, havemahang);
                    }
                    else {
                        mahangkey = havemahang.MaHang;
                        havemahang.SoLuong += item.SoLuong.value;
                    }

                    let havepco = pcomap.get(pcoitem);
                    if (!havepco) {
                        havepco = {                                                     
                            GhiChu: null,
                            TrangThai: trangthai,
                            MaKH: makhkey,
                            MaHang: mahangkey,
                            MaLenh: null,
                            MaPCO: pcokey,
                            KeyPCO: null,
                            TenPCO: item.TenPCO.value,
                            LoaiPCO: null,
                            Season: item.Season.value,
                            SeasonBuy: item.SeasonBuy.value,
                            NewCo: item.NewCo.value,                            
                            SoLuong: item.SoLuong.value,
                            TGGiaoHangDK: item.RequestDate.value,                           
                            TGHoanThanhDK: null,
                            TGHoanThanhTT: null,
                        }
                        pcomap.set(pcoitem, havepco);
                    }
                    else {
                        pcokey = havepco.MaPCO;
                        havepco.SoLuong += item.SoLuong.value;
                    }

                    let havemau = maumap.get(mauitem);
                    if (!havemau) {
                        havemau = {
                            MaMau: mamaukey,
                            TenMau: mautext,
                            MaKH: makhkey,
                            MaHang: mahangkey,
                        }
                        maumap.set(mauitem, havemau);
                    }
                    else {
                        mamaukey = havemau.MaMau;
                    }

                    let havesize = sizemap.get(sizeitem);
                    if (!havesize) {
                        havesize = {
                            MaSize: masizekey,
                            TenSize: sizetext,
                            MaKH: makhkey,
                            MaHang: mahangkey, 
                        }
                        sizemap.set(sizeitem, havesize);
                    }
                    else {
                        masizekey = havesize.MaSize;
                    }
                    
                    pcochitietpayload.push({
                        TrangThai: trangthai,
                        MaPCO: pcokey,
                        MaMau: mamaukey,
                        MaSize: masizekey,
                        SoLuong: item.SoLuong.value,
                        Order: item.Order.value,
                        TGHoanThanhDK: item.RequestDate.value,
                        MaChuyenMay: item.MaChuyenMay.value,
                        LoaiPhanBo: "main"
                    })
                })

                let maupayload = Array.from(maumap.values());
                this.baseapi.buildPayload({
                    TableName: "PCO_MAUSIZE",
                    ProcedureName: "SP_PCO_MAUSIZE",
                    Action: "upsertmau",
                    TypeTable: maupayload
                }, "Post")
                await this.baseapi.post();

                let sizepayload = Array.from(sizemap.values());
                this.baseapi.buildPayload({
                    TableName: "PCO_MAUSIZE",
                    ProcedureName: "SP_PCO_MAUSIZE",
                    Action: "upsertsize",
                    TypeTable: sizepayload
                }, "Post")
                await this.baseapi.post();
                
                let khpayload = Array.from(khmap.values());
                this.baseapi.buildPayload({
                    TableName: "ERP_KHACHHANG",
                    ProcedureName: "SP_ERP_KHACHHANG",
                    Action: "upsertkhachhang",
                    TypeTable: khpayload
                }, "Post")
                await this.baseapi.post();

                let mahangpayload = Array.from(mahangmap.values());
                this.baseapi.buildPayload({
                    TableName: "ERP_MAHANG",
                    ProcedureName: "SP_ERP_MAHANG",
                    Action: "upsertmahang",
                    TypeTable: mahangpayload
                }, "Post")
                await this.baseapi.post();

                let pcopayload = Array.from(pcomap.values());
                this.baseapi.buildPayload({
                    TableName: "ERP_PCO_TONG",
                    ProcedureName: "SP_ERP_PCO_TONG",
                    Action: "upsertpco",
                    TypeTable: pcopayload
                }, "Post")
                await this.baseapi.post();

                this.baseapi.buildPayload({
                    TableName: "ERP_PCO_CHITIET",
                    ProcedureName: "SP_ERP_PCO_CHITIET",
                    Action: "upsertpcochitiet",
                    TypeTable: pcochitietpayload
                }, "Post")
                await this.baseapi.post();

                this.baseapi.buildPayload({
                    TableName: "ERP_PCO_CHUYENMAY",
                    ProcedureName: "SP_ERP_PCO_CHUYENMAY",
                    Action: "upsertphanbo",
                    TypeTable: pcochitietpayload
                }, "Post")
                await this.baseapi.post();
            })
            await loading.instance.step("...", 100, 500, async () => {
                this.module.toast.instance.show("Lưu thành công", "success");
                await this.PCOGrid_OnReload();
            })
        });
    }
    
    async PCOGrid_OnRender() {
        const grid = this.module.splitter.first.card.grid;
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_TONG",
            ProcedureName: "SP_ERP_PCO_TONG",
            Action: "getdspco",
        })
        let data = await this.baseapi.post();
        grid.instance = new PCOGrid(
            "#" + grid.id,
            data,
            {
                keyExpr: "MaPCO",
                editing: {
                    allowUpdating: false
                },
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#1a56db",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.PCOGrid_OnReload();
                },
                onFocusedRowChanged: async (data) => {
                    await this.PCOGrid_OnFocusedRowChange(data);
                }
            }
        );
        grid.instance.render();       
    }
    async PCOGrid_OnReload() {
        const grid = this.module.splitter.first.card.grid;
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_TONG",
            ProcedureName: "SP_ERP_PCO_TONG",
            Action: "getdspco",
        })
        let data = await this.baseapi.post();
        grid.instance.setDataSource(data);
    }
    async PCOGrid_OnFocusedRowChange(data) {
        const grid = this.module.splitter.second.card.grid;
        const popupgrid = this.module.splitter.second.card.button.sew.popup.grid;
        const popup = this.module.splitter.second.card.button.sew.popup;
        const newsewbtn = this.module.splitter.second.card.button.newsew;
        const sewbtn = this.module.splitter.second.card.button.sew;

        grid.params.MaPCO = data.MaPCO;
        popupgrid.params.TrangThai = data.TrangThai;
        popup.text.pco.value = data.TenPCO;
        popup.text.tenhang.value = data.TenHang;
        
        await this.PCOChiTietGrid_OnReload();
        const datasource = grid.instance.getDataSource();
        const checknull = datasource.some(row => row.TenChuyenMay == null);
        const checknotnull = datasource.some(row => row.TenChuyenMay != null);
        if (checknull) $("#" + newsewbtn.id).removeClass("d-none");
        else $("#" + newsewbtn.id).addClass("d-none");
        if (checknotnull) $("#" + sewbtn.id).removeClass("d-none");
        else $("#" + sewbtn.id).addClass("d-none");
    }


    async PCOChiTietCard_OnRender() {
        const card = this.module.splitter.second.card;
        const newsewbtn = this.module.splitter.second.card.button.newsew;
        const sewbtn = this.module.splitter.second.card.button.sew;
        const grid = this.module.splitter.second.card.grid;
        const popover = this.module.splitter.second.card.button.newsew.popover;
        const popup = this.module.splitter.second.card.button.sew.popup;
        card.instance = new BaseBootstrapCard(
            "#" + card.id,
            {
                title: "Chi tiết đơn hàng",
                icon: "fas fa-list"
            },
            {
                headerBackground: "linear-gradient(135deg, #0d1526, #1a2a4d)",
                headerColor: "#fff"
            }
        );
        card.instance.setBody(`
             <div class="hundred-percent-height-container">
                <div id="${grid.id}" class="hundred-percent-height-container"></div>               
            </div>
            <div id="${popup.id}"></div>
            <div id="${popover.id}"></div>
        `);
        card.instance.addHeaderItem(newsewbtn.id);
        card.instance.addHeaderItem(sewbtn.id);
        card.instance.render();
        
        if (!newsewbtn.instance) {
            await this.PCOChiTietNewSewButton_OnRender();
        } 
        if (!sewbtn.instance) {
            await this.PCOChiTietSewButton_OnRender();
        } 
        if (!grid.instance) {
            await this.PCOChiTietGrid_OnRender();
        } 
        if (!popup.instance) {
            await this.PCOChiTietSewPopup_OnRender();
        }
        if (!popover.instance) {
            await this.PCOChiTietPopover_OnRender();
        }  
    }

    async PCOChiTietSewButton_OnRender() {
        const button = this.module.splitter.second.card.button.sew;
        button.instance = new BaseBootstrapButton(
            "#" + button.id,
            {
                Base: "Chia chuyền",
                Pending: "Đang mở form..."
            },
            {
                type: null,
                icon: "fa-regular fa-clone"
            },
            {
                width: "160px",
                background: "#162340",
                color: "#fff",
                padding: "4px 6px",
                border: "1px solid #fff",
                borderRadius: "3px",
                hover: {
                    background: "#fff",
                    color: "#162340",
                    border: "1px solid #fff"
                }
            }
        );
        button.instance.setEvent(async () => {
            await this.PCOChiTietSewButton_OnClick();
        });
        button.instance.render();
    }
    async PCOChiTietSewButton_OnClick() {
        const popup = this.module.splitter.second.card.button.sew.popup;
        const tenpco = this.module.splitter.second.card.button.sew.popup.text.pco;
        const tenhang = this.module.splitter.second.card.button.sew.popup.text.tenhang;
        const chuyengoclookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyengoc;
        const chuyendachonlookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyendachon;
        const doichuyenbtn = this.module.splitter.second.card.button.sew.popup.button.doichuyen;
        const gopchuyenbtn = this.module.splitter.second.card.button.sew.popup.button.gopchuyen; 
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const loading = this.module.splitter.second.card.button.sew.popup.loading;
        
        grid.params.MaChuyenMayDaChon = null;
        grid.params.TenChuyenMayDaChon = null;
        grid.params.MaChuyenMay = null;
        grid.params.TenChuyenMay = null;

        popup.instance.show();

        if(loading.instance) loading.instance.dispose();
        await this.PCOChiTietSewLoading_OnRender();

        if(chuyengoclookup.instance) chuyengoclookup.instance.dispose();
        await this.ChuyenGocLookup_OnRender();
        
        if(chuyendachonlookup.instance) chuyendachonlookup.instance.dispose();
        await this.ChuyenDaChonLookup_OnRender();

        if(gopchuyenbtn.instance) gopchuyenbtn.instance.dispose();
        await this.GopChuyenButton_OnRender();

        if(doichuyenbtn.instance) doichuyenbtn.instance.dispose();
        await this.DoiChuyenButton_OnRender();

        
        if(grid.instance) grid.instance.dispose();
        await this.ChiaChuyenGrid_OnRender();
        

        await chuyengoclookup.instance.selectFirst(true);
        await chuyendachonlookup.instance.selectFirst(true);
        await this.ChiaChuyenGrid_OnReload();
        $("#" + tenpco.id).val(tenpco.value);
        $("#" + tenhang.id).val(tenhang.value);
    }

    async PCOChiTietSewPopup_OnRender() {
        const popup = this.module.splitter.second.card.button.sew.popup;
        const tenpco = this.module.splitter.second.card.button.sew.popup.text.pco;
        const tenhang = this.module.splitter.second.card.button.sew.popup.text.tenhang;
        const chuyengoclookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyengoc;
        const chuyendachonlookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyendachon; 
        const doichuyenbtn = this.module.splitter.second.card.button.sew.popup.button.doichuyen;
        const gopchuyenbtn = this.module.splitter.second.card.button.sew.popup.button.gopchuyen;
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const loading = this.module.splitter.second.card.button.sew.popup.loading;
        const self = this;
        popup.instance = new BaseDevExtremePopup(
            "#" + popup.id,
            {
                title: "Thiết lập chuyền",
                width: "90vw",
                height: "80vh"
            },
            {
                styles: {
                    popup: {
                        background: "#162340",
                        border: "1px solid #304d7a",
                        //borderRadius: "8px",
                        color: "#fff"
                    },

                    header: {
                        background: "linear-gradient(135deg,#0d1526,#162340)",
                        color: "#fff",
                        borderBottom: "1px solid #304d7a"
                    },

                    footer: {
                        background: "#0d1526",
                        borderTop: "1px solid #304d7a"
                    }
                }
            },
            [
                {
                    text: "Lưu",
                    icon: "save",
                    type: "success",
                    onClick: async () => {
                        
                        const dts = grid.instance.getDataSource();
                        console.log(dts);
                        let payload = [];
                        dts.forEach(row => {
                            for (const [key, value] of Object.entries(row)) {
                                const spl = self.splitMauSizeChuyen(key);
                                if (spl.MaSize != null && spl.MaChuyenMay != null) {

                                    let maChuyenMay = null;

                                    if (spl.MaChuyenMay == grid.params.MaChuyenMay) {
                                        maChuyenMay = grid.params.MaChuyenMay;
                                    }
                                    else if (spl.MaChuyenMay == grid.params.MaChuyenMayDaChon) {
                                        maChuyenMay = grid.params.MaChuyenMayDaChon;
                                    }

                                    if (maChuyenMay != null) {
                                        payload.push({
                                            TrangThai: grid.params.TrangThai,
                                            MaPCO: row.MaPCO,
                                            MaMau: row.MaMau,
                                            MaSize: spl.MaSize,
                                            SoLuong: value,
                                            MaChuyenMay: maChuyenMay,
                                            LoaiPhanBo: "split"
                                        });
                                    }
                                }
                            }                                                 
                        })
                        console.log(payload);
                        
                        self.baseapi.buildPayload({
                            TableName: "ERP_PCO_CHUYENMAY",
                            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
                            Action: "upsertphanbo",
                            TypeTable: payload
                        }, "Post")
                        await self.baseapi.post();
                        self.module.toast.instance.show("Lưu thành công", "success");
                        popup.instance.hide();
                        await self.PCOChiTietGrid_OnReload();
                    }
                }
            ]
        )
        popup.instance.setBody(`
            <div id="${loading.index}" class="hundred-percent-height-container">
                <div class="row g-2 mb-3">
                    <div class="col-12 col-md-2">
                        <label class="form-label fw-semibold mb-1 text-nowrap">
                            Mã hàng
                        </label>
                        <input id="${tenhang.id}" class="form-control w-100" readonly></input>
                    </div>
                    <div class="col-12 col-md-2">
                        <label class="form-label fw-semibold mb-1 text-nowrap">
                            PCO
                        </label>
                        <input id="${tenpco.id}" class="form-control w-100" readonly></input>
                    </div>
                    <div class="col-12 col-md-2">
                        <label class="form-label fw-semibold mb-1 text-nowrap">
                            Chuyền gốc
                        </label>
                        <div id="${chuyengoclookup.id}"></div>
                    </div> 
                    <div class="col-12 col-md-2">
                        <label class="form-label fw-semibold mb-1 text-nowrap">
                            Chuyền thao tác
                        </label>
                        <div id="${chuyendachonlookup.id}"></div>
                    </div>
                    <div class="col-12 col-md-4 d-flex align-items-end justify-content-end">
                        <div class="d-flex gap-2">
                            <div id="${gopchuyenbtn.id}"></div>
                            <div id="${doichuyenbtn.id}"></div>
                        </div>
                    </div>
                </div>
                <div id="${grid.id}" class="hundred-percent-height-container"></div>                
            </div>
            <div id="${loading.id}"></div>
        `)       
        popup.instance.init();
    }

    async PCOChiTietSewLoading_OnRender() {
        const loading = this.module.splitter.second.card.button.sew.popup.loading;
        const popup = this.module.splitter.second.card.button.sew.popup;
        loading.instance = new BaseDevextremeLoading(
            "#" + loading.id,
            {
                position: {
                    of: "#" + loading.index
                }
            },
            {}
        );
        loading.instance.init();
    }

    async ChuyenGocLookup_OnRender() {
        const lookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyengoc;
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_CHUYENMAY",
            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
            Action: "getchuyenmaygoc",
            Parameter: grid.params.MaChuyenMayDaChon,
            Parameter1: grid.params.MaPCO
        })        
        let data = await this.baseapi.post();
        lookup.instance = new ChuyenMayLookup(
            "#" + lookup.id,
            "MaChuyenMay",
            data,
            {
                keyExpr: "MaChuyenMay",
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#1a56db",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    
                },
                onChanged: async (data) => {
                    await this.ChuyenGocLookup_OnChange(data);
                }
            }
        );
        lookup.instance.buildDisplayExpr("TenChuyenMay");
        lookup.instance.render();       
    }
    async ChuyenGocLookup_OnChange(data) {
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const pcochitietgrid = this.module.splitter.second.card.grid;
        const lookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyendachon;
        const MaChuyenMayCu = grid.params.MaChuyenMay;
        grid.params.TenChuyenMay = data.TenChuyenMay;
        grid.params.MaChuyenMay = data.MaChuyenMay;
        pcochitietgrid.params.Columns.forEach(group => {
            grid.instance.removeGroupColumn(group.TenSize, group.Key + "_k2_" + MaChuyenMayCu);            
            grid.instance.addGroupColumn(group.TenSize, {
                dataField: group.Key + "_k2_" + grid.params.MaChuyenMay,
                caption: grid.params.TenChuyenMay,
                alignment: "center",
                width: 90,
                allowSorting: false, 
                allowFiltering: false,
                allowEditing: false,
                dataType: "number",
                
            }, 0);
            grid.instance.removeSummary(group.Key + "_k2_" + MaChuyenMayCu);
            grid.instance.addTotalSummary({
                column: group.Key + "_k2_" + grid.params.MaChuyenMay,
                summaryType: "sum",
                displayFormat: "{0}",
                valueFormat: "#,##0"
            });
        }); 
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_CHUYENMAY",
            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
            Action: "getchuyenmaycanchon",
            Parameter: data.MaChuyenMay
        })        
        let data2 = await this.baseapi.post();
        lookup.instance.setDataSource(data2);
        await this.ChiaChuyenGrid_OnReload();
        console.log("check");
    }

    async ChuyenDaChonLookup_OnRender() {
        const lookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyendachon;
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        lookup.instance = new ChuyenMayLookup(
            "#" + lookup.id,
            "MaChuyenMay",
            [],
            {
                keyExpr: "MaChuyenMay",
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#1a56db",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    
                },
                onChanged: async (data) => {
                    await this.ChuyenDaChonLookup_OnChange(data);
                }
            }
        );
        lookup.instance.buildDisplayExpr("TenChuyenMay");
        lookup.instance.render();       
    }
    async ChuyenDaChonLookup_OnChange(data) {
        const lookup = this.module.splitter.second.card.button.sew.popup.lookup.chuyengoc;
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const pcochitietgrid = this.module.splitter.second.card.grid;
        const MaChuyenMayCu = grid.params.MaChuyenMayDaChon;
        const loading = this.module.splitter.second.card.button.sew.popup.loading;
        loading.instance.show();
        grid.params.TenChuyenMayDaChon = data.TenChuyenMay;
        grid.params.MaChuyenMayDaChon = data.MaChuyenMay;
        grid.instance.clearColumnStyles();
        pcochitietgrid.params.Columns.forEach(group => {
            grid.instance.removeGroupColumn(group.TenSize, group.Key + "_k2_" + MaChuyenMayCu);           
            grid.instance.addGroupColumn(group.TenSize, {
                dataField: group.Key + "_k2_" + grid.params.MaChuyenMayDaChon,
                caption: grid.params.TenChuyenMayDaChon,
                alignment: "center",
                width: 90,
                allowSorting: false, 
                allowFiltering: false,
                allowEditing: true,
                dataType: "number",
                setCellValue(newData, value, currentRowData) {
                    const tong =
                        Number(currentRowData[group.Key + "_k2_" + grid.params.MaChuyenMay]) +
                        Number(currentRowData[group.Key + "_k2_" + grid.params.MaChuyenMayDaChon]);

                    value = Number(value) || 0;

                    if (value < 0)
                        value = 0;

                    if (value > tong)
                        value = tong;

                    newData[group.Key + "_k2_" + grid.params.MaChuyenMayDaChon] = value;
                    newData[group.Key + "_k2_" + grid.params.MaChuyenMay] = tong - value;
                }
            });
            grid.instance.removeSummary(group.Key + "_k2_" + MaChuyenMayCu);
            grid.instance.addTotalSummary({
                column: group.Key + "_k2_" + grid.params.MaChuyenMayDaChon,
                summaryType: "sum",
                displayFormat: "{0}",
                valueFormat: "#,##0"
            });
            grid.instance.setColumnStyle({
                column: group.Key + "_k2_" + grid.params.MaChuyenMayDaChon,
                css: {
                    backgroundColor: "#fff3cd"
                }
            });
        }); 
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_CHUYENMAY",
            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
            Action: "getchuyenmaygoc",
            Parameter: grid.params.MaChuyenMayDaChon,
            Parameter1: grid.params.MaPCO
        })        
        let data2 = await this.baseapi.post();
        lookup.instance.setDataSource(data2);
        await this.ChiaChuyenGrid_OnReload();
        loading.instance.hide();
    }

    async DoiChuyenButton_OnRender() {
        const button = this.module.splitter.second.card.button.sew.popup.button.doichuyen;
        button.instance = new BaseBootstrapButton(
            "#" + button.id,
            {
                Base: "",
                Pending: "",
            },
            {
                type: "warning",
                icon: "fa-solid fa-angles-right",
                
            },
            {
                width: "80px",
                background: "#fff",
                color: "#162340",
                padding: "4px 6px",
                border: "1px solid #fff",
                borderRadius: "3px",
                hover: {
                    background: "#162340",
                    color: "#fff",
                    border: "1px solid #162340"
                }
            }
        );
        button.instance.setEvent(async () => {
            await this.DoiChuyenButton_OnClick();
        });
        button.instance.render();
    }
    async DoiChuyenButton_OnClick() {
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const columns = this.module.splitter.second.card.grid.params.Columns;
        const datasource = grid.instance.getDataSource();
        datasource.forEach(row => {
            columns.forEach(group => {
                const sourceField =
                    group.Key + "_k2_" + grid.params.MaChuyenMay;

                const targetField =
                    group.Key + "_k2_" + grid.params.MaChuyenMayDaChon;

                const source = Number(row[sourceField]) || 0;
                const target = Number(row[targetField]) || 0;

                row[targetField] = source + target;
                row[sourceField] = 0;

            });

        });
        grid.instance.Instance.refresh();
    }

    async GopChuyenButton_OnRender() {
        const button = this.module.splitter.second.card.button.sew.popup.button.gopchuyen;
        button.instance = new BaseBootstrapButton(
            "#" + button.id,
            {
                Base: "",
                Pending: "",
            },
            {
                type: "warning",
                icon: "fa-solid fa-angles-left",
                
            },
            {
                width: "80px",
                background: "#fff",
                color: "#162340",
                padding: "4px 6px",
                border: "1px solid #fff",
                borderRadius: "3px",
                hover: {
                    background: "#162340",
                    color: "#fff",
                    border: "1px solid #162340"
                }
            }
        );
        button.instance.setEvent(async () => {
            await this.GopChuyenButton_OnClick();
        });
        button.instance.render();
    }
    async GopChuyenButton_OnClick() {
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const columns = this.module.splitter.second.card.grid.params.Columns;
        const datasource = grid.instance.getDataSource();

        datasource.forEach(row => {
            columns.forEach(group => {
                const sourceField =
                    group.Key + "_k2_" + grid.params.MaChuyenMay;

                const targetField =
                    group.Key + "_k2_" + grid.params.MaChuyenMayDaChon;

                const source = Number(row[sourceField]) || 0;
                const target = Number(row[targetField]) || 0;

                row[sourceField] = source + target;
                row[targetField] = 0;

            });

        });
        grid.instance.Instance.refresh();
    }

    async ChiaChuyenGrid_OnRender() {
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        const pcochitietgrid = this.module.splitter.second.card.grid;
        grid.instance = new ChiaChuyenGrid(
            "#" + grid.id,
            [],
            {
                keyExpr: "MaMau",
                editing: {
                    allowUpdating: true
                },
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#1a56db",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    
                },
                onFocusedRowChanged: async (data) => {
                    
                }
            }
        );
        
        grid.instance.render();
        pcochitietgrid.params.Columns.forEach(group => {
            grid.instance.addGroup(group.TenSize);
            // grid.instance.addTotalSummary({
            //     column: group.Key,
            //     summaryType: "sum",
            //     displayFormat: "{0}",
            //     valueFormat: "#,##0"
            // });
        }); 
    }
    async ChiaChuyenGrid_OnReload() {
        const grid = this.module.splitter.second.card.button.sew.popup.grid;
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_CHUYENMAY",
            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
            Action: "getsoluong2chuyen",
            Parameter: grid.params.MaChuyenMay,
            Parameter1: grid.params.MaChuyenMayDaChon,
            TypeTable: [
                {
                    MaPCO: grid.params.MaPCO,
                    MaMau: grid.params.MaMau
                }
            ]
        }, "GetByTypeTable")
        
        let data = await this.baseapi.post();
        grid.instance.setDataSource(data);
    }


    async PCOChiTietGrid_OnRender() {
        const grid = this.module.splitter.second.card.grid;
        grid.instance = new PCOChiTietGrid(
            "#" + grid.id,
            [],
            {
                keyExpr: "_key",
                editing: {
                    allowUpdating: false
                },
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#1a56db",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    
                },
                onFocusedRowChanged: async (data) => {
                    await this.PCOChiTietGrid_OnFocusedRowChange(data);
                }
            }
        );
        grid.instance.render();       
    }
    async PCOChiTietGrid_OnReload() {
        const grid = this.module.splitter.second.card.grid;
        const self = this;

        this.baseapi.buildPayload({
            TableName: "ERP_PCO_TONG",
            ProcedureName: "SP_ERP_PCO_TONG",
            Action: "getdspcopivot",
            Parameter: grid.params.MaPCO
        })
        let data = await this.baseapi.post();

        grid.instance.clearSummary();
        grid.instance.removeColumn("__TongSL");        
        grid.instance.removeGroup("Size");

        grid.params.Columns = [];
        if (data.length > 0) {
            grid.params.Columns = Object.keys(data[0]).filter(key => key.includes("_k_")).map(key => {
                const [id, name] = key.split("_k_");
                return {
                    MaSize: id,
                    TenSize: name,
                    Key: key
                };
            });
        }
        
        if (grid.params.Columns.length > 0) {
            grid.instance.addGroup("Size");
            grid.params.Columns.forEach(group => {
                grid.instance.addGroupColumn("Size", {
                    dataField: group.Key,
                    caption: group.TenSize,
                    alignment: "center",
                    width: 90,
                    allowSorting: false, 
                    allowFiltering: false,
                    allowEditing: false,
                });
                grid.instance.addTotalSummary({
                    column: group.Key,
                    summaryType: "sum",
                    displayFormat: "{0}",
                    valueFormat: "#,##0"
                });
            });
        }
        // grid.instance.addColumn({
        //     dataField: "TenChuyenMay",
        //     caption: "Chuyền may chính",
        //     allowSorting: false,
        //     allowEditing: false,
        //     width: 200,
        //     cellTemplate: (container, options) => {
        //         const data = options.data;
        //         const popover = self.module.splitter.second.card.grid.popover;
        //         const wrapper = $("<div>").css({
        //             display: "flex",
        //             alignItems: "center",
        //             justifyContent: "space-between",
        //             width: "100%",
                    
        //         });
        //         $("<span>")
        //             .text(data.TenChuyenMay ?? "")
        //             .appendTo(wrapper);

        //         const btnId = `${popover.id}_${data.MaPCO}`;

        //         $("<div>")
        //             .attr("id", btnId)
        //             .dxButton({
        //                 icon: "more",
        //                 stylingMode: "text",
        //                 onClick: async () => {
        //                     popover.instance.setTarget(`#${btnId}`);
        //                     popover.params.MaChuyenMay = data.MaChuyenMay;
        //                     popover.params.MaPCO = data.MaPCO;
        //                     popover.params.MaMau = data.MaMau;
        //                     popover.params.MaSize = Object.keys(data).find(k => k != "PCO" && data[k] > 0);
        //                     popover.params.SoLuong = Object.entries(data).filter(([key, value]) => key != "PCO" && value > 0)?.[1];
        //                     await this.PCOChiTietPopover_OnReload();
        //                     popover.instance.show();
        //                 }
        //             })
        //             .appendTo(wrapper);
                
        //         $(container).append(wrapper);
        //     }
        // });
        // grid.instance.addColumn({
        //     dataField: "ChuyenPhu",
        //     caption: "Chia chuyền",
        //     allowSorting: false,
        //     allowEditing: false,
        //     minWidth: 150
        // });
        grid.instance.addColumn({
            dataField: "__TongSL",
            caption: "Tổng SL",
            width: 90,
            allowEditing: false,
            allowSorting: false,
            calculateCellValue(row) {

                return grid.params.Columns.reduce((sum, item) => {
                    return sum + (Number(row[item.Key]) || 0);
                }, 0);

            }
        });
        grid.instance.addTotalSummary({
            column: "__TongSL",
            summaryType: "sum",
            displayFormat: "{0}",
            valueFormat: "#,##0"
        });
        grid.instance.setDataSource(data);
    }
    async PCOChiTietGrid_OnFocusedRowChange(data) {
        const popup = this.module.splitter.second.card.button.sew.popup;
        popup.grid.params.MaChuyenMay = data.MaChuyenMay;
        popup.grid.params.TenChuyenMay = data.TenChuyenMay;
        popup.grid.params.MaMau = data.MaMau;
        popup.grid.params.MaPCO = data.MaPCO;
    }

    async PCOChiTietNewSewButton_OnRender() {
        const button = this.module.splitter.second.card.button.newsew;
        button.instance = new BaseBootstrapButton(
            "#" + button.id,
            {
                Base: "Chọn chuyền",
                Pending: "Đang mở..."
            },
            {
                type: null,
                icon: "fa-regular fa-clone"
            },
            {
                width: "160px",
                background: "#162340",
                color: "#fff",
                padding: "4px 6px",
                border: "1px solid #fff",
                borderRadius: "3px",
                hover: {
                    background: "#fff",
                    color: "#162340",
                    border: "1px solid #fff"
                }
            }
        );
        button.instance.setEvent(async () => {
            await this.PCOChiTietNewSewButton_OnClick();
        });
        button.instance.render();
    }
    async PCOChiTietNewSewButton_OnClick() {
        const button = this.module.splitter.second.card.button.newsew;
        const popover = this.module.splitter.second.card.button.newsew.popover;

        popover.instance.setTarget("#" + button.id);
        await this.PCOChiTietPopover_OnReload();
        popover.instance.show();
    }

    async PCOChiTietPopover_OnRender() {
        const popover = this.module.splitter.second.card.button.newsew.popover;
        popover.instance = new ChuyenMayPopover(
            "#" + popover.id,
            "MaChuyenMay",
            [],
            {
                popover: {
                    width: "20vw",
                    height: "30vh"
                }
            },
            {},
            {
                onChange: async (data) => {
                    await this.PCOChiTietPopover_OnChange(data);
                }
            }
        );
        popover.instance.init();
    }
    async PCOChiTietPopover_OnReload() {
        const popover = this.module.splitter.second.card.button.newsew.popover;
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_CHUYENMAY",
            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
            Action: "getchuyenmay",
        })       
        let data = await this.baseapi.post();
        popover.instance.setDataSource(data);
    }
    async PCOChiTietPopover_OnChange(data) {
        const popover = this.module.splitter.second.card.button.newsew.popover;
        const grid = this.module.splitter.second.card.grid;
        const ctgrid = this.module.splitter.second.card.button.sew.popup.grid;
        const newsewbtn = this.module.splitter.second.card.button.newsew;
        const sewbtn = this.module.splitter.second.card.button.sew;
        const datasource = grid.instance.getDataSource();
        let payload = [];
        datasource.forEach(row => {
            if (row.TenChuyenMay == null) {
                for (const [key, value] of Object.entries(row)) {
                    const mausize = this.splitMauSize(key);
                    if (mausize.MaSize != null && mausize.TenSize != null) {
                        payload.push({
                            TrangThai: ctgrid.params.TrangThai,
                            MaPCO: row.MaPCO,
                            MaMau: row.MaMau,
                            MaSize: mausize.MaSize,
                            SoLuong: value,
                            MaChuyenMay: data.MaChuyenMay,
                            LoaiPhanBo: "main"
                        });
                    }
                }
                
            }
        })
        this.baseapi.buildPayload({
            TableName: "ERP_PCO_CHUYENMAY",
            ProcedureName: "SP_ERP_PCO_CHUYENMAY",
            Action: "upsertphanbo",
            TypeTable: payload,
        }, "Post")
        await this.baseapi.post();
        this.module.toast.instance.show("Lưu thành công", "success");
        await this.PCOChiTietGrid_OnReload();
        $("#" + newsewbtn.id).addClass("d-none");
        $("#" + sewbtn.id).removeClass("d-none");
    }
}

BaseFoundation.registerClass("PCOModule", PCOModule);