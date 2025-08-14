export const runtime = 'edge';

export async function GET() {
  const code = `(() => {
    const style = document.createElement('style');
    style.textContent = '
      .aipp-bubble{position:fixed;right:16px;bottom:16px;background:#58a6ff;color:#0b0d10;border-radius:999px;padding:12px 14px;font-weight:700;cursor:pointer;z-index:99990}
      .aipp-panel{position:fixed;right:16px;bottom:72px;width:320px;height:420px;background:#12161b;color:#e6edf3;border:1px solid #20252b;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;z-index:99991}
      .aipp-header{padding:8px 12px;border-bottom:1px solid #20252b;font-weight:700}
      .aipp-messages{flex:1;overflow:auto;padding:8px}
      .aipp-input{display:flex;gap:8px;padding:8px;border-top:1px solid #20252b}
      .aipp-input input{flex:1;background:#0e1116;color:#e6edf3;border:1px solid #20252b;border-radius:8px;padding:8px}
      .aipp-input button{background:#58a6ff;color:#0b0d10;border:none;border-radius:8px;padding:8px 10px;font-weight:700}
    ';
    document.head.appendChild(style);

    const bubble = document.createElement('div');
    bubble.className = 'aipp-bubble';
    bubble.textContent = 'Ask Agent';
    document.body.appendChild(bubble);

    const panel = document.createElement('div');
    panel.className = 'aipp-panel';
    panel.style.display = 'none';
    panel.innerHTML = '<div class="aipp-header">Real Estate Assistant</div>\n<div class="aipp-messages"></div>\n<div class="aipp-input"><input placeholder="Ask about a property..."/><button>Send</button></div>';
    document.body.appendChild(panel);

    const messages = panel.querySelector('.aipp-messages');
    const input = panel.querySelector('input');
    const sendBtn = panel.querySelector('button');

    function add(role, text){
      const div = document.createElement('div');
      div.style.marginBottom = '8px';
      const who = document.createElement('strong');
      who.textContent = role+': ';
      div.appendChild(who);
      div.appendChild(document.createTextNode(text));
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    bubble.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    sendBtn.addEventListener('click', async () => {
      const q = input.value.trim();
      if(!q) return;
      add('you', q);
      input.value='';
      try {
        const res = await fetch('/api/ai', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ mode:'chat', input:{ messages:[{role:'user', content:q}], context:{ domain:'real-estate', kb:{ name:'Agent FAQ'} } } }) });
        const data = await res.json();
        add('agent', data.message || '...');
      } catch(e){ add('agent', 'Sorry, something went wrong.'); }
    });
  })();`;

  return new Response(code, { status: 200, headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' } });
}
