document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const translateBtn = document.getElementById('translateBtn');
    const swapBtn = document.getElementById('swapLanguages');
    const clearSource = document.getElementById('clearSource');
    const copyTranslation = document.getElementById('copyTranslation');
    const speakTranslation = document.getElementById('speakTranslation');
    const sourceCharCount = document.getElementById('sourceCharCount');
    const targetCharCount = document.getElementById('targetCharCount');
    const loading = document.getElementById('loading');

    // Character count
    sourceText.addEventListener('input', function() {
        const count = this.value.length;
        sourceCharCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    });

    // Clear source text
    clearSource.addEventListener('click', function() {
        sourceText.value = '';
        sourceCharCount.textContent = '0 characters';
        sourceText.focus();
    });

    // Swap languages
    swapBtn.addEventListener('click', function() {
        // Swap language selections
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;

        // Swap text if both have content
        if (sourceText.value && targetText.value) {
            const tempText = sourceText.value;
            sourceText.value = targetText.value;
            targetText.value = tempText;
            
            // Update character counts
            sourceCharCount.textContent = `${sourceText.value.length} characters`;
            targetCharCount.textContent = `${targetText.value.length} characters`;
        }
    });

    // Translate function
    async function translateText() {
        const text = sourceText.value.trim();
        
        if (!text) {
            alert('Please enter text to translate');
            return;
        }

        // Show loading
        loading.classList.remove('hidden');
        translateBtn.disabled = true;

        try {
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    sourceLang: sourceLang.value,
                    targetLang: targetLang.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                targetText.value = data.translatedText;
                targetCharCount.textContent = `${data.translatedText.length} characters`;
            } else {
                throw new Error(data.error || 'Translation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Translation failed. Please try again.');
        } finally {
            // Hide loading
            loading.classList.add('hidden');
            translateBtn.disabled = false;
        }
    }

    // Translate button click
    translateBtn.addEventListener('click', translateText);

    // Enter key shortcut (Ctrl+Enter)
    sourceText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateText();
        }
    });

    // Copy translation to clipboard
    copyTranslation.addEventListener('click', function() {
        if (targetText.value) {
            navigator.clipboard.writeText(targetText.value).then(() => {
                // Visual feedback
                const icon = this.querySelector('i');
                icon.classList.remove('far', 'fa-copy');
                icon.classList.add('fas', 'fa-check');
                this.classList.add('copy-success');
                
                setTimeout(() => {
                    icon.classList.remove('fas', 'fa-check');
                    icon.classList.add('far', 'fa-copy');
                    this.classList.remove('copy-success');
                }, 2000);
            }).catch(() => {
                alert('Failed to copy text');
            });
        }
    });

    // Text-to-speech for translation
    speakTranslation.addEventListener('click', function() {
        if (targetText.value) {
            // Stop any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(targetText.value);
            
            // Set language for speech
            const langMap = {
                'en': 'en-US',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'it': 'it-IT',
                'pt': 'pt-PT',
                'ru': 'ru-RU',
                'ja': 'ja-JP',
                'ko': 'ko-KR',
                'zh': 'zh-CN',
                'ar': 'ar-SA',
                'hi': 'hi-IN'
            };
            
            utterance.lang = langMap[targetLang.value] || 'en-US';
            
            // Visual feedback
            const icon = this.querySelector('i');
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-off');
            
            utterance.onend = function() {
                icon.classList.remove('fa-volume-off');
                icon.classList.add('fa-volume-up');
            };
            
            utterance.onerror = function() {
                icon.classList.remove('fa-volume-off');
                icon.classList.add('fa-volume-up');
            };
            
            window.speechSynthesis.speak(utterance);
        }
    });

    // Auto-detect language feature
    sourceText.addEventListener('blur', function() {
        if (sourceLang.value === 'auto' && this.value.trim()) {
            // Optional: Add language detection if you want to show detected language
            // This would require an additional API call
        }
    });
});