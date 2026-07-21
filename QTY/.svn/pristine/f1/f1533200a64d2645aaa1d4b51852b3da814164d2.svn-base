
class BaseDevextremeButton {
    constructor(Container, Label, Setting, Appearance) {
        this.Container = Container;
        this.Label = Label || {};
        this.Setting = {
            type: Setting?.type ?? "default",
            stylingMode: Setting?.stylingMode ?? "contained",
            disabled: false,
            visible: true,
            icon: Setting?.icon ?? null,
            width: Setting?.width ?? null,
            height: Setting?.height ?? null,
        };
        this.Appearance = Appearance || {};
        this.OnClick = null;

        this.IsPending = false;

        this.Instance = null;
    }

    render() {
        const self = this;
        this.Instance = $(this.Container).dxButton({
            text: self.Label.Base,
            ...self.Setting,
            async onClick(e) {
                if (self.IsPending) return;

                if (typeof self.OnClick !== "function") {
                    return;
                }

                try {
                    self.pending(true);

                    await self.OnClick(e, self);
                }
                finally {
                    self.pending(false);
                }
            },
        }).dxButton("instance");
    }

    pending(state = true) {
        this.IsPending = state;

        if (!this.Instance) return;

        this.Instance.option({
            text: state
                ? (this.Label.Pending || this.Label.Base)
                : this.Label.Base,

            disabled: state
        });
    }

    setEvent(callback) {
        this.OnClick = callback;
    }

    dispose() {
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseDevextremeButton", BaseDevextremeButton);

class DropdownDevextremeButton {
    constructor(Container, Label, Setting, Appearance) {
        this.Container = Container;
        this.Label = Label || {};

        this.Setting = {
            icon: Setting.icon ?? null,
            disabled: false,
            visible: true,
            width: Setting.width ?? null,
            height: Setting.height ?? null,
        };

        this.Appearance = Appearance || {};

        this.Menu = [];
        this.Events = {};

        this.Instance = null;
    }

    render() {
        const self = this;

        this.Instance = $(this.Container).dxDropDownButton({
            text: self.Label.Base,
            icon: self.Setting.icon,
            items: self.Menu,

            disabled: self.Setting.disabled,
            visible: self.Setting.visible,
            width: self.Setting.width,
            height: self.Setting.height,

            async onItemClick(e) {
                const key = e.itemData.id;

                if (typeof self.Events[key] === "function") {
                    await self.Events[key](e, self);
                }
            }
        }).dxDropDownButton("instance");
    }

    setMenu(menu) {
        this.Menu = menu || [];

        this.Instance?.option("items", this.Menu);
    }

    setEvent(key, callback) {
        this.Events[key] = callback;
    }

    dispose() {
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("DropdownDevextremeButton", DropdownDevextremeButton);

class BaseBootstrapButton {
    constructor(Container, Label, Setting, Appearance) {
        this.Container = Container;
        this.Label = Label || {};
        this.Setting = {
            type: Setting.type ?? "primary",
            disabled: Setting.disabled ?? false,
            visible: Setting.visible ?? true,
            icon: Setting.icon ?? null
        };
        this.Appearance = {
            width: Appearance?.width ?? null,
            height: Appearance?.height ?? null,
            padding: Appearance?.padding ?? null,
            margin: Appearance?.margin ?? null,
            color: Appearance?.color ?? null,
            background: Appearance?.background ?? null,
            border: Appearance?.border ?? null,
            borderRadius: Appearance?.borderRadius ?? null,
            hover: Appearance?.hover ?? {},
            className: Appearance?.className ?? "",
            style: Appearance?.style ?? {}
        };
        this.OnClick = null;

        this.IsPending = false;

        this.Instance = null;
    }

    render() {
        const self = this;

        const iconHtml = self.getIconHtml();

        $(self.Container).html(`
            <button type="button" class="btn btn-${self.Setting.type} ${self.Appearance.className}">
                ${iconHtml}${self.Label.Base}
            </button>
        `);

        self.Instance = $(self.Container).find("button");

        self.Instance.css({
            width: self.Appearance.width,
            height: self.Appearance.height,
            padding: self.Appearance.padding,
            margin: self.Appearance.margin,
            color: self.Appearance.color,
            background: self.Appearance.background,
            border: self.Appearance.border,
            borderRadius: self.Appearance.borderRadius,
            ...self.Appearance.style
        });

        const normalStyle = {
            color: self.Appearance.color,
            background: self.Appearance.background,
            border: self.Appearance.border
        };

        const hoverStyle = self.Appearance.hover;

        self.Instance
            .on("mouseenter", function () {
                $(this).css(hoverStyle);
            })
            .on("mouseleave", function () {
                $(this).css(normalStyle);
            });

        self.Instance.prop("disabled", self.Setting.disabled);

        if (!self.Setting.visible) {
            self.Instance.hide();
        }

        self.Instance.on("click", async function (e) {
            if (self.IsPending) return;

            if (typeof self.OnClick !== "function") {
                return;
            }

            try {
                self.pending(true);

                await self.OnClick(e, self);
            }
            finally {
                self.pending(false);
            }
        });
    }

    getIconHtml() {
        if (!this.Setting.icon) {
            return "";
        }

        const hasFontAwesome =
            document.querySelector('link[href*="font-awesome"]') ||
            document.querySelector('link[href*="fontawesome"]') ||
            document.querySelector('style[data-font-awesome]');

        if (!hasFontAwesome) {
            return "";
        }

        return `<i class="${this.Setting.icon}"></i> `;
    }

    pending(state = true) {
        this.IsPending = state;

        if (!this.Instance) return;

        this.Instance.html(
            `${this.getIconHtml()}${state ? (this.Label.Pending || this.Label.Base) : this.Label.Base}`
        );

        this.Instance.prop("disabled", state);
    }

    setEvent(callback) {
        this.OnClick = callback;
    }

    dispose() {
        this.Instance?.off();
        this.Instance?.remove();

        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseBootstrapButton", BaseBootstrapButton);

class DropdownBootstrapButton {
    constructor(Container, Label, Setting, Appearance) {
        this.Container = Container;
        this.Label = Label || {};
        this.Setting = {
            type: Setting.type ?? "primary",
            disabled: false,
            visible: true,
            icon: Setting.icon ?? null,
            width: Setting.width ?? null,
            height: Setting.height ?? null,
        };
        this.Appearance = Appearance || {};

        this.Menu = [];
        this.Events = {};

        this.Instance = null;
    }

    render() {
        const self = this;

        const iconHtml = self.getIconHtml();

        $(self.Container).html(`
            <div class="dropdown">
                <button type="button" class="btn btn-${self.Setting.type} dropdown-toggle" data-bs-toggle="dropdown">
                    ${iconHtml}${self.Label.Base}
                </button>
                <ul class="dropdown-menu"></ul>
            </div>
        `);

        self.Instance = $(self.Container).find("button");
        self.MenuContainer = $(self.Container).find(".dropdown-menu");

        if (self.Setting.width) {
            self.Instance.css("width", self.Setting.width);
        }

        if (self.Setting.height) {
            self.Instance.css("height", self.Setting.height);
        }

        self.Instance.prop("disabled", self.Setting.disabled);

        if (!self.Setting.visible) {
            self.Instance.hide();
        }

        self.renderMenu();
    }

    getIconHtml() {
        if (!this.Setting.icon) {
            return "";
        }

        const hasFontAwesome =
            document.querySelector('link[href*="font-awesome"]') ||
            document.querySelector('link[href*="fontawesome"]') ||
            document.querySelector('style[data-font-awesome]');

        if (!hasFontAwesome) {
            return "";
        }

        return `<i class="${this.Setting.icon}"></i> `;
    }

    renderMenu() {
        const self = this;

        if (!self.MenuContainer) return;

        self.MenuContainer.empty();

        self.Menu.forEach(function (item) {
            const menuItem = $(`
                <li>
                    <a class="dropdown-item" href="javascript:void(0)">
                        ${item.icon ? `${self.getMenuIconHtml(item.icon)}` : ""}
                        ${item.text}
                    </a>
                </li>
            `);

            menuItem.on("click", async function (e) {
                const callback = self.Events[item.id];

                if (typeof callback === "function") {
                    await callback(e, self, item);
                }
            });

            self.MenuContainer.append(menuItem);
        });
    }

    getMenuIconHtml(icon) {
        const hasFontAwesome =
            document.querySelector('link[href*="font-awesome"]') ||
            document.querySelector('link[href*="fontawesome"]') ||
            document.querySelector('style[data-font-awesome]');

        if (!hasFontAwesome) {
            return "";
        }

        return `<i class="${icon} me-2"></i>`;
    }

    setMenu(menu) {
        this.Menu = menu || [];

        this.renderMenu();
    }

    setEvent(key, callback) {
        this.Events[key] = callback;
    }

    dispose() {
        this.MenuContainer?.find("*").off();
        this.Instance?.off();

        $(this.Container).empty();

        this.Instance = null;
    }
}
BaseFoundation.registerClass("DropdownBootstrapButton", DropdownBootstrapButton);