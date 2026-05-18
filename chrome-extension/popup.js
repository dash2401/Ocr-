let API_URL = localStorage.getItem('ocr_api_url') || 'https://ais-dev-tytpmka3k5pnccgi7ocix2-766376228082.asia-east1.run.app/api/ocr';

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
    
    // Settings elements
    const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
    const settingsArea = document.getElementById('settingsArea');
    const apiUrlInput = document.getElementById('apiUrlInput');
    const saveUrlBtn = document.getElementById('saveUrlBtn');

    apiUrlInput.value = API_URL.replace('/api/ocr', '');

    let selectedFile = null;

    toggleSettingsBtn.addEventListener('click', () => {
        settingsArea.style.display = settingsArea.style.display === 'none' ? 'block' : 'none';
    });

    saveUrlBtn.addEventListener('click', () => {
        let newBaseUrl = apiUrlInput.value.trim();
        if (newBaseUrl.endsWith('/')) newBaseUrl = newBaseUrl.slice(0, -1);
        if (!newBaseUrl.startsWith('http')) {
            alert('Please enter a valid URL (starting with http/https)');
            return;
        }
        API_URL = newBaseUrl + '/api/ocr';
        localStorage.setItem('ocr_api_url', API_URL);
        alert('API URL updated!');
        settingsArea.style.display = 'none';
    });

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
                mode: 'cors',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            resultText.value = data.text;
            loading.style.display = 'none';
            resultArea.style.display = 'block';
        } catch (error) {
            console.error('Fetch error:', error);
            loading.style.display = 'none';
            extractBox.style.display = 'block';
            alert('Error: ' + error.message + '\n\nDashboard URL: ' + API_URL);
        }
    });

    copyBtn.addEventListener('click', () => {
        resultText.select();
        document.execCommand('copy');
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = 'Copy Text'; }, 2000);
    });

    openBtn.addEventListener('click', () => {
        const baseUrl = API_URL.replace('/api/ocr', '');
        window.open(baseUrl, '_blank');
    });
});
