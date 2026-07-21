

class BaseDevextremeTab {
    constructor(Container, Setting, Appearance, Events) {
        this.Reference = Container.replace("#", "");
        this.Container = Container;
        this.Setting = {
            selectedIndex: Setting?.selectedIndex ?? 0,
        };
        this.Appearance = Appearance || {};
        this.Events = Events || {};

        this.Items = [];
        this.Contents = {};
        this.ActiveId = null;     
        this.ContentInstance = null;

        this.Instance = null;
        
    }
    render() {
        const self = this;

        $(self.Container).html(`
            <div id="${self.Reference}_Header"></div>
            <div id="${self.Reference}_Content" style="height:100%;min-height:0;overflow:auto;display:flex;flex-direction:column;"></div>
        `);

        self.Instance = $(`#${self.Reference}_Header`).dxTabs({
            dataSource: self.Items,
            elementAttr: {
                class: "base-tab"
            },
            keyExpr: "id",
            selectedIndex: self.Setting.selectedIndex,
            scrollingEnabled: true,
            showNavButtons: true,
            onSelectionChanged(e) {
                self.ContentInstance.option("selectedItem", e.addedItems[0]);
            }
        }).dxTabs("instance");

        self.ContentInstance = $(`#${self.Reference}_Content`).dxMultiView({
            dataSource: self.Items,
            selectedIndex: self.Setting.selectedIndex,
            swipeEnabled: false,
            animationEnabled: true,
            itemTemplate(item) {
                return `
                    <div
                        id="${self.Reference}_${item.id}Content"
                        style="height:100%;min-height:0;overflow:auto;display:flex;flex-direction:column;">
                        class="pt-2">
                    </div>
                `;
            },
            async onSelectionChanged(e) {
                await self.load(e.addedItems[0].id);
            }
        }).dxMultiView("instance");
        self.ContentInstance.option("height", "100%");
        if (self.Items.length > 0) {
            return self.load(self.Items[self.Setting.selectedIndex].id);
        }
    }

    addItem(id, text, event) {
        this.Items.push({id, text});
        this.Contents[id] = event;
    }

    async load(id) {
        if (this.ActiveId) {
            $(`#${this.Reference}_${this.ActiveId}Content`).hide();
        }

        const container = `#${this.Reference}_${id}Content`;

        if (typeof this.Contents[id] === "function") {
            await this.Contents[id]();
        }
        $(container).css({
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minHeight: 0,
    overflow: "auto"
});

        this.ActiveId = id;
    }

    setEvent(id, callback) {
        this.Contents[id] = callback;
    }

    getContainer(id) {
        return `#${this.Reference}_${id}Content`;
    }

    getActiveId() {
        return this.ActiveId;
    }

    select(id) {
        const index = this.Items.findIndex(x => x.id === id);
        if (index < 0) {
            return;
        }

        this.Instance.option("selectedIndex", index);
    }

    dispose() {
        this.Instance?.dispose();
        this.ContentInstance?.dispose();

        this.Instance = null;
        this.ContentInstance = null;
    }
}
BaseFoundation.registerClass("BaseDevextremeTab", BaseDevextremeTab);