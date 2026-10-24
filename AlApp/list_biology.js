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
            console.log(`\n--- ${subject}/${folder} ---`);
            files.forEach(f => console.log(f.name));
        } else {
            console.log(`Could not fetch ${subject}/${folder}: ${response.status}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await checkFolder('biology', 'elaborations');
    await checkFolder('biology', 'model papers');
}

run();
