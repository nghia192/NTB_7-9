

class BaseBootstrapDialog {
    constructor(Container, Title, Message, Setting, Appearance, Buttons) {
        this.Container = Container;
        this.Title = Title;
        this.Message = Message;
        this.Setting = Setting;

        this.Appearance = {
            theme: Appearance?.theme ?? "primary",

            classes: {
                popup: Appearance?.classes?.popup ?? "",
                header: Appearance?.classes?.header ?? "",
                body: Appearance?.classes?.body ?? "",
                footer: Appearance?.classes?.footer ?? ""
            },

            styles: {
                popup: Appearance?.styles?.popup ?? {},
                header: Appearance?.styles?.header ?? {},
                body: Appearance?.styles?.body ?? {},
                footer: Appearance?.styles?.footer ?? {}
            }
        };

        this.Buttons = Buttons;

        this.Instance = null;
    }

    init() {
        const id = this.Container.replace("#", "");

        $(this.Container).html(`
            <div class="modal fade"
                 id="${id}-modal"
                 tabindex="-1">

                <div class="modal-dialog">
                    <div class="modal-content ${this.Appearance.classes.popup}">

                        <div class="modal-header ${this.Appearance.classes.header}">
                            <h5 class="modal-title"></h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                            </button>
                        </div>

                        <div class="modal-body ${this.Appearance.classes.body}">
                        </div>

                        <div class="modal-footer ${this.Appearance.classes.footer}">
                        </div>

                    </div>
                </div>

            </div>
        `);

        const modalElement = document.getElementById(`${id}-modal`);
        this.Instance =
            new bootstrap.Modal(
                modalElement,
                {
                    backdrop:
                        this.Setting.closeOnOutsideClick
                            ? true
                            : "static",

                    keyboard:
                        this.Setting.closeOnOutsideClick
                }
            );
        this.buildDialog();
    }

    buildDialog() {
        const id = this.Container.replace("#", "");

        const modal = $(`#${id}-modal`);

        modal
            .find(".modal-title")
            .text(this.Title);

        modal
            .find(".modal-body")
            .text(this.Message);

        modal
            .find(".modal-content")
            .css(this.Appearance.styles.popup);

        modal
            .find(".modal-header")
            .css(this.Appearance.styles.header);

        modal
            .find(".modal-body")
            .css(this.Appearance.styles.body);

        modal
            .find(".modal-footer")
            .css(this.Appearance.styles.footer);

        this.buildButtons();
    }

    buildButtons() {
        const id = this.Container.replace("#", "");
        const footer = $(`#${id}-modal .modal-footer`);
        footer.empty();
        this.Buttons.forEach(btn => {
            const button = $(`
                <button
                    type="button"
                    class="btn btn-${btn.type || "secondary"}">
                    ${btn.text}
                </button>
            `);

            button.on(
                "click",
                async () => {

                    let hide = true;

                    if (btn.onClick) {
                        hide = await btn.onClick();
                    }

                    if (hide) {
                        this.hide();
                    }
                }
            );
            footer.append(button);
        });
    }

    show(title = null, message = null) {
        if (title != null) {
            this.Title = title;
        }
        if (message != null) {
            this.Message = message;
        }
        this.buildDialog();
        this.Instance?.show();
    }
    hide() {
        this.Instance?.hide();
    }
    dispose() {
        this.hide();
        $(this.Container).empty();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseBootstrapDialog", BaseBootstrapDialog);

class ConfirmBootstrapDialog extends BaseBootstrapDialog {
    constructor(
        Container,
        Title,
        Message,
        Setting,
        Appearance,
        Events = {}
    ) {
        super(
            Container,
            Title,
            Message,
            Setting,
            Appearance,
            [
                {
                    text: "Huỷ",
                    type: "secondary",
                    onClick: Events.onCancel
                },
                {
                    text: "Xác nhận",
                    type: "success",
                    onClick: Events.onConfirm
                }
            ]
        );
    }
}
BaseFoundation.registerClass("ConfirmBootstrapDialog", ConfirmBootstrapDialog);

class ChoiceBootstrapDialog extends BaseBootstrapDialog {
    constructor(
        Container,
        Title,
        Message,
        Setting,
        Appearance,
        Events = {}
    ) {
        super(
            Container,
            Title,
            Message,
            Setting,
            Appearance,
            [
                {
                    text: "Huỷ",
                    type: "secondary",
                    onClick: Events.onCancel
                },
                {
                    text: "Không",
                    type: "danger",
                    onClick: Events.onNo
                },
                {
                    text: "Có",
                    type: "success",
                    onClick: Events.onOK
                }
            ]
        );
    }
}
BaseFoundation.registerClass("ChoiceBootstrapDialog", ChoiceBootstrapDialog);

class AlertBootstrapDialog extends BaseBootstrapDialog {
    constructor(
        Container,
        Title,
        Message,
        Setting,
        Appearance,
        Events = {}
    ) {
        super(
            Container,
            Title,
            Message,
            Setting,
            Appearance,
            [
                {
                    text: "Xác nhận",
                    type: "success",
                    onClick: Events.onOK
                }
            ]
        );
    }
}
BaseFoundation.registerClass("AlertBootstrapDialog", AlertBootstrapDialog);

class BaseDevExtremeDialog {
    constructor(Container, Title, Message, Setting, Appearance, Buttons) {
        this.Container = Container;
        this.Title = Title;
        this.Message = Message;
        this.Appearance = {
            theme: Appearance?.theme ?? "primary",

            classes: {
                popup: Appearance?.classes?.popup ?? "",
                header: Appearance?.classes?.header ?? "",
                body: Appearance?.classes?.body ?? "",
                footer: Appearance?.classes?.footer ?? ""
            },

            styles: {
                popup: Appearance?.styles?.popup ?? {},
                header: Appearance?.styles?.header ?? {},
                body: Appearance?.styles?.body ?? {},
                footer: Appearance?.styles?.footer ?? {}
            }
        };
        this.Setting = Setting;
        this.Buttons = Buttons;

        this.Instance = null;
    }

    init() {
        const self = this;
        const messageid = `${self.Container}-message`;
        this.Instance = $(self.Container).dxPopup({
            ...self.buildSetting(),
            contentTemplate: () => `
                <div id="${messageid.replace("#", "")}"
                    class="${self.Appearance.classes.body}">
                </div>
            `,
            onShown: () => {
                const popup = self.Instance.element();
                const body = $(messageid);
                body.text(self.Message);
                body.css(
                    self.Appearance.styles.body
                );
                popup
                    .find(".dx-popup-title")
                    .addClass(
                        self.Appearance.classes.header
                    )
                    .css(
                        self.Appearance.styles.header
                    );
                self.Instance.option("title", self.Title);
            },

            toolbarItems: this.buildButton(self.Buttons)
        }).dxPopup("instance");
    }

    buildButton(buttons = []) {
        if (!Array.isArray(buttons) || !buttons.length) return [];
        let buttonlist = [];
        buttons.forEach(btn => {
            buttonlist.push({
                widget: "dxButton",
                toolbar: btn.toolbar,
                location: btn.location,
                options: {
                    text: btn.text,
                    type: btn.type,
                    onClick: async () => {
                        let hide = true;
                        if (btn.onClick) {
                            hide = await btn.onClick();
                        }
                        if (hide) this.Instance.hide();
                    }
                }
            });
        });
        return buttonlist;
    }

    buildSetting() {
        return {
            visible: false,
            width: this.Setting.width ?? 360,
            height: this.Setting.height ?? "auto",
            showCloseButton: this.Setting.showCloseButton ?? false,
            //closeOnOutsideClick: this.Setting.closeOnOutsideClick ?? false,
            dragEnabled: this.Setting.dragEnabled ?? false,
            wrapperAttr: {
                class: [
                    "base-dialog",
                    this.getThemeClass(),
                    this.Appearance?.classes?.popup
                ]
                    .filter(Boolean)
                    .join(" ")
            },
        };
    }

    getThemeClass() {
        return `dialog-${this.Appearance?.theme}`;
    }

    show(title = null, message = null) {
        if (title != null) {
            this.Title = title;
        }
        if (message != null) {
            this.Message = message;
        }
        this.Instance?.show();
    }
    hide() {
        this.Instance?.hide();
    }
    dispose() {
        this.hide();
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseDevExtremeDialog", BaseDevExtremeDialog);

class ConfirmDevExtremeDialog extends BaseDevExtremeDialog {
    constructor(
        Container,
        Title,
        Message,
        Setting,
        Appearance,
        Events = {}
    ) {

        super(
            Container,
            Title,
            Message,
            Setting,
            Appearance,
            [
                {
                    text: "Huỷ",
                    type: "normal",
                    toolbar: "bottom",
                    location: "after",
                    onClick: () => false
                },
                {
                    text: "Xác nhận",
                    type: "success",
                    toolbar: "bottom",
                    location: "after",
                    onClick: (Events.onConfirm ?? (() => true))
                }
            ]
        );
    }
}
BaseFoundation.registerClass("ConfirmDevExtremeDialog", ConfirmDevExtremeDialog);

class ChoiceNoDevExtremeDialog extends BaseDevExtremeDialog {
    constructor(
        Container,
        Title,
        Message,
        Setting,
        Appearance,
        Events = {}
    ) {

        super(
            Container,
            Title,
            Message,
            Setting,
            Appearance,
            [
                {
                    text: "Huỷ",
                    type: "normal",
                    toolbar: "bottom",
                    location: "before",
                    onClick: () => false
                },
                {
                    text: "Không",
                    type: "normal",
                    toolbar: "bottom",
                    location: "after",
                    onClick: (Events.onNo ?? (() => false))
                },
                {
                    text: "Có",
                    type: "success",
                    toolbar: "bottom",
                    location: "after",
                    onClick: (Events.onOK ?? (() => true))
                }
            ]
        );
    }
}
BaseFoundation.registerClass("ChoiceNoDevExtremeDialog", ChoiceNoDevExtremeDialog);

class AlertDevExtremeDialog extends BaseDevExtremeDialog {
    constructor(
        Container,
        Title,
        Message,
        Setting,
        Appearance,
        Events = {}
    ) {

        super(
            Container,
            Title,
            Message,
            Setting,
            Appearance,
            [
                {
                    text: "Xác nhận",
                    type: "normal",
                    toolbar: "bottom",
                    location: "center",
                    onClick: (Events.onOK ?? (() => true))
                },
            ]
        );
    }
}
BaseFoundation.registerClass("AlertDevExtremeDialog", AlertDevExtremeDialog);




