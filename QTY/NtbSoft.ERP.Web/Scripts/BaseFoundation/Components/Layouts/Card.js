

class BaseBootstrapCard {

    constructor(Container, Setting, Appearance) {
        this.Container = Container;
        this.Setting = {
            title: Setting?.title ?? "",
            icon: Setting?.icon ?? ""
        };
        this.Appearance = {

            borderRadius: Appearance?.borderRadius ?? "5px",

            border: Appearance?.border ?? "1px solid #dee2e6",

            headerBackground:
                Appearance?.headerBackground ??
                "linear-gradient(135deg,#0d1526,#162340)",

            headerColor:
                Appearance?.headerColor ??
                "#fff",

            bodyClass:
                Appearance?.bodyClass ??
                "p-2 bg-white",

            height:
                Appearance?.height ??
                null,

            minHeight:
                Appearance?.minHeight ??
                null,

            maxHeight:
                Appearance?.maxHeight ??
                null,

            fillParent:
                Appearance?.fillParent ??
                false,

            bodyScroll:
                Appearance?.bodyScroll ??
                false

        };
        this.HeaderItems = [];
        this.Body = "";
        this.Instance = null;

    }
    setBody(html) {
        this.Body = html;
    }
    append(html) {
        this.Body += html;
        this.Instance
            ?.find(".base-card-body")
            .append(html);
    }
    html(html) {
        this.Body = html;
        this.Instance
            ?.find(".base-card-body")
            .html(html);
    }
    clear() {
        this.Body = "";
        this.Instance
            ?.find(".base-card-body")
            .empty();
    }
    setTitle(title) {
        this.Setting.title = title;
        this.Instance
            ?.find(".card-header span")
            .text(title);
    }
    addHeaderItem(id) {

        this.HeaderItems.push(id);

        if (this.Instance) {

            const header = this.Instance.find(".base-card-header-items");

            header.append(`<div id="${id}"></div>`);

            this._toggleHeaderIcon();

        }

    }
    addHeaderItems(ids = []) {

        ids.forEach(id => this.addHeaderItem(id));

    }
    _toggleHeaderIcon() {

        const icon = this.Instance.find(".base-card-header-icon");

        if (this.HeaderItems.length > 0)
            icon.hide();
        else
            icon.show();

    }
    setHeight(height) {
        this.Appearance.height = height;
        this.Instance
            ?.find(".card")
            .css("height", height);
    }
    setMinHeight(height) {
        this.Appearance.minHeight = height;
        this.Instance
            ?.find(".card")
            .css("min-height", height);
    }
    setMaxHeight(height) {
        this.Appearance.maxHeight = height;
        this.Instance
            ?.find(".card")
            .css("max-height", height);
    }
    fillParent(enable = true) {
        this.Appearance.fillParent = enable;
        this._ensureContainerHeight();
    }
    setBodyScroll(enable = true) {
        this.Appearance.bodyScroll = enable;
        this.Instance
            ?.find(".base-card-body")
            .css("overflow", enable ? "auto" : "hidden");
    }
    _ensureContainerHeight() {
        if (!this.Appearance.fillParent)
            return;
        const container = $(this.Container);
        container.css({
            height: "100%"
        });
    }
    render() {
        this._ensureContainerHeight();

        const cardStyle = [];

        cardStyle.push(`border-radius:${this.Appearance.borderRadius}`);
        cardStyle.push(`border:${this.Appearance.border}`);
        cardStyle.push(`overflow:hidden`);

        if (this.Appearance.height)
            cardStyle.push(`height:${this.Appearance.height}`);

        if (this.Appearance.minHeight)
            cardStyle.push(`min-height:${this.Appearance.minHeight}`);

        if (this.Appearance.maxHeight)
            cardStyle.push(`max-height:${this.Appearance.maxHeight}`);

        if (this.Appearance.fillParent)
            cardStyle.push(`height:100%`);

        $(this.Container).html(`
            <div style="height:100%;display:flex;flex-direction:column;min-height:0;">
                <div class="card shadow-sm d-flex flex-column"
                    style="height:100%;${cardStyle.join(";")}">

                    <div
                        class="card-header d-flex justify-content-between align-items-center"
                        style="
                            background:${this.Appearance.headerBackground};
                            color:${this.Appearance.headerColor};
                        ">

                        <span class="fw-semibold">
                            ${this.Setting.title}
                        </span>

                        <div class="d-flex align-items-center gap-2">

                            <div class="base-card-header-items d-flex align-items-center gap-2">
                                ${this.HeaderItems.map(id => `<div id="${id}"></div>`).join("")}
                            </div>

                            ${this.HeaderItems.length === 0 && this.Setting.icon
                                ? `<i class="base-card-header-icon ${this.Setting.icon}"></i>`
                                : ""}

                        </div>

                    </div>

                    <div
                        class="
                            card-body
                            base-card-body
                            flex-grow-1
                            ${this.Appearance.bodyClass}
                        "
                        style="overflow:${this.Appearance.bodyScroll ? "auto" : "hidden"};flex:1;min-height:0;">

                        ${this.Body}

                    </div>

                </div>
            </div>
        `);

        this.Instance = $(this.Container);

    }
    dispose() {
        this.Instance?.empty();
        this.Instance = null;
    }

}
BaseFoundation.registerClass("BaseBootstrapCard", BaseBootstrapCard);