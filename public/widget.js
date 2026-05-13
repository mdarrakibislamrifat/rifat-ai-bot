(function() {

    const script = document.currentScript;
    const chatbotId = script.getAttribute('data-chatbot-id');
    
  
    const origin = new URL(script.src).origin;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '999999';
    document.body.appendChild(container);

    const shadow = container.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
        <style>
            .bubble {
                width: 60px; height: 60px; border-radius: 50%;
                background: #2563eb; color: white; display: flex;
                align-items: center; justify-content: center;
                cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .bubble:hover { transform: scale(1.1) rotate(5deg); }
            .bubble:active { transform: scale(0.9); }
            
            iframe {
                position: absolute; bottom: 80px; right: 0;
                width: 400px; height: 600px; border: none;
                border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: none; background: white;
                opacity: 0; transform: translateY(20px);
                transition: all 0.3s ease;
            }
            /* Animation for smooth opening */
            iframe.show { 
                display: block; 
                opacity: 1; 
                transform: translateY(0);
            }
            
            /* Responsive for mobile */
            @media (max-width: 480px) {
                iframe {
                    width: calc(100vw - 48px);
                    height: calc(100vh - 120px);
                }
            }
        </style>
        <div class="bubble" id="toggle-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <iframe id="chat-frame" src="${origin}/chatbot/${chatbotId}"></iframe>
    `;

    const btn = shadow.getElementById('toggle-btn');
    const frame = shadow.getElementById('chat-frame');

    btn.onclick = () => {
        const isHidden = frame.style.display === 'none' || frame.style.display === '';
        if (isHidden) {
            frame.style.display = 'block';
            setTimeout(() => frame.classList.add('show'), 10);
        } else {
            frame.classList.remove('show');
            setTimeout(() => frame.style.display = 'none', 300);
        }
    };
})();