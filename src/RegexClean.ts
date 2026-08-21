import browser from "./we";

export const REGEX_SEARCH_CAP = 100000;

export interface RegexMatch {
    url: string;
    title: string;
    lastVisitTime: number;
    visitCount: number;
}

export interface RegexPreview {
    items: RegexMatch[];
    truncated: boolean;
}

export async function previewRegexClean(pattern: string, flags: string): Promise<RegexPreview> {
    const re = new RegExp(pattern, flags);
    const results = await browser.history.search({ text: "", startTime: 0, maxResults: REGEX_SEARCH_CAP });
    const seen = new Set<string>();
    const items: RegexMatch[] = [];
    for (const item of results) {
        if (typeof item.url === "string" && !seen.has(item.url) && re.test(item.url)) {
            seen.add(item.url);
            items.push({
                url: item.url,
                title: item.title ?? "",
                lastVisitTime: item.lastVisitTime ?? 0,
                visitCount: item.visitCount ?? 0
            });
        }
    }
    return { items, truncated: results.length >= REGEX_SEARCH_CAP };
}

export async function deleteUrls(urls: string[]): Promise<void> {
    const chunkSize = 50;
    for (let i = 0; i < urls.length; i += chunkSize) {
        await Promise.all(urls.slice(i, i + chunkSize).map(url => browser.history.deleteUrl({ url })));
    }
}
