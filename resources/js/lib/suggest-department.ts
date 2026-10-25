// Sugere o departamento a partir do título + descrição da reclamação, usando as palavras-chave
// de cada departamento (separadas por vírgula; "*" no fim pega variações: "alag*" → alagamento).
// Sem acento e sem maiúsculas dos dois lados, então "Iluminação" casa com "iluminacao".

export type DepartmentOption = { id: number; name: string; description?: string | null; keywords?: string | null };

const normalize = (text: string) =>
    text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function keywordRegex(keyword: string): RegExp | null {
    const word = normalize(keyword.trim());
    if (!word) return null;

    const isPrefix = word.endsWith('*');
    const base = escapeRegex(isPrefix ? word.slice(0, -1).trim() : word).replace(/[\s-]+/g, '[\\s-]+');
    if (!base) return null;

    // Palavra inteira (aceita plural) ou, com "*", qualquer continuação da palavra.
    const ending = isPrefix ? '[a-z0-9]*' : '(?:s|es)?';
    return new RegExp(`(^|[^a-z0-9])${base}${ending}(?![a-z0-9])`);
}

/** Departamento com mais palavras-chave encontradas no texto, ou null se nenhuma bater. */
export function suggestDepartment(text: string, departments: DepartmentOption[]): DepartmentOption | null {
    const haystack = normalize(text);
    if (!haystack.trim()) return null;

    let best: DepartmentOption | null = null;
    let bestScore = 0;

    for (const department of departments) {
        let score = 0;
        for (const keyword of (department.keywords ?? '').split(',')) {
            const regex = keywordRegex(keyword);
            // Expressão com mais de uma palavra ("água parada") é mais específica e vale mais.
            if (regex?.test(haystack)) score += keyword.trim().split(/\s+/).length;
        }
        if (score > bestScore) {
            best = department;
            bestScore = score;
        }
    }

    return best;
}
