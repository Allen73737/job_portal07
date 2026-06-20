const https = require('https');
const fs = require('fs');

const url = 'https://assets.vercel.com/video/upload/v1661502425/random/globe.mp4';
const dest = './public/cinematic_office.mp4';

console.log('Downloading cinematic video from Vercel CDN...');

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Download successfully completed!');
        });
    } else {
        console.error(`Failed to download. Status Code: ${response.statusCode}`);
    }
}).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Download error:', err.message);
});
