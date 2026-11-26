import path from 'node:path';
export const KEY = 'clinerDeliverablesV1';
const absolute = value => /^(?:[a-z]:[\\/]|[\\/])/i.test(value);
export function resolveFile(cwd, value) {
  if (typeof value !== 'string' || !value.trim() || /[\x00-\x1f]/.test(value)) return null;
  const api = /^[a-z]:[\\/]/i.test(cwd) || /^[a-z]:[\\/]/i.test(value) || cwd.startsWith('\\\\') ? path.win32 : path.posix;
  if (!absolute(value) && !cwd) return null;
  return absolute(value) ? api.normalize(value) : api.resolve(cwd, value);
}
const identity = value => /^[a-z]:[\\/]|^\\\\/i.test(value) ? value.replace(/\\/g, '/').toLowerCase() : value;
export function initial(header) { return { cwd: header.cwd || '', rows: [], pending: {} }; }
function add(state, file, event, source) {
  const target = resolveFile(state.cwd, file.path);
  if (!target || /[\\/]$/.test(file.path)) return state;
  const id = identity(target), at = state.rows.findIndex(row => row.id === id);
  const previous = at < 0 ? null : state.rows[at];
  const row = { id, path: target, description: file.description || previous?.description || '',
    firstTime: previous?.firstTime ?? event.time, firstSeq: previous?.firstSeq ?? event.seq,
    time: event.time, seq: event.seq, turn: event.data.turn || previous?.turn || 0,
    source: source === 'presented' || previous?.source === 'presented' ? 'presented' : source === 'produced' || previous?.source === 'produced' ? 'produced' : source,
    count: (previous?.count || 0) + 1 };
  const rows = state.rows.slice(); if (at < 0) rows.push(row); else rows[at] = row;
  return { ...state, rows };
}
export function fold(state, event) {
  const d = event.data || {};
  if (event.type === 'deliverables/presented' && Array.isArray(d.files)) {
    return d.files.reduce((s, f) => f && typeof f.path === 'string' ? add(s, f, event, 'presented') : s, state);
  }
  if (event.type === 'tool/call' && ['write','edit','str_replace_editor'].includes(d.name)) {
    let args; try { args = JSON.parse(d.arguments); } catch { return state; }
    if (!args || typeof args !== 'object' || (d.name === 'str_replace_editor' && !['create','str_replace','insert'].includes(args.command))) return state;
    const value = args.file_path || args.path;
    if (typeof value !== 'string') return state;
    return { ...state, pending: { ...state.pending, [d.callId]: { path: value } } };
  }
  if (event.type === 'tool/result') {
    const callId = d.message?.toolCallId || d.message?.source?.callId;
    const call = state.pending[callId]; if (!call) return state;
    const pending = { ...state.pending }; delete pending[callId];
    const next = { ...state, pending };
    if (d.error || d.message?.isError) return next;
    const recorded = d.meta && typeof d.meta === 'object' ? d.meta.path : undefined;
    const value = typeof recorded === 'string' && absolute(recorded) ? recorded : call.path;
    return add(next, { path: value }, event, 'produced');
  }
  if (event.type === 'assistant/message') {
    let next = state;
    for (const block of d.message?.content || []) {
      if (block.type !== 'text') continue;
      // Only authored local file links, not ordinary prose paths, remote URLs or user attachments.
      for (const m of block.text.matchAll(/!?\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))\s*\)/g)) {
        let value = m[1] || m[2];
        if (value.startsWith('#') || (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[a-z]:[\\/]/i.test(value))) continue;
        value = value.replace(/#.*$/, '');
        try { value = decodeURIComponent(value); } catch { continue; }
        if (!/\.[a-z0-9]{1,12}$/i.test(value)) continue;
        next = add(next, { path: value }, event, 'linked');
      }
    }
    return next;
  }
  return state;
}
