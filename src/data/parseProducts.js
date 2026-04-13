// Parses the readme.md table format into structured product data
export function parseReadme(raw) {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const sections = [];
    let currentSection = null;
    let currentSub = null;
    let serialNo = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip table headers and separator lines
        if (line.startsWith('| Product Name') || line.startsWith('| ---') || line.startsWith('| --')) continue;

        // Main section
        if (line.startsWith('Section:')) {
            const name = line.replace('Section:', '').trim();
            currentSection = { name, subsections: [], items: [] };
            currentSub = null;
            sections.push(currentSection);
            continue;
        }

        // Sub-section
        if (line.startsWith('Sub-Section') || line.startsWith('Sub- Section')) {
            const name = line.replace(/Sub-?\s*Section\s*[A-Z]:\s*/i, '').trim();
            currentSub = { name, items: [] };
            if (currentSection) currentSection.subsections.push(currentSub);
            continue;
        }

        // Table row
        if (line.startsWith('|') && currentSection) {
            const cols = line.split('|').map(c => c.trim()).filter(Boolean);
            if (cols.length >= 4) {
                serialNo++;
                const item = {
                    id: serialNo,
                    name: cols[0],
                    code: cols[1],
                    mrp: parseInt(cols[2]) || 0,
                    casePack: parseInt(cols[3]) || 0,
                };
                if (currentSub) {
                    currentSub.items.push(item);
                } else {
                    currentSection.items.push(item);
                }
            }
        }
    }
    return sections;
}
