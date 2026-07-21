window.BaseFoundation = window.BaseFoundation || {};

BaseFoundation.Classes = {};

BaseFoundation.registerClass = function (name, classRef) {
    if (!name) {
        throw new Error(
            "[BaseFoundation] Class name is required."
        );
    }
    if (!classRef) {
        throw new Error(
            `[BaseFoundation] Invalid class reference: ${name}`
        );
    }
    if (this.Classes[name]) {
        throw new Error(
            `[BaseFoundation] Class already registered: ${name}`
        );
    }
    this.Classes[name] = classRef;
};

BaseFoundation.requireClass = function (name) {
    const cls = this.Classes[name];
    if (!cls) {
        throw new Error(
            `[BaseFoundation] Missing dependency: ${name}`
        );
    }
    return cls;
};

BaseFoundation.create = async function (className, container, ...args) {

        const ClassRef =
            this.requireClass(
                className
            );

        const instance =
            new ClassRef(
                container,
                ...args
            );

        await instance.render();

        return instance;
    };