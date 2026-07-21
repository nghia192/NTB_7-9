

class GenerateHelper {
    constructor() {
        
    }
    generatedTimeKey(header) {
        const now = new Date();
        const pad = (num, size) => num.toString().padStart(size, '0');
        const formatted =
            now.getFullYear().toString() +
            pad(now.getMonth() + 1, 2) +
            pad(now.getDate(), 2) +
            pad(now.getHours(), 2) +
            pad(now.getMinutes(), 2) +
            pad(now.getSeconds(), 2) +
            pad(now.getMilliseconds(), 3);

        const random = Math.floor(100000 + Math.random() * 900000);
        return `${header}__${formatted}${random}`;
    }
    generatedIntKey() {
        return Math.floor(Date.now() / 1000);
    }
}
BaseFoundation.registerClass("GenerateHelper", GenerateHelper);