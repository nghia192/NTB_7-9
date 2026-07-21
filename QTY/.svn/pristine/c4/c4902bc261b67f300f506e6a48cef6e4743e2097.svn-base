

class BaseDevextremeLoading {
    constructor(Container, Setting, Appearance) {
        this.Container = Container;
        this.Setting = {
            shading: true,
            shadingColor: "rgba(0,0,0,0.4)",
            visible: false,
            showIndicator: true,
            showPane: true,
            message: "",
            position: { of: Setting?.position?.of ?? window }
        };
        this.Appearance = Appearance;

        this.Instance = null;
    }

    init() {
        const self = this;
        this.Instance = $(self.Container).dxLoadPanel({
            ...this.Setting
        }).dxLoadPanel("instance");
    }

    show(message = "Đang tải dữ liệu...") {
        this.Instance.option("message", message);
        this.Instance.show();
    }
    hide() {
        this.Instance.hide();
    }
    dispose() {
        this.Instance?.dispose();
        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseDevextremeLoading", BaseDevextremeLoading);

class ProcessBootstrapLoading {
    constructor(Container, Setting, Appearance) {
        this.Container = Container;
        this.Setting = {
            message: Setting?.message ?? "Đang xử lý...",
            autoHide: Setting?.autoHide ?? true,
            shading: Setting?.shading ?? true,
            shadingColor: Setting?.shadingColor ?? "rgba(0,0,0,0.4)"
        };
        this.Appearance = Appearance || {};

        this.Instance = null;
        this.ProgressBar = null;
        this.MessageElement = null;
        this.Value = 0;
        this.Target = null;
        this.Host = null;
        this._oldPosition = "";
    }

    init() {
        this.Target = this.Container ? $(this.Container) : $("body");

        if (!this.Target.length) {
            this.Target = $("body");
        }

        if (
            this.Target.is("body") ||
            !this.Target.parent().length
        ) {
            this.Host = $("body");
        }
        else {
            this.Host = this.Target.parent();
        }

        if (!this.Host.is("body")) {
            this._oldPosition = this.Host.css("position");

            if (
                this._oldPosition === "static" ||
                !this._oldPosition
            ) {
                this.Host.css("position", "relative");
            }
        }

        const html = `
            <div class="process-loading-overlay d-none">
                <div class="card shadow border-0">
                    <div class="card-body">
                        <div class="mb-2 process-message">
                            ${this.Setting.message}
                        </div>
                        <div class="progress" style="height:20px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width:0%">
                                0%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.Host.append(html);

        this.Instance = this.Host.children(".process-loading-overlay:last");
        this.ProgressBar = this.Instance.find(".progress-bar");
        this.MessageElement = this.Instance.find(".process-message");

        this.Instance.css({
            position: this.Host.is("body") ? "fixed" : "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: this.Setting.shading ? this.Setting.shadingColor : "transparent",
            zIndex: 99999
        });

        this.Instance.find(".card").css({
            minWidth: "360px",
            maxWidth: "500px"
        });
    }

    setMessage(message) {
        this.MessageElement.text(message);
    }

    setProgress(value) {
        value = Math.max(0, Math.min(100, value));
        this.Value = value;
        this.ProgressBar.css("width", `${value}%`);
        this.ProgressBar.text(`${value}%`);
        this.ProgressBar.attr("aria-valuenow", value);

        if (
            value >= 100 &&
            this.Setting.autoHide
        ) {
            setTimeout(() => {
                this.hide();
            }, 500);
        }
    }

    async step(message, value, timeout, event) {
        this.setMessage(message);
        this.setProgress(value);
        const beginprocess = Date.now();
        await event?.();
        const endprocess = Date.now() - beginprocess;
        if (endprocess < timeout) {
            await new Promise(resolve => setTimeout(resolve, timeout - endprocess));
        }
    }

    show(message = null) {
        if (message) {
            this.MessageElement.text(message);
        }

        this.Instance.removeClass("d-none");
    }

    hide(message) {
        this.Instance.addClass("d-none");
        this.setMessage(message);
        this.setProgress(0);
    }

    dispose() {
        this.Instance?.remove();

        if (
            !this.Host?.is("body") &&
            this._oldPosition === "static"
        ) {
            this.Host.css("position", "");
        }

        this.Instance = null;
        this.ProgressBar = null;
        this.MessageElement = null;
        this.Target = null;
        this.Host = null;
    }
}

BaseFoundation.registerClass("ProcessBootstrapLoading", ProcessBootstrapLoading);