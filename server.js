const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/translate', async (req, res) => {
    try {
        const { text, sourceLang, targetLang } = req.body;
        
        console.log('Translating:', text);
        console.log('From:', sourceLang, 'To:', targetLang);
        
        // Handle auto-detection
        const source = sourceLang === 'auto' ? 'en' : sourceLang;
        
        // MyMemory Translation API (very reliable and free)
        const response = await axios.get('https://api.mymemory.translated.net/get', {
            params: {
                q: text,
                langpair: `${source}|${targetLang}`,
                mt: 1, // Use machine translation
                ie: 'UTF-8',
                oe: 'UTF-8'
            },
            timeout: 10000
        });

        console.log('MyMemory response:', response.data);
        
        // Check if translation was successful
        if (response.data && response.data.responseData) {
            const translatedText = response.data.responseData.translatedText;
            
            // Check if it's a valid translation (not an error message)
            if (translatedText && !translatedText.includes('MYMEMORY ERROR')) {
                res.json({ translatedText: translatedText });
            } else {
                // If MyMemory fails, try a simple fallback
                const fallbackResponse = await axios.get(`https://api.mymemory.translated.net/get`, {
                    params: {
                        q: text,
                        langpair: `${source}|${targetLang}`,
                        mt: 0 // Use translation memory only
                    }
                });
                
                if (fallbackResponse.data && fallbackResponse.data.responseData) {
                    res.json({ translatedText: fallbackResponse.data.responseData.translatedText });
                } else {
                    throw new Error('Translation failed');
                }
            }
        } else {
            throw new Error('Invalid response from translation service');
        }
        
    } catch (error) {
        console.error('Translation error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        
        // Send a user-friendly error message
        res.status(500).json({ 
            error: 'Translation service temporarily unavailable. Please try again.' 
        });
    }
});

// Add a test endpoint
app.get('/test', async (req, res) => {
    try {
        const response = await axios.get('https://api.mymemory.translated.net/get', {
            params: {
                q: 'hello',
                langpair: 'en|es',
                mt: 1
            }
        });
        res.json({ 
            status: 'MyMemory API is working',
            test: response.data 
        });
    } catch (error) {
        res.json({ 
            status: 'Error connecting to MyMemory',
            error: error.message 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/test`);
});