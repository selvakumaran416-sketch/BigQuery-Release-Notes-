document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshSpinner = document.getElementById('refresh-spinner');
    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
    const btnText = refreshBtn.querySelector('.btn-text');
    const notesContainer = document.getElementById('notes-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorMessage = document.getElementById('error-message');

    // Initial fetch
    fetchNotes();

    // Refresh button event listener
    refreshBtn.addEventListener('click', () => {
        fetchNotes(true);
    });

    async function fetchNotes(isRefresh = false) {
        // UI updates for loading state
        if (isRefresh) {
            refreshSpinner.classList.remove('hidden');
            refreshIcon.classList.add('hidden');
            btnText.textContent = 'Refreshing...';
            refreshBtn.disabled = true;
        } else {
            loadingOverlay.classList.remove('hidden');
        }
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch('/api/notes');
            const data = await response.json();

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || 'Failed to fetch release notes');
            }

            renderNotes(data.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.classList.remove('hidden');
        } finally {
            // UI updates for end of loading
            if (isRefresh) {
                refreshSpinner.classList.add('hidden');
                refreshIcon.classList.remove('hidden');
                btnText.textContent = 'Refresh';
                refreshBtn.disabled = false;
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    }

    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="note-card" style="text-align: center;">
                    <p class="note-title">No release notes found.</p>
                </div>
            `;
            return;
        }

        notes.forEach(note => {
            const dateStr = note.updated ? new Date(note.updated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'Unknown Date';

            // Create tweet text (Limit length if necessary, but Twitter handles links well)
            let textToTweet = `Check out this BigQuery update: ${note.title}\n\nRead more: ${note.link}`;
            const encodedTweet = encodeURIComponent(textToTweet);
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

            const card = document.createElement('div');
            card.className = 'note-card';
            
            card.innerHTML = `
                <div class="note-header">
                    <h2 class="note-title">${escapeHTML(note.title)}</h2>
                    <span class="note-date">${dateStr}</span>
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
                <div class="note-footer">
                    ${note.link ? `<a href="${note.link}" target="_blank" rel="noopener noreferrer" class="read-more">
                        Read full details 
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>` : '<span></span>'}
                    <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="btn-tweet" aria-label="Tweet this update">
                        <svg viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Tweet
                    </a>
                </div>
            `;
            
            notesContainer.appendChild(card);
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Advanced Feature: Tweet selected text
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        let tooltip = document.getElementById('tweet-tooltip');
        
        if (selection.toString().trim() !== '' && !selection.isCollapsed) {
            // Make sure selection is inside notes container
            let isInsideNotes = false;
            let node = selection.anchorNode;
            while (node) {
                if (node.id === 'notes-container') {
                    isInsideNotes = true;
                    break;
                }
                node = node.parentNode;
            }

            if (isInsideNotes) {
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.id = 'tweet-tooltip';
                    tooltip.className = 'tweet-tooltip';
                    document.body.appendChild(tooltip);
                    
                    tooltip.addEventListener('mousedown', (e) => {
                        e.preventDefault(); // prevent clearing selection
                        const text = window.getSelection().toString().trim();
                        // Find the parent note to get the link
                        let link = '';
                        let parent = window.getSelection().anchorNode.parentNode;
                        while (parent) {
                            if (parent.classList && parent.classList.contains('note-card')) {
                                const linkEl = parent.querySelector('.read-more');
                                if (linkEl) link = linkEl.href;
                                break;
                            }
                            parent = parent.parentNode;
                        }
                        
                        // Limit text length to fit in a tweet if necessary
                        let tweetContent = `"${text}"`;
                        if (tweetContent.length > 200) {
                            tweetContent = tweetContent.substring(0, 197) + '..."';
                        }
                        
                        const fullTweet = `${tweetContent}\n\nBigQuery Update: ${link}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweet)}`, '_blank');
                    });
                }

                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                tooltip.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Tweet snippet
                `;
                
                // Position tooltip above the selection
                tooltip.style.left = `${rect.left + (rect.width / 2) - 65}px`;
                tooltip.style.top = `${rect.top - 45 + window.scrollY}px`;
                tooltip.style.display = 'flex';
                // Trigger reflow
                void tooltip.offsetWidth;
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            } else if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(-5px)';
                setTimeout(() => tooltip.style.display = 'none', 200);
            }
        } else if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(-5px)';
            setTimeout(() => tooltip.style.display = 'none', 200);
        }
    });
});
