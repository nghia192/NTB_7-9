

class BaseContent {
    constructor(Container, HTML, Events) {
        this.Container = Container;
        this.HTML = HTML;
        this.Events = Events || {};

        this.Instance = null;
    }

    render() {
        this.Instance = $(this.Container).html(this.HTML);
    }

    html(html) {
        this.HTML = html;

        this.Instance?.html(html);
    }

    append(html) {
        this.Instance?.append(html);
    }

    clear() {
        this.Instance?.empty();
    }

    dispose() {
        this.Instance?.empty();

        this.Instance = null;
    }
}
BaseFoundation.registerClass("BaseContent", BaseContent);