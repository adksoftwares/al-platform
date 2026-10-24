const fs = require('fs');

async function checkFolder(subject, folder) {
    const url = `https://api.github.com/repos/adksoftwares/subjects-materials/contents/subjects/${encodeURIComponent(subject)}/${encodeURIComponent(folder)}`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'AlApp/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (response.ok) {
            const files = await response.json();
            console.log(`\nFound ${files.length} files in ${subject}/${folder}:`);
            const misplaced = files.filter(f => {
                const n = f.name.toLowerCase();
                if (subject === 'biology') return n.includes('physics') || n.includes('chemistry') || n.includes('maths');
                if (subject === 'physics') return n.includes('biology') || n.includes('chemistry') || n.includes('maths') || n.includes(' bio ');
                if (subject === 'chemistry') return n.includes('biology') || n.includes('physics') || n.includes('maths') || n.includes(' bio ');
                if (subject === 'combined maths') return n.includes('biology') || n.includes('physics') || n.includes('chemistry') || n.includes(' bio ');
                return false;
            });
            if (misplaced.length > 0) {
                console.log(`WARNING: Misplaced files in ${subject}:`);
                misplaced.forEach(f => console.log('- ' + f.name));
            } else {
                console.log(`All good in ${subject}/${folder}.`);
            }
        } else {
            console.log(`Could not fetch ${subject}/${folder}: ${response.status}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    const subjects = ['biology', 'chemistry', 'physics', 'combined maths'];
    const folders = ['elaborations', 'past papers', 'model papers'];
    for (const s of subjects) {
        for (const f of folders) {
            await checkFolder(s, f);
        }
    }
}

run();
