

class BaseDevextremeToast {
    constructor(Container, Setting, Apprearance) {
        this.Container = Container;

        const position = Setting?.position || {};
        this.Setting = {
            visible: false,
            maxWidth: Setting?.maxWidth ?? 320,
            minWidth: Setting?.minWidth ?? 200,
            displayTime: Setting?.displayTime ?? 2200,
            wordWrap: Setting?.wordWrap ?? true,
            position: {
                at: position.at ?? "top right",
                my: position.my ?? "top right",
                offset: position.offset ?? "-16 16"
            }
        };
        this.Appearance = Apprearance || {};
        this.Instance = null;
    }
    init() {
        const self = this;
        this.Instance = $(self.Container).dxToast({
            ...this.Setting
        }).dxToast("instance");
    }

    show(message, type) {
        this.Instance.hide();        
        this.Instance.option({
            message,
            type,
            elementAttr: {
                class: this.Appearance.class || ""
            } });
        this.Instance?.show();
    }
    hide() {
        this.Instance?.hide();
    }

    dispose() {
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseDevextremeToast", BaseDevextremeToast);