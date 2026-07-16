// oauth-worker/src/index.js
// Decap/Sveltia CMS 호환 GitHub OAuth 핸들러.
// 환경변수(Secrets): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
const html = (msg) => `<!doctype html><html><body><script>
(function(){
  function send(){ window.opener && window.opener.postMessage('authorization:github:${msg.status}:${JSON.stringify(msg.content)}', '*'); }
  window.addEventListener('message', function(){ send(); }, {once:true});
  send();
})();
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') {
      const redirect = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${encodeURIComponent(url.origin + '/callback')}`;
      return Response.redirect(redirect, 302);
    }
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const data = await tokenRes.json();
      const status = data.access_token ? 'success' : 'error';
      const content = data.access_token ? { token: data.access_token, provider: 'github' } : { error: data.error || 'no token' };
      return new Response(html({ status, content }), { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('CMS OAuth worker', { status: 200 });
  },
};
