type RegexTokenKind = "escape" | "charClass" | "quantifier" | "group" | "alternation" | "anchor" | "literal";

interface RegexToken {
    text: string;
    kind: RegexTokenKind;
}

function tokenizeRegex(pattern: string): RegexToken[] {
    const tokens: RegexToken[] = [];
    let i = 0;
    let inClass = false;
    while (i < pattern.length) {
        const c = pattern[i];
        if (c === "\\" && i + 1 < pattern.length) {
            tokens.push({ text: pattern.slice(i, i + 2), kind: "escape" });
            i += 2;
            continue;
        }
        if (inClass) {
            if (c === "]") {
                inClass = false;
            }
            tokens.push({ text: c, kind: "charClass" });
            i += 1;
            continue;
        }
        if (c === "[") {
            inClass = true;
            tokens.push({ text: c, kind: "charClass" });
            i += 1;
            continue;
        }
        if (c === "(") {
            if (pattern[i + 1] === "?") {
                let j = i + 2;
                while (j < pattern.length && ":=!<>".includes(pattern[j])) {
                    j += 1;
                }
                tokens.push({ text: pattern.slice(i, j), kind: "group" });
                i = j;
            } else {
                tokens.push({ text: c, kind: "group" });
                i += 1;
            }
            continue;
        }
        if (c === ")") {
            tokens.push({ text: c, kind: "group" });
            i += 1;
            continue;
        }
        if (c === "{") {
            const end = pattern.indexOf("}", i);
            if (end !== -1 && /^\{\d+(,\d*)?\}$/.test(pattern.slice(i, end + 1))) {
                tokens.push({ text: pattern.slice(i, end + 1), kind: "quantifier" });
                i = end + 1;
                continue;
            }
            tokens.push({ text: c, kind: "literal" });
            i += 1;
            continue;
        }
        if (c === "*" || c === "+" || c === "?") {
            tokens.push({ text: c, kind: "quantifier" });
            i += 1;
            continue;
        }
        if (c === "|") {
            tokens.push({ text: c, kind: "alternation" });
            i += 1;
            continue;
        }
        if (c === "^" || c === "$" || c === ".") {
            tokens.push({ text: c, kind: "anchor" });
            i += 1;
            continue;
        }
        tokens.push({ text: c, kind: "literal" });
        i += 1;
    }
    return tokens;
}

export function renderRegexTokens(container: HTMLElement, pattern: string): void {
    container.replaceChildren();
    let current: HTMLSpanElement | null = null;
    let currentKind: RegexTokenKind | null = null;
    for (const token of tokenizeRegex(pattern)) {
        if (current !== null && token.kind === currentKind) {
            current.innerText += token.text;
            continue;
        }
        current = document.createElement("span");
        currentKind = token.kind;
        current.className = "re-" + token.kind;
        current.innerText = token.text;
        container.append(current);
    }
}
