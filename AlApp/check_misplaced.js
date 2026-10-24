const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\Arikarran\\.gemini\\antigravity\\brain\\25453854-7576-4de6-b894-48b188ec1847\\.system_generated\\steps\\2655\\content.md', 'utf8');

// The file has a header and then JSON:
// Source: ...
// ---
// [{"name":...}]

const jsonStr = data.split('\n---\n\n')[1];

if (jsonStr) {
    try {
        const files = JSON.parse(jsonStr);
        console.log(`Found ${files.length} files in biology/past papers.`);
        const misplaced = files.filter(f => f.name.toLowerCase().includes('physics') || f.name.toLowerCase().includes('chem') || f.name.toLowerCase().includes('math'));
        if (misplaced.length > 0) {
            console.log('Misplaced files found:');
            misplaced.forEach(f => console.log('- ' + f.name));
        } else {
            console.log('No obviously misplaced files found based on filename.');
        }
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }
} else {
    console.log('Could not find JSON in content.md');
}
