

class ParseHelper {
    constructor() {

    }
    cleanText(text) {
        if (text === undefined || text === null) return "";

        return String(text)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '');
    }
    parseCaptionToField(caption) {
        if (!caption) return "";

        // 1. Chuẩn hóa: bỏ dấu tiếng Việt
        const removeVietnameseTones = (str) => {
            return str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D");
        };

        let normalized = removeVietnameseTones(caption);

        // 2. Tách từ theo khoảng trắng hoặc ký tự đặc biệt
        let words = normalized.split(/[^a-zA-Z0-9]+/).filter(Boolean);

        // 3. Viết hoa chữ cái đầu mỗi từ
        let result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");

        return result;
    }

    extractText(text, condition) {
        if (!text || typeof text !== 'string') return "";

        const { type, start, end } = condition;

        switch (type) {
            case "from-start-to": {
                // Lấy từ đầu chuỗi đến ký tự 'end'
                const endIndex = text.indexOf(end);
                if (endIndex === -1) return text.trim(); // Nếu không thấy ký tự chặn, trả về hết chuỗi
                return text.substring(0, endIndex).trim();
            }

            case "between": {
                // Lấy giữa ký tự 'start' và 'end'
                const startIndex = text.indexOf(start);
                if (startIndex === -1) return "";

                // Tìm ký tự 'end' bắt đầu từ sau vị trí 'start'
                const endIndex = text.indexOf(end, startIndex + start.length);
                if (endIndex === -1) return "";

                return text.substring(startIndex + start.length, endIndex).trim();
            }

            case "from-to-end": {
                // Lấy từ sau ký tự 'start' đến hết chuỗi
                const startIndex = text.indexOf(start);
                if (startIndex === -1) return "";
                return text.substring(startIndex + start.length).trim();
            }

            default:
                return "";
        }
    }
    executePipeline(text, steps = []) {
        if (!text || typeof text !== 'string') return {};

        // Khởi tạo ngữ cảnh (context) truyền xuyên suốt qua các bước
        let context = {
            currentText: text.trim(),
            result: {}
        };

        steps.forEach(step => {
            if (typeof step === 'function') {
                context = step(context, this);
            }
        });

        return context.result;
    }
    stepSanitize() {
        return (context) => {
            context.currentText = context.currentText
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/\r\n/g, '\n')
                .replace(/\n+/g, '\n')
                .trim();
            return context;
        };
    }
    stepExtractAndConsume(saveToKey, condition) {
        return (context, self) => {
            const extracted = self.extractText(context.currentText, condition);

            if (extracted) {
                context.result[saveToKey] = extracted;

                if (condition.type === "between") {
                    // Thay vì cộng chuỗi cứng nhắc, ta dùng Regex động để quét sạch 
                    // cụm chữ nằm giữa 'start' và 'end' kèm theo bất kỳ khoảng trắng thừa nào (\s*)
                    const escapeReg = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    const startSep = escapeReg(condition.start);
                    // Nếu có dấu đóng ngoặc thì tìm dấu đóng ngoặc, nếu gõ thiếu thì kết thúc bằng cuối chuỗi hoặc xuống dòng
                    const endSep = context.currentText.includes(condition.end) ? escapeReg(condition.end) : '(?=\\n|$)';

                    // Regex nhận diện: Ký tự đầu + (khoảng trắng nếu có) + chữ đã trích xuất + (khoảng trắng nếu có) + ký tự cuối
                    const consumeRegex = new RegExp(`\\s*${startSep}\\s*${escapeReg(extracted)}\\s*${endSep}\\s*`, 'g');

                    context.currentText = context.currentText.replace(consumeRegex, '\n').trim();
                }
            } else {
                // XỬ LÝ CHO CA 1: Nếu không trích xuất được gì (ví dụ không có chữ nào nằm giữa hai ký tự chặn)
                // Ta vẫn cần dọn dẹp cặp ký tự chặn rỗng đó đi nếu chúng tồn tại dạng "()" để tránh làm nhiễu bước sau
                if (condition.type === "between") {
                    const escapeReg = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const emptyRegex = new RegExp(`\\s*${escapeReg(condition.start)}\\s*${escapeReg(condition.end)}\\s*`, 'g');
                    context.currentText = context.currentText.replace(emptyRegex, '').trim();
                }
            }
            return context;
        };
    }
    stepSplitByNewLine(keyLine1, keyLine2) {
        return (context) => {
            const lines = context.currentText.split('\n').map(l => l.trim()).filter(Boolean);

            if (lines.length >= 2) {
                context.result[keyLine1] = lines[0];
                context.result[keyLine2] = lines.slice(1).join(" ");
            } else if (lines.length === 1) {
                // Giải quyết triệt để Ca 1: Nếu sau khi nuốt mã lỗi, chuỗi chỉ còn 1 dòng,
                // ta ưu tiên đẩy vào keyLine1 (Bộ phận), dòng còn lại để trống
                context.result[keyLine1] = lines[0];
                context.result[keyLine2] = "";
            }
            return context;
        };
    }
    stepCleanEdgeJunk(keys = []) {
        return (context) => {
            const junkRegex = /^[:\-,.+\s|]+|[:\-,.+\s|]+$/g; // Bổ sung thêm dấu phẩy, dấu cộng bị thừa ở rìa chữ
            keys.forEach(key => {
                if (context.result[key]) {
                    context.result[key] = context.result[key].replace(junkRegex, '').trim();
                }
            });
            return context;
        };
    }
}