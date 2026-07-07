"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidIban = isValidIban;
function isValidIban(iban) {
    const normalized = iban.replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(normalized)) {
        return false;
    }
    const rearranged = normalized.slice(4) + normalized.slice(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55));
    let remainder = 0;
    for (let i = 0; i < numeric.length; i += 7) {
        remainder = Number(`${remainder}${numeric.substring(i, i + 7)}`) % 97;
    }
    return remainder === 1;
}
//# sourceMappingURL=validate-iban.js.map