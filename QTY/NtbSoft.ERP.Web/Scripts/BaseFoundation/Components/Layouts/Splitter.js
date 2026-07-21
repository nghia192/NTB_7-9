

class BaseSplitter {
    constructor(Container, Setting, Appearance, Events) {

        this.Reference = Container.replace("#", "");
        this.Container = Container;

        this.Setting = {
            direction: Setting?.direction ?? "vertical",

            width: Setting?.width ?? "100%",
            height: Setting?.height ?? "100%",

            first: {
                size: Setting?.first?.size ?? "50%",
                min: Setting?.first?.min ?? 120
            },

            second: {
                min: Setting?.second?.min ?? 120
            },

            splitter: {
                size: Setting?.splitter?.size ?? 8
            }
        };

        this.Appearance = Appearance || {};
        this.Events = Events || {};

        this.Panel = {
            first: "",
            second: ""
        };

        this.Instance = null;
    }

    setPanel(panel) {
        this.Panel = {
            ...this.Panel,
            ...panel
        };
    }

    render() {

        const html = `
<div id="${this.Reference}_Layout"
    style="
        width:${this.Setting.width};
        height:${this.Setting.height};
        display:flex;
        flex-direction:${this.Setting.direction == "vertical" ? "column" : "row"};
        overflow:hidden;
    ">

    <div
        id="${this.Reference}_First"
        style="
            flex:0 0 ${this.Setting.first.size};
            min-${this.Setting.direction == "vertical" ? "height" : "width"}:${this.Setting.first.min}px;
            overflow:hidden;
        ">
        ${this.Panel.first}
    </div>

    <div
        id="${this.Reference}_Bar"
        style="
            flex:0 0 ${this.Setting.splitter.size}px;
            background:#dee2e6;
            cursor:${this.Setting.direction == "vertical" ? "row-resize" : "col-resize"};
            user-select:none;
        ">
    </div>

    <div
        id="${this.Reference}_Second"
        style="
            flex:1;
            min-${this.Setting.direction == "vertical" ? "height" : "width"}:${this.Setting.second.min}px;
            overflow:hidden;
        ">
        ${this.Panel.second}
    </div>

</div>
`;

        $(this.Container).html(html);

        this.Instance = {
            layout: $(`#${this.Reference}_Layout`),
            first: $(`#${this.Reference}_First`),
            second: $(`#${this.Reference}_Second`),
            bar: $(`#${this.Reference}_Bar`)
        };

        this.bindResize();
    }

    bindResize() {

        let dragging = false;

        this.Instance.bar.on("mousedown", () => {
            dragging = true;
            $("body").css("user-select", "none");
        });

        $(document).on("mousemove." + this.Reference, e => {

            if (!dragging)
                return;

            const layout = this.Instance.layout[0];

            if (this.Setting.direction == "vertical") {

                const rect = layout.getBoundingClientRect();

                let h = e.clientY - rect.top;

                h = Math.max(h, this.Setting.first.min);

                h = Math.min(
                    h,
                    rect.height - this.Setting.second.min
                );

                this.Instance.first.css("flex", `0 0 ${h}px`);

            }
            else {

                const rect = layout.getBoundingClientRect();

                let w = e.clientX - rect.left;

                w = Math.max(w, this.Setting.first.min);

                w = Math.min(
                    w,
                    rect.width - this.Setting.second.min
                );

                this.Instance.first.css("flex", `0 0 ${w}px`);
            }

            this.Events.onResize?.();
        });

        $(document).on("mouseup." + this.Reference, () => {

            if (!dragging)
                return;

            dragging = false;

            $("body").css("user-select", "");

            this.Events.onResizeEnd?.();
        });
    }

    collapseFirst() {

        this.Instance.first.css("flex", "0 0 0");
    }

    expandFirst() {

        this.Instance.first.css(
            "flex",
            `0 0 ${this.Setting.first.size}`
        );
    }

    setFirstSize(size) {

        this.Instance.first.css(
            "flex",
            `0 0 ${size}`
        );
    }

    dispose() {

        $(document).off("." + this.Reference);

        $(this.Container).empty();

        this.Instance = null;
    }

}
BaseFoundation.registerClass("BaseSplitter", BaseSplitter);