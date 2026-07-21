

class LoaiLoiModule {
    constructor(Container) {
        this.Name = this.constructor.name;
        this.Container = Container;

        this.helper = {
            generate: new GenerateHelper()
        };
        this.baseapi = new BaseFetchAPI("/api/Common");
        //this.loailoiapi = new LoaiLoiFetchAPI("api/Common/Post");

        this.module = {
            toast: {
                id: this.Name + "Toast",
                instance: null
            },
            loading: {
                id: this.Name + "Loading",
                instance: null
            },
            tab: {
                id: this.Name + "Tab",
                instance: null,
                list: {
                    "phanloailoi": {
                        text: "Phân loại lỗi",
                        instance: null,
                        content: {
                            id: "phanloailoiContent",
                            instance: null
                        },
                        event: async () => await this.PhanLoaiLoiContent_OnRender(),
                        grid: {
                            id: this.Name + "phanloailoiGrid",
                            datasource: [],
                            instance: null
                        },
                        popover: {
                            id: this.Name + "phanloailoiPopover",
                            datasource: [],
                            instance: null,
                            params: {
                                MaLoi: null
                            }
                        }
                    },
                    "phanloaimodule": {
                        text: "Phân loại module",
                        instance: null,
                        content: {
                            id: "phanloaimoduleContent",
                            instance: null
                        },
                        event: async () => await this.PhanLoaiModuleContent_OnRender(),
                        grid: {
                            id: this.Name + "phanloaimoduleGrid",
                            datasource: [],
                            instance: null
                        }
                    },
                    "tlbophan": {
                        text: "Thiết lập bộ phận",
                        instance: null,
                        content: {
                            id: "tlbophanContent",
                            instance: null
                        },
                        event: async () => await this.TLBophanContent_OnRender(),
                        grid: {
                            tlbophan: {
                                id: this.Name + "tlbophanGrid",
                                datasource: [],
                                instance: null
                            },
                            dsnhomloi: {
                                id: this.Name + "dsnhomloiGrid",
                                datasource: [],
                                instance: null,
                                params: {
                                    MaBoPhan: null
                                }
                            },
                        },
                        buttons: {
                            add: {
                                id: this.Name + "tlbophanAddButton",
                                instance: null,
                            },
                            save: {
                                id: this.Name + "tlbophanSaveButton",
                                instance: null,
                            }
                        },
                        dialog: {
                            id: this.Name + "tlbophanDialog",
                            datasource: [],
                            instance: null
                        }
                    },
                    "tlkcsqa": {
                        text: "Thiết lập module",
                        instance: null,
                        content: {
                            id: "tlkcsqaContent",
                            instance: null
                        },
                        event: async () => await this.TLKCSQAContent_OnRender(),
                        grid: {
                            id: this.Name + "tlkcsqaGrid",
                            datasource: [],
                            instance: null
                        },
                        buttons: {
                            add: {
                                id: this.Name + "tlkcsqaAddButton",
                                instance: null,
                            },
                            save: {
                                id: this.Name + "tlkcsqaSaveButton",
                                instance: null,
                            }
                        },
                        dialog: {
                            id: this.Name + "tlkcsqaDialog",
                            datasource: [],
                            instance: null
                        }
                    },
                    "tlhangmucloi": {
                        text: "Thiết lập dạng lỗi",
                        instance: null,
                        content: {
                            id: "tlhangmucloiContent",
                            instance: null
                        },
                        event: async () => await this.TLHangMucLoiContent_OnRender(),
                        grid: {
                            id: this.Name + "tlhangmucloiGrid",
                            datasource: [],
                            instance: null
                        },
                        buttons: {
                            add: {
                                id: this.Name + "tlhangmucloiAddButton",
                                instance: null,
                            },
                            save: {
                                id: this.Name + "tlhangmucloiSaveButton",
                                instance: null,
                            }
                        },
                        dialog: {
                            id: this.Name + "tlhangmucloiDialog",
                            datasource: [],
                            instance: null
                        }
                    }
                },

            }
        }

        this.Instance = null;
    }

    async render() {
        this.Instance = $(this.Container).html(`
            <div id="${this.module.tab.id}"></div>
        `);
        this.Toast_OnRender();
        this.Loading_OnRender();
        this.Tab_OnRender();
    }

    Toast_OnRender() {
        this.module.toast.instance = new BaseDevextremeToast(
            "#" + this.module.toast.id,
            {},
            {}
        );
        this.module.toast.instance.init();
    }

    Loading_OnRender() {
        this.module.loading.instance = new BaseDevextremeLoading(
            "#" + this.module.loading.id,
            {},
            {}
        );
        this.module.loading.instance.init();
    }

    Tab_OnRender() {
        this.module.tab.instance = new BaseDevextremeTab(
            "#" + this.module.tab.id,
            {},
            {},
            {}
        );
        Object.keys(this.module.tab.list).forEach(key => {
            const item = this.module.tab.list[key];
            this.module.tab.instance.addItem(key, item.text, item.event);
        });
        this.module.tab.instance.render();
    }

    // tab phân loại lỗi
    async PhanLoaiLoiContent_OnRender() {
        const content = this.module.tab.list.phanloailoi.content;
        if (content.instance) {
            return;
        }
        content.instance = new BaseContent(
            "#" + this.module.tab.id + "_" + content.id,
            `
                <div id="${this.module.tab.list.phanloailoi.grid.id}"></div>
                <div id="${this.module.tab.list.phanloailoi.popover.id}"></div>
            `,
            {}
        );
        content.instance.render();

        if (!this.module.tab.list.phanloailoi.grid.instance) {
            await this.PhanLoaiLoiGrid_OnRender();
        }
        if (!this.module.tab.list.phanloailoi.popover.instance) {
            await this.PhanLoaiLoiPopover_OnRender();
        }
    }
    async PhanLoaiLoiGrid_OnRender() {
        const grid = this.module.tab.list.phanloailoi.grid;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_PHANLOAILOI",
            ProcedureName: "SP_QTY_QA_PHANLOAILOI",
            Action: "getphanloailoi",
        })
        const data = await this.baseapi.post();
        let loiGroup = [];
        if (data.length > 0) {
            loiGroup = Object.keys(data[0]).filter(key => key.includes("_k_")).map(key => {
                const [id, name] = key.split("_k_");
                return {
                    MaLoaiLoi: id,
                    TenLoaiLoi: name,
                    Key: key
                };
            });
        }

        grid.instance = new PhanLoaiLoiGrid(
            "#" + grid.id,
            data,
            {
                keyExpr: "MaLoiChiTiet",
                editing: {
                    allowUpdating: false
                }
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#17a2b8",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.PhanLoaiLoiGrid_OnReload();
                }
            }
        );


        grid.instance.render();
        grid.instance.addColumn({
            dataField: "HangMucLoi",
            caption: "Hạng mục lỗi",
            width: 200,
            cellTemplate: (container, options) => {
                const data = options.data;
                const popover = this.module.tab.list.phanloailoi.popover;
                const wrapper = $("<div>").css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",

                });
                $("<span>")
                    .text(data.TenHangMucLoi ?? "")
                    .appendTo(wrapper);

                const btnId = `${popover.id}_${data.MaLoi}`;

                $("<div>")
                    .attr("id", btnId)
                    .dxButton({
                        icon: "more",
                        stylingMode: "text",
                        onClick: async () => {
                            popover.instance.setTarget(`#${btnId}`);
                            popover.params.MaLoi = data.MaLoi;
                            await this.PhanLoaiLoiPopover_OnReload();
                            popover.instance.show();
                        }
                    })
                    .appendTo(wrapper);

                $(container).append(wrapper);
            }
        });
        if (loiGroup.length > 0) {
            grid.instance.addGroup("Mức độ lỗi");
            console.log(data);
            loiGroup.forEach(group => {
                grid.instance.addGroupColumn("Mức độ lỗi", {
                    dataField: group.MaLoaiLoi,
                    caption: group.TenLoaiLoi,
                    alignment: "center",
                    width: 80,
                    allowSorting: false,
                    allowFiltering: false,
                    cellTemplate: (container, options) => {
                        $("<div>")
                            .dxCheckBox({
                                value: Number(options.data[group.Key]) === 1,

                                onValueChanged: (e) => {
                                    this.PhanLoaiLoiGrid_OnCheck(
                                        options.data,
                                        group,
                                        e.value
                                    );
                                }
                            })
                            .appendTo(container);
                    }
                });
            });
        }

        grid.instance.addColumn({
            dataField: "GhiChu",
            caption: "Ghi chú",
            width: 300
        });
    }
    async PhanLoaiLoiGrid_OnReload() {
        this.module.loading.instance.show();
        try {
            const grid = this.module.tab.list.phanloailoi.grid;
            this.baseapi.buildPayload({
                TableName: "QTY_QA_PHANLOAILOI",
                ProcedureName: "SP_QTY_QA_PHANLOAILOI",
                Action: "getphanloailoi",
            })
            const data = await this.baseapi.post();
            grid.instance.setDataSource(data);
        }
        finally {
            this.module.loading.instance.hide();
        }
    }
    async PhanLoaiLoiGrid_OnCheck(data, group, value) {
        console.log("PhanLoaiLoiGrid_OnCheck", data, group, value);
        this.baseapi.buildPayload({
            TableName: "QTY_QA_PHANLOAILOI",
            ProcedureName: "SP_QTY_QA_PHANLOAILOI",
            Action: "upsertphanloailoi",
            TypeTable: [{
                MaLoi: data.MaLoiChiTiet,
                MaLoaiLoi: group.MaLoaiLoi,
                TrangThai: value ? 1 : 0
            }]
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Cập nhật thành công", "success");
    }
    async PhanLoaiLoiPopover_OnRender() {
        const popover = this.module.tab.list.phanloailoi.popover;
        popover.instance = new PhanLoaiLoiPopover(
            "#" + popover.id,
            "MaHangMucLoi",
            [],
            {},
            {},
            {
                onChange: async (data) => {
                    await this.PhanLoaiLoiPopover_OnChange(data);
                }
            }
        );
        popover.instance.init();
    }
    async PhanLoaiLoiPopover_OnReload() {
        const popover = this.module.tab.list.phanloailoi.popover;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_HANGMUCLOI",
            ProcedureName: "SP_QTY_QA_HANGMUCLOI",
            Action: "gethangmucloi"
        });
        const data = await this.baseapi.post();
        popover.instance.setDataSource(data);
    }
    async PhanLoaiLoiPopover_OnChange(data) {
        const popover = this.module.tab.list.phanloailoi.popover;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_HANGMUCLOI",
            ProcedureName: "SP_QTY_QA_HANGMUCLOI",
            Action: "updatehangmucnhomloi",
            TypeTable: [{
                MaHangMucLoi: data.MaHangMucLoi,
                MaLoaiHangMucLoi: popover.params.MaLoi
            }]
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Cập nhật thành công", "success");
        await this.PhanLoaiLoiGrid_OnReload();
    }

    // tab phân loại module
    async PhanLoaiModuleContent_OnRender() {
        const content = this.module.tab.list.phanloaimodule.content;
        if (content.instance) {
            return;
        }
        content.instance = new BaseContent(
            "#" + this.module.tab.id + "_" + content.id,
            `

            <div id="${this.module.tab.list.phanloaimodule.grid.id}"></div>
            `,
            {}
        );
        content.instance.render();

        if (!this.module.tab.list.phanloaimodule.grid.instance) {
            await this.PhanLoaiModuleGrid_OnRender();
        }
    }
    async PhanLoaiModuleGrid_OnRender() {
        const grid = this.module.tab.list.phanloaimodule.grid;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_PHANLOAIKCSQA",
            ProcedureName: "SP_QTY_QA_PHANLOAIKCSQA",
            Action: "getphanloaikcsqa",
        })
        const data = await this.baseapi.post();
        let loiGroup = [];
        if (data.length > 0) {
            loiGroup = Object.keys(data[0]).filter(key => key.includes("_k_")).map(key => {
                const [id, name] = key.split("_k_");
                return {
                    MaModule: id,
                    TenModule: name,
                    Key: key
                };
            });
        }

        grid.instance = new PhanLoaiModuleGrid(
            "#" + grid.id,
            data,
            {
                keyExpr: "MaNhomLoi",
                editing: {
                    allowUpdating: false
                }
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#17a2b8",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.PhanLoaiModuleGrid_OnReload();
                }
            }
        );


        grid.instance.render();
        if (loiGroup.length > 0) {
            grid.instance.addGroup("User");
            loiGroup.forEach(group => {
                grid.instance.addGroupColumn("User", {
                    dataField: group.MaModule,
                    caption: group.TenModule,
                    alignment: "center",
                    width: 120,
                    allowSorting: false,
                    allowFiltering: false,

                    cellTemplate: (container, options) => {
                        $("<div>")
                            .dxCheckBox({
                                value: Number(options.data[group.Key]) === 1,

                                onValueChanged: (e) => {
                                    this.PhanLoaiModuleGrid_OnCheck(
                                        options.data,
                                        group,
                                        e.value
                                    );
                                }
                            })
                            .appendTo(container);
                    }
                });
            });
        }


    }
    async PhanLoaiModuleGrid_OnReload() {
        this.module.loading.instance.show();
        try {
            const grid = this.module.tab.list.phanloaimodule.grid;
            this.baseapi.buildPayload({
                TableName: "QTY_QA_PHANLOAIKCSQA",
                ProcedureName: "SP_QTY_QA_PHANLOAIKCSQA",
                Action: "getphanloaikcsqa",
            })
            const data = await this.baseapi.post();
            grid.instance.setDataSource(data);
        }
        finally {
            this.module.loading.instance.hide();
        }
    }
    async PhanLoaiModuleGrid_OnCheck(data, group, value) {

        this.baseapi.buildPayload({
            TableName: "QTY_QA_PHANLOAIKCSQA",
            ProcedureName: "SP_QTY_QA_PHANLOAIKCSQA",
            Action: "upsertphanloaikcsqa",
            TypeTable: [{
                MaNhomLoi: data.MaNhomLoi,
                MaModule: group.MaModule,
                TrangThai: value ? 1 : 0
            }]
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Cập nhật thành công", "success");
    }

    // tab thiết lập bộ phận
    async TLBophanContent_OnRender() {
        const content = this.module.tab.list.tlbophan.content;
        if (content.instance) {
            return;
        }
        content.instance = new BaseContent(
            "#" + this.module.tab.id + "_" + content.id,
            `
                <div id="${this.module.tab.list.tlbophan.buttons.add.id}"></div>
                <div id="${this.module.tab.list.tlbophan.buttons.save.id}"></div>
                <div class="row g-2 mt-1">
                    <div class="col-12 col-lg-6">
                        <div class="card shadow-sm h-100" style="border-radius:10px;border:1px solid #dee2e6;overflow:hidden;">
                            <div class="card-header d-flex justify-content-between align-items-center"
                                style="background:linear-gradient(135deg,#1565c0,#1e88e5);color:#fff;">
                                <span class="fw-semibold">Thiết lập bộ phận</span>
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="card-body p-2 bg-white" style="height:calc(100% - 42px);overflow:hidden;">
                                <div id="${this.module.tab.list.tlbophan.grid.tlbophan.id}" style="height:100%;width:100%;"></div>
                            </div>
                        </div>
                        
                    </div>

                    <div class="col-12 col-lg-6">
                         <div class="card shadow-sm h-100" style="border-radius:10px;border:1px solid #dee2e6;overflow:hidden;">
                            <div class="card-header d-flex justify-content-between align-items-center"
                                style="background:linear-gradient(135deg,#1565c0,#1e88e5);color:#fff;">
                                <span class="fw-semibold">Danh sách nhóm lỗi</span>
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="card-body p-2 bg-white" style="height:calc(100% - 42px);overflow:hidden;">
                                <div id="${this.module.tab.list.tlbophan.grid.dsnhomloi.id}" style="height:100%;width:100%;"></div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div id="${this.module.tab.list.tlbophan.dialog.id}"></div>
            `,
            {}
        );
        content.instance.render();
        if (!this.module.tab.list.tlbophan.dialog.instance) {
            await this.TLBophanDialog_OnRender();
        }
        if (!this.module.tab.list.tlbophan.buttons.add.instance) {
            await this.TLBophanAddButton_OnRender();
        }
        if (!this.module.tab.list.tlbophan.buttons.save.instance) {
            await this.TLBophanSaveButton_OnRender();
        }
        if (!this.module.tab.list.tlbophan.grid.tlbophan.instance) {
            await this.TLBophanGrid_OnRender();
        }
        if (!this.module.tab.list.tlbophan.grid.dsnhomloi.instance) {
            await this.DSNhomLoiGrid_OnRender();
        }
    }
    async TLBophanDialog_OnRender() {
        const dialog = this.module.tab.list.tlbophan.dialog;
        if (dialog.instance) {
            return;
        }
        dialog.instance = new ConfirmDevExtremeDialog(
            "#" + dialog.id,
            "Cảnh báo",
            "Bạn có chắc chắn muốn xóa dữ liệu này không?",
            {
                showCloseButton: true,
            },
            {},
            {
                onConfirm: async () => {
                    const grid = this.module.tab.list.tlbophan.grid.tlbophan;
                    grid.instance.closeEdit();
                    this.baseapi.buildPayload({
                        TableName: "QTY_QA_BOPHAN",
                        ProcedureName: "SP_QTY_QA_BOPHAN",
                        Action: "deletebophan",
                        TypeTable: [dialog.datasource]
                    }, "Post");
                    await this.baseapi.post();
                    this.module.toast.instance.show("Xóa thành công", "success");
                    dialog.instance.hide();
                    await this.TLBophanGrid_OnReload();
                }
            }
        )
        dialog.instance.init();
    }
    async TLBophanAddButton_OnRender() {
        const button = this.module.tab.list.tlbophan.buttons.add;
        button.instance = new BaseDevextremeButton(
            "#" + button.id,
            {
                Base: "Thêm",
                Pending: "Đang thêm...",
            },
            {
                icon: "add",
                width: "100px"
            },
            {}
        );
        button.instance.setEvent(async () => {
            await this.TLBophanAddButton_OnClick();
        });
        button.instance.render();
    }
    async TLBophanAddButton_OnClick() {
        const grid = this.module.tab.list.tlbophan.grid.tlbophan;
        const newid = this.helper.generate.generatedTimeKey("Bophan");
        grid.instance.buildRows(
            [
                {
                    MaBoPhan: newid,
                    TenBoPhan: "",
                    CodeBoPhan: "",
                    GhiChu: "",
                }
            ]
        );
    }
    async TLBophanSaveButton_OnRender() {
        const button = this.module.tab.list.tlbophan.buttons.save;
        button.instance = new BaseDevextremeButton(
            "#" + button.id,
            {
                Base: "Lưu",
                Pending: "Đang lưu...",
            },
            {
                type: "success",
                icon: "save",
                width: "100px"
            },
            {}
        );
        button.instance.setEvent(async () => {
            await this.TLBophanSaveButton_OnClick();
        });
        button.instance.render();
    }
    async TLBophanSaveButton_OnClick() {
        const grid = this.module.tab.list.tlbophan.grid.tlbophan;
        const data = grid.instance.getDataSource();
        grid.instance.closeEdit();
        this.baseapi.buildPayload({
            TableName: "QTY_QA_BOPHAN",
            ProcedureName: "SP_QTY_QA_BOPHAN",
            Action: "upsertbophan",
            TypeTable: data
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Lưu thành công", "success");
        await this.TLBophanGrid_OnReload();
    }
    async TLBophanGrid_OnRender() {
        const grid = this.module.tab.list.tlbophan.grid.tlbophan;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_BOPHAN",
            ProcedureName: "SP_QTY_QA_BOPHAN",
            Action: "getbophan"
        });
        const data = await this.baseapi.post();
        grid.instance = new BoPhanGrid(
            "#" + grid.id,
            data,
            {
                keyExpr: "MaBoPhan"
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#17a2b8",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.TLBophanGrid_OnReload();
                },
                onDelete: async (data) => {
                    await this.TLBophanGrid_OnDelete(data);
                },
                onFocusedRowChanged: async (data) => {
                    await this.TLBophanGrid_OnFocusedRowChange(data);
                },
            }
        );
        grid.instance.render();
    }
    async TLBophanGrid_OnReload() {
        this.module.loading.instance.show();
        try {
            const grid = this.module.tab.list.tlbophan.grid.tlbophan;
            this.baseapi.buildPayload({
                TableName: "QTY_QA_BOPHAN",
                ProcedureName: "SP_QTY_QA_BOPHAN",
                Action: "getbophan"
            });
            const data = await this.baseapi.post();
            grid.instance.setDataSource(data);
        }
        finally {
            this.module.loading.instance.hide();
        }
    }
    async TLBophanGrid_OnDelete(data) {
        const dialog = this.module.tab.list.tlbophan.dialog;
        dialog.datasource = data;
        await dialog.instance.show();
    }
    async TLBophanGrid_OnFocusedRowChange(data) {
        const grid = this.module.tab.list.tlbophan.grid.dsnhomloi;
        grid.params.MaBoPhan = data.MaBoPhan;
        await this.DSNhomLoiGrid_OnReload();
    }
    async DSNhomLoiGrid_OnRender() {
        const grid = this.module.tab.list.tlbophan.grid.dsnhomloi;
        grid.instance = new PhanLoaiBoPhanGrid(
            "#" + grid.id,
            [],
            {
                keyExpr: "MaNhomLoi"
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#17a2b8",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.DSNhomLoiGrid_OnReload();
                },
                onChange: async (data, value) => {
                    await this.DSNhomLoiGrid_OnChange(data, value);
                },
            }
        );
        grid.instance.render();
    }
    async DSNhomLoiGrid_OnReload() {
        const grid = this.module.tab.list.tlbophan.grid.dsnhomloi;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_PHANLOAIBOPHAN",
            ProcedureName: "SP_QTY_QA_PHANLOAIBOPHAN",
            Action: "getphanloaibophan",
            Parameter: grid.params.MaBoPhan
        });
        grid.datasource = await this.baseapi.post();
        console.log(grid.datasource, grid.params.MaBoPhan)
        grid.instance.setDataSource(grid.datasource);
    }
    async DSNhomLoiGrid_OnChange(data, value) {
        const grid = this.module.tab.list.tlbophan.grid.dsnhomloi;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_PHANLOAIBOPHAN",
            ProcedureName: "SP_QTY_QA_PHANLOAIBOPHAN",
            Action: "upsertphanloaibophan",
            TypeTable: [{
                MaBoPhan: grid.params.MaBoPhan,
                MaNhomLoi: data.MaNhomLoi,
                TrangThai: value
            }]
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Cập nhật thành công", "success");
        await this.DSNhomLoiGrid_OnReload();
    }

    // tab thiết lập module
    async TLKCSQAContent_OnRender() {
        const content = this.module.tab.list.tlkcsqa.content;
        if (content.instance) {
            return;
        }
        content.instance = new BaseContent(
            "#" + this.module.tab.id + "_" + content.id,
            `
                <div id="${this.module.tab.list.tlkcsqa.buttons.add.id}"></div>
                <div id="${this.module.tab.list.tlkcsqa.buttons.save.id}"></div>
                <div class="mt-2" id="${this.module.tab.list.tlkcsqa.grid.id}"></div>
                <div id="${this.module.tab.list.tlkcsqa.dialog.id}"></div>
            `,
            {}
        );
        content.instance.render();
        if (!this.module.tab.list.tlkcsqa.dialog.instance) {
            await this.TLKCSQADialog_OnRender();
        }
        if (!this.module.tab.list.tlkcsqa.buttons.add.instance) {
            await this.TLKCSQAAddButton_OnRender();
        }
        if (!this.module.tab.list.tlkcsqa.buttons.save.instance) {
            await this.TLKCSQASaveButton_OnRender();
        }
        if (!this.module.tab.list.tlkcsqa.grid.instance) {
            await this.TLKCSQAGrid_OnRender();
        }
    }
    async TLKCSQADialog_OnRender() {
        const dialog = this.module.tab.list.tlkcsqa.dialog;
        if (dialog.instance) {
            return;
        }
        dialog.instance = new ConfirmDevExtremeDialog(
            "#" + dialog.id,
            "Cảnh báo",
            "Bạn có chắc chắn muốn xóa dữ liệu này không?",
            {
                showCloseButton: true,
            },
            {},
            {
                onConfirm: async () => {
                    const grid = this.module.tab.list.tlkcsqa.grid;
                    grid.instance.closeEdit();
                    this.baseapi.buildPayload({
                        TableName: "QTY_QA_KCSQA",
                        ProcedureName: "SP_QTY_QA_KCSQA",
                        Action: "deletekcsqa",
                        TypeTable: [dialog.datasource]
                    }, "Post");
                    await this.baseapi.post();
                    this.module.toast.instance.show("Xóa thành công", "success");
                    dialog.instance.hide();
                    await this.TLKCSQAGrid_OnReload();
                }
            }
        )
        dialog.instance.init();
    }
    async TLKCSQAAddButton_OnRender() {
        const button = this.module.tab.list.tlkcsqa.buttons.add;
        button.instance = new BaseDevextremeButton(
            "#" + button.id,
            {
                Base: "Thêm",
                Pending: "Đang thêm...",
            },
            {
                icon: "add",
                width: "100px"
            },
            {}
        );
        button.instance.setEvent(async () => {
            await this.TLKCSQAAddButton_OnClick();
        });
        button.instance.render();
    }
    async TLKCSQAAddButton_OnClick() {
        const grid = this.module.tab.list.tlkcsqa.grid;
        const newid = this.helper.generate.generatedTimeKey("KCSQA");
        grid.instance.buildRows(
            [
                {
                    MaModule: newid,
                    TenModule: "",
                    CodeModule: "",
                    GhiChu: "",
                }
            ]
        );
    }
    async TLKCSQASaveButton_OnRender() {
        const button = this.module.tab.list.tlkcsqa.buttons.save;
        button.instance = new BaseDevextremeButton(
            "#" + button.id,
            {
                Base: "Lưu",
                Pending: "Đang lưu...",
            },
            {
                type: "success",
                icon: "save",
                width: "100px"
            },
            {}
        );
        button.instance.setEvent(async () => {
            await this.TLKCSQASaveButton_OnClick();
        });
        button.instance.render();
    }
    async TLKCSQASaveButton_OnClick() {
        const grid = this.module.tab.list.tlkcsqa.grid;
        const data = grid.instance.getDataSource();
        grid.instance.closeEdit();
        this.baseapi.buildPayload({
            TableName: "QTY_QA_KCSQA",
            ProcedureName: "SP_QTY_QA_KCSQA",
            Action: "upsertkcsqa",
            TypeTable: data
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Lưu thành công", "success");
        await this.TLKCSQAGrid_OnReload();
    }
    async TLKCSQAGrid_OnRender() {
        const grid = this.module.tab.list.tlkcsqa.grid;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_KCSQA",
            ProcedureName: "SP_QTY_QA_KCSQA",
            Action: "getkcsqa"
        });
        const data = await this.baseapi.post();
        grid.instance = new KCSQAGrid(
            "#" + grid.id,
            data,
            {
                keyExpr: "MaModule"
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#17a2b8",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.TLKCSQAGrid_OnReload();
                },
                onDelete: async (data) => {
                    await this.TLKCSQAGrid_OnDelete(data);
                }
            }
        );
        grid.instance.render();
    }
    async TLKCSQAGrid_OnReload() {
        this.module.loading.instance.show();
        try {
            const grid = this.module.tab.list.tlkcsqa.grid;
            this.baseapi.buildPayload({
                TableName: "QTY_QA_KCSQA",
                ProcedureName: "SP_QTY_QA_KCSQA",
                Action: "getkcsqa"
            });
            const data = await this.baseapi.post();
            grid.instance.setDataSource(data);
        }
        finally {
            this.module.loading.instance.hide();
        }
    }
    async TLKCSQAGrid_OnDelete(data) {
        const dialog = this.module.tab.list.tlkcsqa.dialog;
        dialog.datasource = data;
        await dialog.instance.show();
    }

    // tab thiết lập dạng lỗi
    async TLHangMucLoiContent_OnRender() {
        const content = this.module.tab.list.tlhangmucloi.content;
        if (content.instance) {
            return;
        }
        content.instance = new BaseContent(
            "#" + this.module.tab.id + "_" + content.id,
            `
                <div id="${this.module.tab.list.tlhangmucloi.buttons.add.id}"></div>
                <div id="${this.module.tab.list.tlhangmucloi.buttons.save.id}"></div>
                <div class="mt-2" id="${this.module.tab.list.tlhangmucloi.grid.id}"></div>
                <div id="${this.module.tab.list.tlhangmucloi.dialog.id}"></div>
            `,
            {}
        );
        content.instance.render();
        if (!this.module.tab.list.tlhangmucloi.dialog.instance) {
            await this.TLHangMucLoiDialog_OnRender();
        }
        if (!this.module.tab.list.tlhangmucloi.buttons.add.instance) {
            await this.TLHangMucLoiAddButton_OnRender();
        }
        if (!this.module.tab.list.tlhangmucloi.buttons.save.instance) {
            await this.TLHangMucLoiSaveButton_OnRender();
        }
        if (!this.module.tab.list.tlhangmucloi.grid.instance) {
            await this.TLHangMucLoiGrid_OnRender();
        }
    }
    async TLHangMucLoiDialog_OnRender() {
        const dialog = this.module.tab.list.tlhangmucloi.dialog;
        if (dialog.instance) {
            return;
        }
        dialog.instance = new ConfirmDevExtremeDialog(
            "#" + dialog.id,
            "Cảnh báo",
            "Bạn có chắc chắn muốn xóa dữ liệu này không?",
            {
                showCloseButton: true,
            },
            {},
            {
                onConfirm: async () => {
                    const grid = this.module.tab.list.tlhangmucloi.grid;
                    grid.instance.closeEdit();
                    this.baseapi.buildPayload({
                        TableName: "QTY_QA_HANGMUCLOI",
                        ProcedureName: "SP_QTY_QA_HANGMUCLOI",
                        Action: "deletehangmucloi",
                        TypeTable: [dialog.datasource]
                    }, "Post");
                    await this.baseapi.post();
                    this.module.toast.instance.show("Xóa thành công", "success");
                    dialog.instance.hide();
                    await this.TLHangMucLoiGrid_OnReload();
                }
            }
        )
        dialog.instance.init();
    }
    async TLHangMucLoiAddButton_OnRender() {
        const button = this.module.tab.list.tlhangmucloi.buttons.add;
        button.instance = new BaseDevextremeButton(
            "#" + button.id,
            {
                Base: "Thêm",
                Pending: "Đang thêm...",
            },
            {
                icon: "add",
                width: "100px"
            },
            {}
        );
        button.instance.setEvent(async () => {
            await this.TLHangMucLoiAddButton_OnClick();
        });
        button.instance.render();
    }
    async TLHangMucLoiAddButton_OnClick() {
        const grid = this.module.tab.list.tlhangmucloi.grid;
        const newid = this.helper.generate.generatedTimeKey("hangmucloi");
        grid.instance.buildRows(
            [
                {
                    MaHangMucLoi: newid,
                    TenHangMucLoi: "",
                    CodeHangMucLoi: "",
                    GhiChu: "",
                }
            ]
        );
    }
    async TLHangMucLoiSaveButton_OnRender() {
        const button = this.module.tab.list.tlhangmucloi.buttons.save;
        button.instance = new BaseDevextremeButton(
            "#" + button.id,
            {
                Base: "Lưu",
                Pending: "Đang lưu...",
            },
            {
                type: "success",
                icon: "save",
                width: "100px"
            },
            {}
        );
        button.instance.setEvent(async () => {
            await this.TLHangMucLoiSaveButton_OnClick();
        });
        button.instance.render();
    }
    async TLHangMucLoiSaveButton_OnClick() {
        const grid = this.module.tab.list.tlhangmucloi.grid;
        const data = grid.instance.getDataSource();
        grid.instance.closeEdit();
        this.baseapi.buildPayload({
            TableName: "QTY_QA_HANGMUCLOI",
            ProcedureName: "SP_QTY_QA_HANGMUCLOI",
            Action: "upserthangmucloi",
            TypeTable: data
        }, "Post");
        await this.baseapi.post();
        this.module.toast.instance.show("Lưu thành công", "success");
        await this.TLHangMucLoiGrid_OnReload();
    }
    async TLHangMucLoiGrid_OnRender() {
        const grid = this.module.tab.list.tlhangmucloi.grid;
        this.baseapi.buildPayload({
            TableName: "QTY_QA_HANGMUCLOI",
            ProcedureName: "SP_QTY_QA_HANGMUCLOI",
            Action: "gethangmucloi"
        });
        const data = await this.baseapi.post();
        grid.instance = new HangMucLoiGrid(
            "#" + grid.id,
            data,
            {
                keyExpr: "MaHangMucLoi"
            },
            {
                cell: {
                    header: {
                        backgroundColor: "#17a2b8",
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff"
                    }
                }
            },
            {
                onReload: async () => {
                    await this.TLHangMucLoiGrid_OnReload();
                },
                onDelete: async (data) => {
                    await this.TLHangMucLoiGrid_OnDelete(data);
                }
            }
        );
        grid.instance.render();
    }
    async TLHangMucLoiGrid_OnReload() {
        this.module.loading.instance.show();
        try {
            const grid = this.module.tab.list.tlhangmucloi.grid;
            this.baseapi.buildPayload({
                TableName: "QTY_QA_HANGMUCLOI",
                ProcedureName: "SP_QTY_QA_HANGMUCLOI",
                Action: "gethangmucloi"
            });
            const data = await this.baseapi.post();
            grid.instance.setDataSource(data);
        }
        finally {
            this.module.loading.instance.hide();
        }
    }
    async TLHangMucLoiGrid_OnDelete(data) {
        const dialog = this.module.tab.list.tlhangmucloi.dialog;
        dialog.datasource = data;
        await dialog.instance.show();
    }
}

BaseFoundation.registerClass("LoaiLoiModule", LoaiLoiModule);