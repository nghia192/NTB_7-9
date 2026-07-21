

class BaseDevExtremePopup {
    constructor(Container, Setting, Appearance, Buttons) {
        this.Container = Container;
        this.Setting = Setting ?? {};
        this.Appearance = {
            theme: Appearance?.theme ?? "primary",
            classes: {
                popup: Appearance?.classes?.popup ?? "",
                header: Appearance?.classes?.header ?? "",
                footer: Appearance?.classes?.footer ?? ""
            },
            styles: {
                popup: Appearance?.styles?.popup ?? {},
                header: Appearance?.styles?.header ?? {},
                footer: Appearance?.styles?.footer ?? {}
            }
        };
        this.Buttons = Buttons ?? [];
        this.Content = "";
        this.Instance = null;
    }

    setBody(html) {
        this.setContent(html);
    }

    setContent(content) {
        this.Content = content;
    }

    init() {
        const self = this;
        this.Instance = $(self.Container).dxPopup({
            ...self.buildSetting(),
            contentTemplate: (contentElement) => {
                if (typeof self.Content === "function") {
                    const result = self.Content();
                    if (result instanceof jQuery) contentElement.append(result);
                    else contentElement.html(result);
                } else if (self.Content instanceof jQuery) {
                    contentElement.append(self.Content);
                } else {
                    contentElement.html(self.Content ?? "");
                }
            },
            onShown: () => {
                const popup = self.Instance.content().closest(".dx-overlay-content");

                const title = popup.find(".dx-popup-title");
                const content = popup.find(".dx-popup-content");
                const footer = popup.find(".dx-popup-bottom");

                title.addClass(self.Appearance.classes.header);
                footer.addClass(self.Appearance.classes.footer);

                if (self.Appearance.styles.header) {
                    title.css(self.Appearance.styles.header);

                    if (self.Appearance.styles.header.color) {
                        title.find("*").css("color", self.Appearance.styles.header.color);
                    }
                }

                if (self.Appearance.styles.popup) {
                    content.css(self.Appearance.styles.popup);
                }

                if (self.Appearance.styles.footer) {
                    footer.css(self.Appearance.styles.footer);

                    if (self.Appearance.styles.footer.color) {
                        footer.find("*").css("color", self.Appearance.styles.footer.color);
                    }
                }
            },
            toolbarItems: self.buildButton(self.Buttons)
        }).dxPopup("instance");

        return this.Instance;
    }

    buildButton(buttons = []) {
        if (!Array.isArray(buttons) || !buttons.length) return [];
        let buttonlist = [];
        buttons.forEach(btn => {
            buttonlist.push({
                widget: "dxButton",
                toolbar: btn.toolbar ?? "bottom",
                location: btn.location ?? "after",
                options: {
                    text: btn.text,
                    icon: btn.icon,
                    type: btn.type,
                    stylingMode: btn.stylingMode,
                    onClick: async () => {
                        let hide = true;
                        if (btn.onClick) hide = await btn.onClick();
                        if (hide) this.hide();
                    }
                }
            });
        });
        return buttonlist;
    }

    buildSetting() {
        console.log(this.Setting)
        return {
            visible: false,
            title: this.Setting.title ?? "",
            width: this.Setting.width ?? 600,
            height: this.Setting.height ?? "auto",
            showTitle: this.Setting.showTitle ?? true,
            showCloseButton: this.Setting.showCloseButton ?? true,
            closeOnOutsideClick: this.Setting.closeOnOutsideClick ?? false,
            dragEnabled: this.Setting.dragEnabled ?? true,
            resizeEnabled: this.Setting.resizeEnabled ?? false,
            shading: this.Setting.shading ?? true,
            wrapperAttr: {
                class: [
                    "base-popup",
                    this.getThemeClass(),
                    this.Appearance.classes.popup
                ].filter(Boolean).join(" ")
            }
        };
    }

    getThemeClass() {
        return `popup-${this.Appearance.theme}`;
    }

    show() {
        this.Instance?.show();
    }

    hide() {
        this.Instance?.hide();
    }

    toggle(show) {
        if (!this.Instance) return;
        if (show === undefined) this.Instance.option("visible", !this.Instance.option("visible"));
        else this.Instance.option("visible", show);
    }

    dispose() {
        this.hide();
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseDevExtremePopup", BaseDevExtremePopup);