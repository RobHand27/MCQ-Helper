// Import config
import config from './config.js';

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'getMCQAnswer',
        title: 'Get Answer from Selected Text',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'getMCQAnswerFromScreenshot',
        title: 'Get Answer from Screenshot',
        contexts: ['page']
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'getMCQAnswer') {
        const selectedText = info.selectionText;
        try {
            const answer = await getAnswerFromLLM(selectedText);
            chrome.tabs.sendMessage(tab.id, {
                type: 'showAnswer',
                answer: answer
            });
        } catch (error) {
            console.error('Error getting answer:', error);
            chrome.tabs.sendMessage(tab.id, {
                type: 'showAnswer',
                answer: `Error: ${error.message}`
            });
        }
    } else if (info.menuItemId === 'getMCQAnswerFromScreenshot') {
        try {
            // Capture visible tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const screenshot = await chrome.tabs.captureVisibleTab();
            const answer = await getAnswerFromScreenshot(screenshot);
            chrome.tabs.sendMessage(tab.id, {
                type: 'showAnswer',
                answer: answer
            });
        } catch (error) {
            console.error('Error processing screenshot:', error);
            chrome.tabs.sendMessage(tab.id, {
                type: 'showAnswer',
                answer: `Error: ${error.message}`
            });
        }
    }
});

async function getAnswerFromLLM(question) {
    try {
        const prompt = `You are an expert at answering multiple choice questions. Analyze this question and provide the correct answer with a brief explanation. Be concise and direct. Never guess the answer, use your knowledge and resources to come up with a logical answer. The response should always begin with the letter and numerical answer to the problem. This should always precede any explanation given.

Question: ${question}

Please format your response as:
Answer: [letter/number of correct option]
Explanation: [brief explanation]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: config.MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert at answering multiple choice questions. Always start your response with the letter/number answer followed by a brief explanation."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.error?.message ||
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

async function getAnswerFromScreenshot(screenshotDataUrl) {
    try {
        // Convert base64 to blob
        const base64Data = screenshotDataUrl.split(',')[1];
        const binaryData = atob(base64Data);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'image/png' });

        // Create form data
        const formData = new FormData();
        formData.append('image', blob, 'screenshot.png');
        formData.append('model', 'gpt-4-vision-preview');
        formData.append('messages', JSON.stringify([
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'This is a screenshot of a multiple choice question. Please analyze it and provide the correct answer with a brief explanation. Format your response as "Answer: [letter/number] followed by Explanation: [brief explanation]"'
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: screenshotDataUrl
                        }
                    }
                ]
            }
        ]));

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.OPENAI_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.error?.message ||
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error processing screenshot:', error);
        throw error;
    }
}
