const API_URL = 'https://ais-dev-tytpmka3k5pnccgi7ocix2-766376228082.asia-east1.run.app/api/ocr';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const selectBtn = document.getElementById('selectBtn');
    const extractBtn = document.getElementById('extractBtn');
    const openBtn = document.getElementById('openBtn');
    const extractBox = document.getElementById('uploadArea');
    const loading = document.getElementById('loading');
    const resultArea = document.getElementById('resultArea');
    const resultText = document.getElementById('resultText');
    const copyBtn = document.getElementById('copyBtn');

    let selectedFile = null;

    selectBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            selectBtn.innerText = `Selected: ${selectedFile.name.substring(0, 20)}...`;
            extractBtn.style.display = 'block';
        }
    });

    extractBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        extractBox.style.display = 'none';
        loading.style.display = 'block';
        resultArea.style.display = 'none';

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('OCR Failed');

            const data = await response.json();
            resultText.value = data.text;
            loading.style.display = 'none';
            resultArea.style.display = 'block';
        } catch (error) {
            loading.style.display = 'none';
            extractBox.style.display = 'block';
            alert('Error: ' + error.message);
        }
    });

    copyBtn.addEventListener('click', () => {
        resultText.select();
        document.execCommand('copy');
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = 'Copy Text'; }, 2000);
    });

    openBtn.addEventListener('click', () => {
        window.open('https://ais-dev-tytpmka3k5pnccgi7ocix2-766376228082.asia-east1.run.app', '_blank');
    });
});
