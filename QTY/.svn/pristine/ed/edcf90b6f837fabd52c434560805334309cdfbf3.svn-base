

class BaseDevextremeTextEdit {
    constructor(Container, Placeholder, Setting, Appearance, Events) {
        this.Container = Container;
        this.Placeholder = Placeholder;

        this.Events = Events;

        this.Instance = null;
        this.DisplayValue = null;
        this.BaseData = null;
    }

    render() {
        const self = this;
        this.Instance = $(this.Container).dxTextBox({
            placeholder: this.Placeholder || "",

            value: self.DisplayValue,

            onValueChanged: function (e) {
                self.DisplayValue = e.value;

                if (typeof self.Events.onValueChanged === "function") {
                    self.Events.onValueChanged(e);
                }
            },

            onFocusIn: function (e) {
                if (typeof self.Events.onFocusIn === "function") {
                    self.Events.onFocusIn(e);
                }
            },

            onFocusOut: function (e) {
                if (typeof self.Events.onFocusOut === "function") {
                    self.Events.onFocusOut(e);
                }
            }
        }).dxTextBox("instance");
    }
}