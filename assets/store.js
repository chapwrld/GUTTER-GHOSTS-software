/* Shared state uses a version-checked database write. No local-only save fallback. */
window.GGStore = (() => {
  let data, version = 0, ready = false, busy = false, lastError = '';
  const cfg = window.GG_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.publishableKey);
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => fn());
  async function api(path, options = {}) {
    const headers = { apikey: cfg.publishableKey, ...options.headers };
    if (cfg.publishableKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + cfg.publishableKey;
    const response = await fetch(cfg.supabaseUrl.replace(/\/$/, '') + path, {...options, headers, signal: AbortSignal.timeout(20000)});
    if (!response.ok) { const body = await response.text(); throw new Error(body.includes('GG_CONFLICT') ? 'Someone else saved changes. Reload the latest content and try again; your draft is still open.' : `Shared storage request failed (${response.status}). Nothing was saved. Check the connection and database setup.`); }
    return response.status === 204 ? null : response.json();
  }
  async function refresh() {
    if (!configured || busy || document.querySelector('dialog[open]')) return;
    const previousStatus = ready + lastError, previousVersion = version;
    try {
      const rows = await api('/rest/v1/gg_hub_state?id=eq.operations&select=payload,revision');
      if (rows.length && rows[0].revision !== version) { data = rows[0].payload; version = rows[0].revision; }
      ready = true; lastError = ''; if(previousVersion!==version || previousStatus!==ready+lastError) emit();
    } catch(e) { ready = false; lastError = e.message; if(previousStatus!==ready+lastError) emit(); }
  }
  async function init() {
    const r = await fetch('assets/seed.json');
    if (!r.ok) throw new Error('Could not load the reference content. Reload this page.');
    data = await r.json();
    if(configured) await refresh();
    else emit();
    setInterval(refresh, 10000);
    window.addEventListener('focus', refresh);
  }
  async function change(mutator) {
    if (!ready) throw new Error(lastError || 'Shared editing is not connected yet. Complete the database setup first.');
    if (busy) throw new Error('A save is already in progress. Please try again in a moment.');
    const next = structuredClone(data); mutator(next);
    busy = true; emit();
    try {
      const result = await api('/rest/v1/rpc/gg_hub_save', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({expected_revision:version, new_payload:next})});
      data = next; version = result; lastError = '';
    } catch(e) {
      lastError = e.message;
      // Fetch current revision so a user can explicitly retry their still-open draft.
      try {const rows = await api('/rest/v1/gg_hub_state?id=eq.operations&select=payload,revision');if(rows.length){data=rows[0].payload;version=rows[0].revision;}} catch {}
      throw e;
    } finally {busy=false;emit();}
  }
  const allowed = ['application/pdf','image/jpeg','image/png','image/webp','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  async function upload(file) {
    if(!ready) throw new Error('Connect shared storage before uploading.');
    if(!allowed.includes(file.type)) throw new Error('Choose a PDF, JPG, PNG, WebP, TXT, CSV, DOCX, or XLSX file.');
    if(file.size>20*1024*1024) throw new Error('Please choose a file smaller than 20 MB.');
    const path = crypto.randomUUID() + '/' + file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    await api('/storage/v1/object/gg-hub-files/'+path, {method:'POST',headers:{'Content-Type':file.type},body:file});
    return {path,url:cfg.supabaseUrl.replace(/\/$/,'')+'/storage/v1/object/public/gg-hub-files/'+path};
  }
  async function removeFile(path) {if(path) await api('/storage/v1/object/gg-hub-files',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[path]})});}
  return {init,refresh,change,upload,removeFile,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},get data(){return data},get ready(){return ready},get busy(){return busy},get status(){return busy?'Saving…':lastError|| (ready?'Shared content connected':'Shared editing needs database setup');}};
})();
