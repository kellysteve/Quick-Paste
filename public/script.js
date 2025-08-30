document.addEventListener('DOMContentLoaded', function() {
    const pasteForm = document.getElementById('paste-form');
    const pasteContent = document.getElementById('paste-content');
    const syntaxSelect = document.getElementById('syntax');
    const createPasteSection = document.getElementById('create-paste');
    const pasteCreatedSection = document.getElementById('paste-created');
    const viewPasteSection = document.getElementById('view-paste');
    const pasteUrl = document.getElementById('paste-url');
    const copyBtn = document.getElementById('copy-btn');
    const newPasteBtn = document.getElementById('new-paste-btn');
    const homeBtn = document.getElementById('home-btn');
    const pasteContentDisplay = document.getElementById('paste-content-display');
    const pasteDate = document.getElementById('paste-date');
    const pasteViews = document.getElementById('paste-views');

    // Check if we're viewing a paste
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'paste' && pathParts[2]) {
        loadPaste(pathParts[2]);
    }

    // Handle form submission
    pasteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const createBtn = document.getElementById('create-btn');
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
        
        try {
            const response = await fetch('/api/paste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: pasteContent.value,
                    syntax: syntaxSelect.value
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success section
                pasteUrl.value = window.location.origin + data.url;
                createPasteSection.classList.add('hidden');
                pasteCreatedSection.classList.remove('hidden');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error creating paste. Please try again.');
        } finally {
            createBtn.disabled = false;
            createBtn.textContent = 'Create Paste';
        }
    });

    // Copy URL to clipboard
    copyBtn.addEventListener('click', function() {
        pasteUrl.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });

    // Create new paste
    newPasteBtn.addEventListener('click', function() {
        pasteCreatedSection.classList.add('hidden');
        createPasteSection.classList.remove('hidden');
        pasteContent.value = '';
        syntaxSelect.value = 'plaintext';
        window.history.replaceState({}, document.title, '/');
    });

    // Go home
    homeBtn.addEventListener('click', function() {
        viewPasteSection.classList.add('hidden');
        createPasteSection.classList.remove('hidden');
        window.history.replaceState({}, document.title, '/');
    });

    // Load a paste
    async function loadPaste(id) {
        try {
            const response = await fetch(`/api/paste/${id}`);
            const data = await response.json();
            
            if (response.ok) {
                // Show the paste
                createPasteSection.classList.add('hidden');
                viewPasteSection.classList.remove('hidden');
                
                // Set content and metadata
                pasteContentDisplay.textContent = data.content;
                pasteDate.textContent = `Created: ${new Date(data.createdAt).toLocaleString()}`;
                pasteViews.textContent = `Views: ${data.views}`;
                
                // Apply syntax highlighting if needed
                if (data.syntax !== 'plaintext') {
                    pasteContentDisplay.className = data.syntax;
                    hljs.highlightElement(pasteContentDisplay);
                }
            } else {
                alert('Paste not found');
                window.location.href = '/';
            }
        } catch (error) {
            alert('Error loading paste');
            window.location.href = '/';
        }
    }
});