import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const recentMedia = new Map();
const videoTasks = new Map();
const pendingSilentMediaTurns = new Map();
const pendingMediaCommandTurns = new Map();

const SILENT_MEDIA_TURN_TTL_MS = 15000;
const MEDIA_COMMAND_TURN_TTL_MS = 15000;
const BYPASS_MEDIA_COMMANDS = new Set(['imagine', 'edit', 'video', 'textvideo', 't2v']);

const EDIT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_EDIT_SESSIONS = 200;
const MAX_RECENT_MEDIA_ENTRIES = 200;

const DEFAULTS = {
  baseUrlPrimary: 'http://127.0.0.1:18000',
  baseUrlFallback: 'https://grok.uonoe.com',
  timeoutMs: 30000,
  pollIntervalMs: 3000,
  pollTimeoutMs: 120000,
  preferDirectFile: true,
  publicBaseUrl: 'https://grok.uonoe.com',
  stateFilePath: '',
};

const SIZE_BY_RATIO = {
  '16:9': '1280x720',
  '9:16': '720x1280',
  '3:2': '1792x1024',
  '2:3': '1024x1792',
  '1:1': '1024x1024',
};

function withDefaults(raw = {}) {
  return {
    ...DEFAULTS,
    ...raw,
  };
}

function makeSessionKey(parts = {}) {
  return [parts.channelId || parts.channel || '', parts.accountId || '', parts.from || '', parts.to || ''].join('::');
}

function collectChannelKeys(parts = {}) {
  const rawValues = [parts.channelId, parts.channel, parts.provider, parts.surface]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const values = new Set();
  for (const raw of rawValues) {
    values.add(raw);
    const base = raw.split(':')[0]?.trim();
    if (base) values.add(base);
  }
  return [...values];
}

function buildRecentMediaLookupKeys(parts = {}) {
  const channels = collectChannelKeys(parts);
  const accountId = String(parts.accountId || '').trim();
  const from = String(parts.from || '').trim();
  const keys = [];
  const exact = makeSessionKey(parts);
  if (exact) keys.push(`exact:${exact}`);
  if (accountId && from) keys.push(`account:${accountId}::${from}`);
  if (from) keys.push(`from:${from}`);
  for (const channel of channels) {
    if (channel && accountId && from) keys.push(`user:${channel}::${accountId}::${from}`);
    if (channel && from) keys.push(`user-lite:${channel}::${from}`);
    if (channel) keys.push(`channel:${channel}`);
  }
  return [...new Set(keys)];
}

function rememberRecentMedia(record) {
  for (const key of buildRecentMediaLookupKeys(record)) {
    recentMedia.set(key, record);
  }
}

function findRecentMedia(parts = {}) {
  for (const key of buildRecentMediaLookupKeys(parts)) {
    const hit = recentMedia.get(key);
    if (hit?.mediaPath) return hit;
  }
  return null;
}

const TELEGRAM_INBOUND_DIR = '/home/node/.openclaw/media/inbound';
const RECENT_INBOUND_LOOKBACK_MS = 15 * 60 * 1000;

async function findLatestTelegramInboundImage() {
  try {
    const names = await readdir(TELEGRAM_INBOUND_DIR);
    const now = Date.now();
    const candidates = [];
    for (const name of names) {
      if (!/\.(?:png|jpe?g|webp|gif)$/i.test(name)) continue;
      const filePath = path.join(TELEGRAM_INBOUND_DIR, name);
      let meta;
      try {
        meta = await stat(filePath);
      } catch {
        continue;
      }
      if (!meta.isFile()) continue;
      const modifiedAt = meta.mtimeMs || 0;
      if ((now - modifiedAt) > RECENT_INBOUND_LOOKBACK_MS) continue;
      candidates.push({ filePath, modifiedAt });
    }
    candidates.sort((a, b) => b.modifiedAt - a.modifiedAt);
    return candidates[0] || null;
  } catch {
    return null;
  }
}

function pickPreferredIncomingMedia(context = {}) {
  const paths = Array.isArray(context.mediaPaths) ? context.mediaPaths : [];
  const types = Array.isArray(context.mediaTypes) ? context.mediaTypes : [];
  for (let i = paths.length - 1; i >= 0; i -= 1) {
    const mediaPath = String(paths[i] || '').trim();
    if (!mediaPath) continue;
    const mediaType = String(types[i] || context.mediaType || '').trim();
    if (!mediaType || mediaType.startsWith('image/')) {
      return { mediaPath, mediaType: mediaType || String(context.mediaType || '').trim() || 'image/jpeg' };
    }
  }
  const fallbackPath = String(context.mediaPath || '').trim();
  if (!fallbackPath) return null;
  return { mediaPath: fallbackPath, mediaType: String(context.mediaType || '').trim() };
}


function makeSilentMediaTurnKeys(parts = {}) {
  const accountId = String(parts.accountId || '').trim();
  const accountIds = accountId ? [accountId, ''] : [''];
  const keys = [];
  for (const channel of collectChannelKeys(parts)) {
    for (const value of accountIds) keys.push(`${channel}::${value}`);
  }
  return [...new Set(keys)];
}

function rememberSilentMediaTurn(parts = {}) {
  for (const key of makeSilentMediaTurnKeys(parts)) {
    pendingSilentMediaTurns.set(key, Date.now());
  }
}

function hasSilentMediaTurn(parts = {}) {
  const now = Date.now();
  for (const key of makeSilentMediaTurnKeys(parts)) {
    const timestamp = pendingSilentMediaTurns.get(key);
    if (!timestamp) continue;
    if ((now - timestamp) <= SILENT_MEDIA_TURN_TTL_MS) return true;
    pendingSilentMediaTurns.delete(key);
  }
  return false;
}

function clearSilentMediaTurn(parts = {}) {
  for (const key of makeSilentMediaTurnKeys(parts)) {
    pendingSilentMediaTurns.delete(key);
  }
}

function consumeSilentMediaTurn(parts = {}) {
  if (!hasSilentMediaTurn(parts)) return false;
  clearSilentMediaTurn(parts);
  return true;
}

function extractSlashCommandName(text = '') {
  const match = String(text || '').trim().match(/^\/([A-Za-z0-9_:-]+)/);
  return String(match?.[1] || '').toLowerCase();
}

function isBypassedMediaCommand(text = '') {
  return BYPASS_MEDIA_COMMANDS.has(extractSlashCommandName(text));
}

function makeMediaCommandTurnKeys(parts = {}) {
  const accountId = String(parts.accountId || '').trim();
  const accountIds = accountId ? [accountId, ''] : [''];
  const keys = [];
  for (const channel of collectChannelKeys(parts)) {
    for (const value of accountIds) keys.push(`${channel}::${value}`);
  }
  return [...new Set(keys)];
}

function rememberMediaCommandTurn(parts = {}) {
  for (const key of makeMediaCommandTurnKeys(parts)) {
    pendingMediaCommandTurns.set(key, Date.now());
  }
}

function hasMediaCommandTurn(parts = {}) {
  const now = Date.now();
  for (const key of makeMediaCommandTurnKeys(parts)) {
    const timestamp = pendingMediaCommandTurns.get(key);
    if (!timestamp) continue;
    if ((now - timestamp) <= MEDIA_COMMAND_TURN_TTL_MS) return true;
    pendingMediaCommandTurns.delete(key);
  }
  return false;
}

function clearMediaCommandTurn(parts = {}) {
  for (const key of makeMediaCommandTurnKeys(parts)) {
    pendingMediaCommandTurns.delete(key);
  }
}

function consumeMediaCommandTurn(parts = {}) {
  if (!hasMediaCommandTurn(parts)) return false;
  clearMediaCommandTurn(parts);
  return true;
}

function parsePluginSourcePath(source) {
  const raw = String(source || '').trim();
  if (!raw) return '';
  if (raw.startsWith('file://')) return fileURLToPath(raw);
  return raw;
}

function resolveStateFilePath(config = {}, source = '') {
  const explicit = String(config.stateFilePath || '').trim();
  if (explicit) return explicit;
  const sourcePath = parsePluginSourcePath(source);
  if (sourcePath.startsWith('/home/node/.openclaw/extensions/')) {
    return '/home/node/.openclaw/workspace/grok-media/state.json';
  }
  if (sourcePath) return path.join(path.dirname(sourcePath), 'state.json');
  return path.join('/tmp', 'grok-media-state.json');
}

function pruneEditSessions(records = {}) {
  const now = Date.now();
  const entries = Object.entries(records)
    .filter(([, value]) => value && (now - Number(value.updatedAt || 0)) <= EDIT_SESSION_TTL_MS)
    .sort((a, b) => Number(b[1].updatedAt || 0) - Number(a[1].updatedAt || 0))
    .slice(0, MAX_EDIT_SESSIONS);
  return Object.fromEntries(entries);
}

function pruneRecentMediaEntries(records = []) {
  const now = Date.now();
  const seen = new Set();
  const entries = [];
  for (const record of Array.isArray(records) ? records : []) {
    if (!record?.mediaPath) continue;
    if ((now - Number(record.updatedAt || 0)) > EDIT_SESSION_TTL_MS) continue;
    const dedupeKey = `${makeSessionKey(record)}::${String(record.mediaPath)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    entries.push({ ...record, updatedAt: Number(record.updatedAt || now) });
  }
  return entries
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    .slice(0, MAX_RECENT_MEDIA_ENTRIES);
}

function createEditSessionStore(config = {}, source = '') {
  return {
    filePath: resolveStateFilePath(config, source),
    loaded: false,
    sessions: {},
    recentMediaEntries: [],
  };
}

async function ensureEditSessionStoreLoaded(store) {
  if (!store || store.loaded) return;
  try {
    const raw = await readFile(store.filePath, 'utf8');
    const parsed = JSON.parse(raw);
    store.sessions = pruneEditSessions(parsed?.sessions || {});
    store.recentMediaEntries = pruneRecentMediaEntries(parsed?.recentMediaEntries || []);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    store.sessions = {};
    store.recentMediaEntries = [];
  }
  store.loaded = true;
}

async function persistEditSessionStore(store) {
  if (!store) return;
  await ensureEditSessionStoreLoaded(store);
  store.sessions = pruneEditSessions(store.sessions || {});
  store.recentMediaEntries = pruneRecentMediaEntries(store.recentMediaEntries || []);
  await mkdir(path.dirname(store.filePath), { recursive: true });
  await writeFile(store.filePath, JSON.stringify({ version: 2, sessions: store.sessions, recentMediaEntries: store.recentMediaEntries }, null, 2));
}

async function getStoredEditSession(store, sessionKey) {
  if (!store || !sessionKey) return null;
  await ensureEditSessionStoreLoaded(store);
  const record = store.sessions?.[sessionKey];
  if (!record) return null;
  if ((Date.now() - Number(record.updatedAt || 0)) > EDIT_SESSION_TTL_MS) {
    delete store.sessions[sessionKey];
    await persistEditSessionStore(store);
    return null;
  }
  return record;
}

async function setStoredEditSession(store, sessionKey, record) {
  if (!store || !sessionKey || !record) return;
  await ensureEditSessionStoreLoaded(store);
  store.sessions[sessionKey] = { ...record, updatedAt: Date.now() };
  await persistEditSessionStore(store);
}

async function getStoredRecentMedia(store, parts = {}) {
  if (!store) return null;
  await ensureEditSessionStoreLoaded(store);
  const pruned = pruneRecentMediaEntries(store.recentMediaEntries || []);
  if (pruned.length !== (store.recentMediaEntries || []).length) {
    store.recentMediaEntries = pruned;
    await persistEditSessionStore(store);
  } else {
    store.recentMediaEntries = pruned;
  }
  const wantedKeys = new Set(buildRecentMediaLookupKeys(parts));
  for (const record of store.recentMediaEntries) {
    for (const key of buildRecentMediaLookupKeys(record)) {
      if (wantedKeys.has(key)) return record;
    }
  }
  return null;
}

async function setStoredRecentMedia(store, record) {
  if (!store || !record?.mediaPath) return;
  await ensureEditSessionStoreLoaded(store);
  store.recentMediaEntries = pruneRecentMediaEntries([
    { ...record, updatedAt: Number(record.updatedAt || Date.now()) },
    ...(store.recentMediaEntries || []),
  ]);
  await persistEditSessionStore(store);
}

function extractParentPostId(payload = {}, mediaUrls = []) {
  const direct = [payload.current_parent_post_id, payload.generated_parent_post_id, payload.input_parent_post_id]
    .map((value) => String(value || '').trim())
    .find(Boolean);
  if (direct) return direct;
  const fallback = String(mediaUrls[0] || '').match(/\/generated\/([^/]+)\//i);
  return fallback?.[1] || '';
}

function normalizeBaseUrl(input) {
  return String(input || '').trim().replace(/\/+$/, '');
}

function buildUrl(baseUrl, pathname, query = undefined) {
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${pathname.startsWith('/') ? pathname : `/${pathname}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function shouldFallback(error, response) {
  if (error) return true;
  if (!response) return true;
  return response.status >= 500;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function requestJsonWithFallback(config, request) {
  const primary = normalizeBaseUrl(config.baseUrlPrimary);
  const fallback = normalizeBaseUrl(config.baseUrlFallback);
  const targets = fallback && fallback !== primary ? [primary, fallback] : [primary];
  let lastError = null;
  let lastResponse = null;

  for (let i = 0; i < targets.length; i += 1) {
    const baseUrl = targets[i];
    const url = buildUrl(baseUrl, request.pathname, request.query);
    let response;
    try {
      response = await fetchWithTimeout(url, request.options, Number(config.timeoutMs) || DEFAULTS.timeoutMs);
      lastResponse = response;
      if (response.status >= 400) {
        const bodyText = await response.text();
        if (response.status < 500 || i === targets.length - 1) {
          const error = new Error(bodyText || `HTTP ${response.status}`);
          error.status = response.status;
          error.body = bodyText;
          error.baseUrl = baseUrl;
          throw error;
        }
        lastError = new Error(bodyText || `HTTP ${response.status}`);
        continue;
      }
      const data = await response.json();
      return { data, baseUrl };
    } catch (error) {
      if (!shouldFallback(error, response) || i === targets.length - 1) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error(lastResponse ? `HTTP ${lastResponse.status}` : 'Request failed');
}

function contentResult(payload) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    details: payload,
  };
}

function commandReplyFromPayload(payload) {
  const urls = Array.isArray(payload.mediaUrls) ? payload.mediaUrls.filter(Boolean) : payload.mediaUrl ? [payload.mediaUrl] : [];
  return {
    text: payload.message || payload.text || JSON.stringify(payload, null, 2),
    ...(urls.length === 1 ? { mediaUrl: urls[0] } : urls.length > 1 ? { mediaUrls: urls } : {}),
  };
}

function firstUrlFromText(text) {
  const match = String(text || '').match(/https?:\/\/\S+/);
  return match ? match[0].replace(/[)>.,]+$/, '') : '';
}

function parsePercent(text) {
  const match = String(text || '').match(/(\d{1,3})%/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function mimeFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

async function filePathToDataUrl(filePath) {
  const buffer = await readFile(filePath);
  return `data:${mimeFromFile(filePath)};base64,${buffer.toString('base64')}`;
}

function extractUrl(text) {
  return firstUrlFromText(String(text || '').replace(/["'<>]/g, ' '));
}

function extractPreferredMediaUrl(text) {
  const raw = String(text || '');
  const sourceMatch = raw.match(/<source[^>]+src="(https?:[^"\s]+)"[^>]*type="video\/mp4"/i);
  if (sourceMatch?.[1]) return sourceMatch[1];
  const mp4Match = raw.match(/https?:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/i);
  if (mp4Match?.[0]) return mp4Match[0];
  return extractUrl(raw);
}

function extractLocalPath(text) {
  const raw = String(text || '');
  const mediaPathMatch = raw.match(/MediaPath:\s*([^\n]+)/i);
  if (mediaPathMatch) return mediaPathMatch[1].trim();
  const absolutePathMatch = raw.match(/(\/(?:[^\s"'<>]+\/)*[^\s"'<>]+\.(?:png|jpe?g|webp|gif))/i);
  return absolutePathMatch ? absolutePathMatch[1].trim() : '';
}

function sortRecentMediaByFreshness(...records) {
  return records
    .filter((record) => record?.mediaPath)
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

async function resolveImageInput(params, context = {}, sessionStore = null) {
  const explicitPath = String(params.image_path || '').trim();
  if (explicitPath) {
    return { kind: 'data_url', value: await filePathToDataUrl(explicitPath), source: 'image_path', original: explicitPath };
  }
  const explicitUrl = String(params.image_url || '').trim();
  if (explicitUrl) {
    return { kind: 'url', value: explicitUrl, source: 'image_url', original: explicitUrl };
  }

  const textHints = [params.prompt, params.args, context.commandBody, context.content].filter(Boolean).join('\n');
  const hintedUrl = extractUrl(textHints);
  if (hintedUrl) {
    return { kind: 'url', value: hintedUrl, source: 'hint_url', original: hintedUrl };
  }
  const hintedPath = extractLocalPath(textHints);
  if (hintedPath) {
    return { kind: 'data_url', value: await filePathToDataUrl(hintedPath), source: 'hint_path', original: hintedPath };
  }

  const isTelegramContext = ['telegram', 'telegram:default'].includes(String(context.channelId || context.channel || context.provider || '').trim()) || String(context.from || '').startsWith('telegram:');
  if (isTelegramContext) {
    const latestInbound = await findLatestTelegramInboundImage();
    if (latestInbound?.filePath) {
      return {
        kind: 'data_url',
        value: await filePathToDataUrl(latestInbound.filePath),
        source: 'telegram_inbound_latest',
        original: latestInbound.filePath,
      };
    }
  }

  const cachedRecentMedia = findRecentMedia(context);
  const storedRecentMedia = await getStoredRecentMedia(sessionStore, context);
  const candidateRecentMedia = sortRecentMediaByFreshness(cachedRecentMedia, storedRecentMedia);
  for (const candidate of candidateRecentMedia) {
    try {
      rememberRecentMedia(candidate);
      return {
        kind: 'data_url',
        value: await filePathToDataUrl(candidate.mediaPath),
        source: candidate === storedRecentMedia ? 'stored_recent_media' : 'recent_media',
        original: candidate.mediaPath,
      };
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  return null;
}

function normalizeAspectRatio(value) {
  const raw = String(value || '').trim();
  return SIZE_BY_RATIO[raw] ? raw : '1:1';
}

function validateAspectRatio(value) {
  const raw = String(value || '').trim();
  return SIZE_BY_RATIO[raw] ? raw : null;
}

function normalizeVideoLength(value) {
  const raw = Number(value || 0);
  return [6, 10, 15].includes(raw) ? raw : 6;
}

function validateVideoLength(value) {
  const raw = Number(value || 0);
  return [6, 10, 15].includes(raw) ? raw : null;
}

function normalizeResolutionName(value) {
  const raw = String(value || '').trim();
  return ['480p', '720p'].includes(raw) ? raw : '480p';
}

function validateResolutionName(value) {
  const raw = String(value || '').trim();
  return ['480p', '720p'].includes(raw) ? raw : null;
}

function normalizeVideoPreset(value) {
  const raw = String(value || '').trim();
  return ['fun', 'normal', 'spicy', 'custom'].includes(raw) ? raw : 'normal';
}

function validateVideoPreset(value) {
  const raw = String(value || '').trim();
  return ['fun', 'normal', 'spicy', 'custom'].includes(raw) ? raw : null;
}

function normalizeNsfw(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return fallback;
  if (['1', 'true', 'yes', 'on', 'enable', 'enabled'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off', 'disable', 'disabled'].includes(raw)) return false;
  return fallback;
}

function stripLeadingCommandToken(text) {
  const clean = String(text || '').trim();
  return clean.replace(/^\/[A-Za-z0-9_:-]+\s*/, '').trim();
}

const VIDEO_OPTION_ALIASES = {
  ratio: 'aspect_ratio',
  '比例': 'aspect_ratio',
  len: 'video_length',
  length: 'video_length',
  duration: 'video_length',
  '时长': 'video_length',
  res: 'resolution_name',
  resolution: 'resolution_name',
  '清晰度': 'resolution_name',
  '分辨率': 'resolution_name',
  preset: 'preset',
  style: 'preset',
  '风格': 'preset',
  '预设': 'preset',
  nsfw: 'nsfw',
  '审核': 'nsfw',
};

function parseVideoCommandInput(args = '', commandBody = '') {
  const source = String(args || '').trim() || stripLeadingCommandToken(commandBody);
  const rawOptions = {};
  const errors = [];
  const pattern = /--([^\s]+)\s+(\S+)/gu;
  const prompt = source.replace(pattern, (all, key, value) => {
    const alias = VIDEO_OPTION_ALIASES[String(key || '').toLowerCase()] || VIDEO_OPTION_ALIASES[String(key || '').trim()];
    if (!alias) return all;
    rawOptions[alias] = String(value || '').trim();
    return ' ';
  }).replace(/\s+/g, ' ').trim();

  const aspectRatio = rawOptions.aspect_ratio ? validateAspectRatio(rawOptions.aspect_ratio) : '1:1';
  if (rawOptions.aspect_ratio && !aspectRatio) {
    errors.push('比例仅支持 16:9 / 9:16 / 3:2 / 2:3 / 1:1');
  }

  const videoLength = rawOptions.video_length ? validateVideoLength(rawOptions.video_length) : 6;
  if (rawOptions.video_length && !videoLength) {
    errors.push('时长仅支持 6 / 10 / 15 秒');
  }

  const resolutionName = rawOptions.resolution_name ? validateResolutionName(rawOptions.resolution_name) : '480p';
  if (rawOptions.resolution_name && !resolutionName) {
    errors.push('清晰度仅支持 480p / 720p');
  }

  const preset = rawOptions.preset ? validateVideoPreset(rawOptions.preset) : 'normal';
  if (rawOptions.preset && !preset) {
    errors.push('风格仅支持 fun / normal / spicy / custom');
  }

  const nsfw = normalizeNsfw(rawOptions.nsfw, true);

  return {
    prompt,
    aspect_ratio: aspectRatio || '1:1',
    video_length: videoLength || 6,
    resolution_name: resolutionName || '480p',
    preset: preset || 'normal',
    nsfw,
    errors,
  };
}

function buildVideoCommandHelp(commandName, mode = 'text', reason = '') {
  const lines = [];
  if (reason) lines.push(reason);
  if (mode === 'image') {
    lines.push('先发送一张图片，再输入命令。');
    lines.push(`用法：/${commandName} 提示词 --比例 9:16 --时长 6 --清晰度 480p --风格 fun`);
  } else {
    lines.push('请先提供视频提示词。');
    lines.push(`用法：/${commandName} 赛博朋克城市夜景 --比例 16:9 --时长 10 --清晰度 720p --风格 spicy`);
  }
  lines.push('参数：');
  lines.push('- --ratio / --比例: 16:9 | 9:16 | 3:2 | 2:3 | 1:1');
  lines.push('- --len / --时长: 6/10/15');
  lines.push('- --res / --清晰度 / --分辨率: 480p/720p');
  lines.push('- --preset / --风格 / --预设: fun | normal | spicy | custom');
  lines.push('- --nsfw / --审核: true|false（默认 true）');
  return lines.join('\n');
}

function buildFaithfulEditPrompt(prompt) {
  const clean = String(prompt || '').trim();
  const requested = clean || '按用户要求微调动作与细节';
  return [
    '请基于输入图片做保真编辑。',
    '保持同一人物身份、脸部特征、发型、服装、体型、背景、机位、构图和整体光线。',
    '除非用户明确要求，否则不要改变人物、服装、年龄、肤色、场景、画风，也不要新增裸露或成人化内容。',
    `只修改这些内容：${requested}`
  ].join('\n');
}

function isKnownGrokMediaReply(content = '', mediaUrls = []) {
  if (Array.isArray(mediaUrls) && mediaUrls.filter(Boolean).length > 0) return true;
  const text = String(content || '').trim();
  if (!text) return false;
  return [
    '请发送一张图片，或传入 image_path / image_url 后再编辑。',
    '请发送一张图片，或传入 image_path / image_url 后再生成视频。',
    '图片编辑完成（保真编辑模式）',
    '已生成 ',
    '视频任务已提交',
    '视频生成完成',
    '视频生成失败',
    '未找到该任务',
    '请提供 task_id。'
  ].some((needle) => text.includes(needle));
}

function payloadMessage(prefix, payload) {
  return `${prefix}\n${JSON.stringify(payload, null, 2)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCommandError(error) {
  const status = Number(error?.status || 0);
  const raw = String(error?.body || error?.message || error || '').replace(/\s+/g, ' ').trim();
  const brief = raw.length > 220 ? `${raw.slice(0, 219)}…` : raw;
  if (status) return `HTTP ${status}${brief ? `: ${brief}` : ''}`;
  return brief || '未知错误';
}

async function runCommandWithRetry(label, runner, logger) {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await runner();
    } catch (error) {
      lastError = error;
      logger?.warn?.(`[grok-media] ${label} attempt=${attempt} failed: ${error?.stack || String(error)}`);
      if (attempt < 2) await sleep(400);
    }
  }
  throw lastError;
}

async function handleImagine(config, params) {
  const aspectRatio = normalizeAspectRatio(params.aspect_ratio);
  const request = {
    pathname: '/v1/images/generations',
    options: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'grok-imagine-1.0',
        prompt: String(params.prompt || '').trim(),
        n: Number(params.count || 1),
        size: SIZE_BY_RATIO[aspectRatio],
        response_format: 'url',
        stream: false,
        nsfw: normalizeNsfw(params.nsfw, true),
      }),
    },
  };
  const { data, baseUrl } = await requestJsonWithFallback(config, request);
  const mediaUrls = Array.isArray(data?.data) ? data.data.map((entry) => entry?.url).filter(Boolean) : [];
  const payload = {
    status: mediaUrls.length ? 'completed' : 'empty',
    provider: 'grok2api',
    action: 'imagine',
    aspect_ratio: aspectRatio,
    count: mediaUrls.length,
    mediaUrls,
    message: mediaUrls.length ? `已生成 ${mediaUrls.length} 张图片` : '未返回图片',
    baseUrl,
    raw: data,
  };
  return payload;
}

async function handleEdit(config, params, context = {}, sessionStore = null) {
  const sessionKey = makeSessionKey(context);
  const imageInput = await resolveImageInput(params, context, sessionStore);
  const storedSession = imageInput ? null : await getStoredEditSession(sessionStore, sessionKey);
  if (!imageInput && !storedSession) {
    return {
      status: 'needs_image',
      provider: 'grok2api',
      action: 'edit',
      message: '请发送一张图片，或传入 image_path / image_url 后再编辑。',
    };
  }

  const body = {
    prompt: buildFaithfulEditPrompt(params.prompt),
    stream: false,
  };
  if (imageInput?.kind === 'data_url') body.image_base64 = imageInput.value;
  else if (imageInput?.kind === 'url') body.image_url = imageInput.value;

  if (!imageInput && storedSession) {
    if (storedSession.parentPostId) body.parent_post_id = storedSession.parentPostId;
    if (storedSession.sourceImageUrl) body.source_image_url = storedSession.sourceImageUrl;
    else if (storedSession.lastMediaUrl) body.image_url = storedSession.lastMediaUrl;
  }

  const { data, baseUrl } = await requestJsonWithFallback(config, {
    pathname: '/v1/public/imagine/workbench/edit',
    options: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  });
  const mediaUrls = Array.isArray(data?.data) ? data.data.map((entry) => entry?.url).filter(Boolean) : [];
  const responseSourceImageUrl = String(data?.current_source_image_url || data?.source_image_url || '').trim();
  const record = {
    parentPostId: extractParentPostId(data, mediaUrls),
    sourceImageUrl: responseSourceImageUrl || storedSession?.sourceImageUrl || '',
    lastMediaUrl: String(mediaUrls[0] || storedSession?.lastMediaUrl || '').trim(),
  };
  if (sessionKey && (record.parentPostId || record.sourceImageUrl || record.lastMediaUrl)) {
    await setStoredEditSession(sessionStore, sessionKey, record);
  }
  return {
    status: mediaUrls.length ? 'completed' : 'empty',
    provider: 'grok2api',
    action: 'edit',
    input_source: imageInput?.source || (storedSession ? 'stored_session' : 'none'),
    mediaUrls,
    message: mediaUrls.length ? '图片编辑完成（保真编辑模式）' : '图片编辑未返回结果',
    baseUrl,
    raw: data,
  };
}


function buildPushRoute(context = {}) {
  return {
    channel: String(context.channel || context.channelId || '').trim(),
    senderId: String(context.senderId || '').trim(),
    from: String(context.from || '').trim(),
    to: String(context.to || '').trim(),
    accountId: String(context.accountId || '').trim() || undefined,
    messageThreadId: typeof context.messageThreadId === 'number' ? context.messageThreadId : undefined,
  };
}

function summarizePrompt(prompt, maxLength = 72) {
  const clean = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '（空）';
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 1)}…`;
}

function buildVideoSuccessText(taskRecord) {
  return [
    '视频生成完成',
    `任务: ${taskRecord.taskId}`,
    `提示词: ${summarizePrompt(taskRecord.prompt)}`,
  ].join('\n');
}

function buildVideoFailureText(taskRecord) {
  const lines = [
    '视频生成失败',
    `任务: ${taskRecord.taskId}`,
    `原因: ${String(taskRecord.message || '未知错误')}`,
  ];
  if (taskRecord.taskId) lines.push(`可重试: /task ${taskRecord.taskId}`);
  return lines.join('\n');
}

function buildPushPayload(taskRecord, kind) {
  if (kind === 'video_failed') {
    return {
      kind,
      text: buildVideoFailureText(taskRecord),
      mediaUrl: undefined,
    };
  }
  return {
    kind,
    text: buildVideoSuccessText(taskRecord),
    mediaUrl: taskRecord.mediaUrl || undefined,
  };
}

async function pushTelegramResult(runtime, route, payload) {
  const send = runtime?.channel?.telegram?.sendMessageTelegram;
  if (typeof send !== 'function') return false;
  const target = route.senderId || route.from;
  if (!target) return false;
  await send(target, payload.text, {
    ...(payload.mediaUrl ? { mediaUrl: payload.mediaUrl } : {}),
    accountId: route.accountId,
    ...(route.messageThreadId ? { messageThreadId: route.messageThreadId } : {}),
  });
  return true;
}

async function pushMediaResult(runtime, taskRecord, kind) {
  const route = taskRecord.pushRoute;
  if (!route) return false;
  const pushKey = kind === 'video_failed' ? 'failure' : 'success';
  if (taskRecord.pushState?.[pushKey]) return false;
  const payload = buildPushPayload(taskRecord, kind);
  let delivered = false;
  switch (route.channel) {
    case 'telegram':
      delivered = await pushTelegramResult(runtime, route, payload);
      break;
    default:
      delivered = false;
      break;
  }
  if (delivered) {
    taskRecord.pushState = { ...(taskRecord.pushState || {}), [pushKey]: true };
  }
  return delivered;
}

async function consumeVideoTask(config, runtime, taskRecord) {
  taskRecord.status = 'running';
  taskRecord.updatedAt = Date.now();
  const url = buildUrl(taskRecord.baseUrl, '/v1/public/video/sse', { task_id: taskRecord.taskId });
  const response = await fetchWithTimeout(url, { method: 'GET' }, Number(config.pollTimeoutMs) || DEFAULTS.pollTimeoutMs);
  if (!response.ok || !response.body) {
    taskRecord.status = 'failed';
    taskRecord.message = `视频任务流读取失败: HTTP ${response.status}`;
    taskRecord.updatedAt = Date.now();
    await pushMediaResult(runtime, taskRecord, 'video_failed');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assembled = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let index;
    while ((index = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const dataLine = line.slice(5).trim();
        if (!dataLine) continue;
        if (dataLine === '[DONE]') {
          taskRecord.updatedAt = Date.now();
          if (taskRecord.status !== 'completed' && taskRecord.status !== 'failed') {
            taskRecord.status = taskRecord.mediaUrl ? 'completed' : 'done';
            taskRecord.message = taskRecord.mediaUrl ? '视频生成完成' : taskRecord.message || '视频任务结束';
          }
          if (taskRecord.status === 'completed' && taskRecord.mediaUrl) {
            await pushMediaResult(runtime, taskRecord, 'video_completed');
          }
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(dataLine);
        } catch {
          continue;
        }
        if (parsed?.error) {
          taskRecord.status = 'failed';
          taskRecord.message = parsed.error;
          taskRecord.errorCode = parsed.code || '';
          taskRecord.updatedAt = Date.now();
          await pushMediaResult(runtime, taskRecord, 'video_failed');
          return;
        }
        const content = parsed?.choices?.[0]?.delta?.content;
        if (!content) continue;
        assembled += content;
        taskRecord.transcript = assembled;
        const percent = parsePercent(content);
        if (percent !== null) taskRecord.progress = percent;
        const maybeUrl = extractPreferredMediaUrl(content);
        if (maybeUrl) {
          taskRecord.mediaUrl = maybeUrl;
          taskRecord.status = 'completed';
          taskRecord.progress = 100;
          taskRecord.message = '视频生成完成';
          taskRecord.updatedAt = Date.now();
          await pushMediaResult(runtime, taskRecord, 'video_completed');
        }
      }
    }
  }
}

function ensureVideoTask(config, runtime, taskRecord) {
  if (taskRecord.promise) return taskRecord.promise;
  taskRecord.promise = consumeVideoTask(config, runtime, taskRecord).catch(async (error) => {
    taskRecord.status = 'failed';
    taskRecord.message = String(error?.message || error || '视频任务失败');
    taskRecord.updatedAt = Date.now();
    await pushMediaResult(runtime, taskRecord, 'video_failed');
  });
  return taskRecord.promise;
}

async function startVideoTask(config, runtime, body, context = {}, meta = {}) {
  const { data, baseUrl } = await requestJsonWithFallback(config, {
    pathname: '/v1/public/video/start',
    options: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  });

  const taskId = String(data?.task_id || '').trim();
  const taskRecord = {
    taskId,
    status: 'queued',
    progress: 0,
    prompt: String(body.prompt || '').trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    baseUrl,
    mediaUrl: '',
    message: '视频任务已提交',
    transcript: '',
    source: String(meta.source || 'text').trim() || 'text',
    pushRoute: buildPushRoute(context),
    pushState: { success: false, failure: false },
    promise: null,
  };
  videoTasks.set(taskId, taskRecord);
  ensureVideoTask(config, runtime, taskRecord);

  return {
    status: taskRecord.status,
    provider: 'grok2api',
    action: String(meta.action || 'video').trim() || 'video',
    task_id: taskId,
    progress: taskRecord.progress,
    message: taskRecord.message,
    input_source: taskRecord.source,
    baseUrl,
    raw: data,
    ...(meta.extra && typeof meta.extra === 'object' ? meta.extra : {}),
  };
}

async function handleVideo(config, runtime, params, context = {}, sessionStore = null) {
  const imageInput = await resolveImageInput(params, context, sessionStore);
  if (!imageInput) {
    return {
      status: 'needs_image',
      provider: 'grok2api',
      action: 'video',
      message: '请发送一张图片，或传入 image_path / image_url 后再生成视频。',
    };
  }
  const aspectRatio = normalizeAspectRatio(params.aspect_ratio || params.ratio);
  const body = {
    prompt: String(params.prompt || '').trim(),
    aspect_ratio: aspectRatio,
    video_length: normalizeVideoLength(params.video_length),
    resolution_name: normalizeResolutionName(params.resolution_name),
    preset: normalizeVideoPreset(params.preset),
    image_url: imageInput.value,
    nsfw: normalizeNsfw(params.nsfw, true),
  };

  return startVideoTask(config, runtime, body, context, {
    source: imageInput.source,
    action: 'video',
  });
}

async function handleTextToVideo(config, runtime, params, context = {}) {
  const prompt = String(params.prompt || '').trim();
  if (!prompt) {
    return {
      status: 'missing_prompt',
      provider: 'grok2api',
      action: 'text_to_video',
      message: '请提供视频提示词后再生成视频。',
    };
  }
  const aspectRatio = normalizeAspectRatio(params.aspect_ratio || params.ratio);
  const body = {
    prompt,
    aspect_ratio: aspectRatio,
    video_length: normalizeVideoLength(params.video_length),
    resolution_name: normalizeResolutionName(params.resolution_name),
    preset: normalizeVideoPreset(params.preset),
    nsfw: normalizeNsfw(params.nsfw, true),
  };

  return startVideoTask(config, runtime, body, context, {
    source: 'text',
    action: 'text_to_video',
  });
}

async function handleTaskStatus(config, params) {
  const taskId = String(params.task_id || '').trim();
  if (!taskId) {
    return {
      status: 'missing_task',
      provider: 'grok2api',
      action: 'task_status',
      message: '请提供 task_id。',
    };
  }
  const taskRecord = videoTasks.get(taskId);
  if (!taskRecord) {
    return {
      status: 'not_found',
      provider: 'grok2api',
      action: 'task_status',
      task_id: taskId,
      message: '未找到该任务，可能已过期或不是由 grok-media 插件创建。',
    };
  }
  return {
    status: taskRecord.status,
    provider: 'grok2api',
    action: 'task_status',
    task_id: taskId,
    progress: taskRecord.progress,
    mediaUrl: taskRecord.mediaUrl || undefined,
    message: taskRecord.message,
    transcript: taskRecord.transcript || undefined,
  };
}

function register(api) {
  const config = withDefaults(api.pluginConfig || {});
  const editSessionStore = createEditSessionStore(config, api.source);

  api.registerHook('message:preprocessed', (event) => {
    const ctx = event?.context || {};
    const preferredMedia = pickPreferredIncomingMedia(ctx);
    if (preferredMedia?.mediaPath) {
      const recentRecord = {
        channelId: ctx.channelId,
        channel: ctx.channel,
        provider: ctx.provider,
        surface: ctx.surface,
        accountId: ctx.accountId,
        from: ctx.from,
        to: ctx.to,
        mediaPath: preferredMedia.mediaPath,
        mediaType: preferredMedia.mediaType,
        updatedAt: Date.now(),
      };
      rememberRecentMedia(recentRecord);
      void setStoredRecentMedia(editSessionStore, recentRecord).catch((error) => {
        api.logger?.warn?.(`[grok-media] failed to persist recent media: ${String(error)}`);
      });
    }
    const body = String(ctx.body || ctx.bodyForAgent || ctx.content || '').trim();
    const turnState = {
      channelId: ctx.channelId,
      channel: ctx.channel,
      provider: ctx.provider,
      surface: ctx.surface,
      accountId: ctx.accountId,
    };
    if (!body) {
      rememberSilentMediaTurn(turnState);
      api.logger?.warn?.(`[grok-media] silent-media remember channel=${String(ctx.channelId || ctx.provider || '')} account=${String(ctx.accountId || '')} keys=${makeSilentMediaTurnKeys(turnState).join(',')}`);
      return;
    }
    if (isBypassedMediaCommand(body)) {
      rememberMediaCommandTurn(turnState);
      api.logger?.warn?.(`[grok-media] media-command remember command=${extractSlashCommandName(body)} channel=${String(ctx.channelId || ctx.provider || '')} account=${String(ctx.accountId || '')} keys=${makeMediaCommandTurnKeys(turnState).join(',')}`);
    }
  }, { name: 'cache_recent_media' });


  api.on('before_prompt_build', (_event, hookCtx = {}) => {
    const prependLines = [
      'When the user asks to generate images, edit an uploaded image, create a video from an image, or create a video from text, prefer the grok_* media tools.',
      'For image editing or image-to-video, if the current conversation includes MediaPath or a recent uploaded image, pass that local path as image_path.',
      'If the user provides an image URL, pass it as image_url.',
      'Use grok_text_to_video for pure text-to-video requests that should not reuse the latest uploaded image. For slash commands, users can append --ratio, --len, --res, and --preset.',
      'Use grok_task_status when the user asks about a previous video task status.'
    ];
    const turnState = {
      channelId: hookCtx.channelId,
      channel: hookCtx.channelId,
      provider: hookCtx.messageProvider,
      surface: hookCtx.messageProvider,
      accountId: hookCtx.accountId,
    };
    const shouldSilenceBareMedia = consumeSilentMediaTurn(turnState);
    const shouldSilenceMediaCommand = consumeMediaCommandTurn(turnState);
    if (shouldSilenceBareMedia || shouldSilenceMediaCommand) {
      prependLines.unshift('If the latest user turn only uploaded media without any caption or instruction, do not reply. Output exactly [[silent]].');
    }
    return { prependContext: prependLines.join('\n') };
  });

  api.on('message_sending', (event = {}, hookCtx = {}) => {
    const state = {
      channelId: hookCtx.channelId,
      channel: event?.metadata?.channel,
      provider: hookCtx.channelId,
      accountId: hookCtx.accountId || event?.metadata?.accountId,
    };
    const mediaUrls = Array.isArray(event?.metadata?.mediaUrls) ? event.metadata.mediaUrls.filter(Boolean) : [];
    const pendingSilent = hasSilentMediaTurn(state);
    const pendingCommand = hasMediaCommandTurn(state);
    const pending = pendingSilent || pendingCommand;
    const known = isKnownGrokMediaReply(event?.content, mediaUrls);
    api.logger?.warn?.(`[grok-media] message_sending pending=${pending} known=${known} channel=${String(state.channelId || state.channel || '')} account=${String(state.accountId || '')} content=${JSON.stringify(String(event?.content || '').slice(0, 120))}`);
    if (!pending) return;
    if (known) return;
    clearSilentMediaTurn(state);
    clearMediaCommandTurn(state);
    api.logger?.warn?.('[grok-media] message_sending cancelled stray reply after silent-media turn');
    return { cancel: true };
  });


  api.registerTool({
    name: 'grok_imagine',
    label: 'Grok Imagine',
    description: 'Generate images with grok2api. Use for text-to-image requests.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        prompt: { type: 'string', description: 'Image prompt' },
        aspect_ratio: { type: 'string', enum: ['16:9', '9:16', '3:2', '2:3', '1:1'] },
        count: { type: 'number', description: 'Image count' },
      },
      required: ['prompt'],
    },
    async execute(_id, params) {
      return contentResult(await handleImagine(config, params));
    },
  });

  api.registerTool({
    name: 'grok_edit_image',
    label: 'Grok Edit Image',
    description: 'Edit an image with grok2api. Prefer image_path from current MediaPath or image_url.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        prompt: { type: 'string', description: 'Edit instruction' },
        image_path: { type: 'string', description: 'Local image path, often from current MediaPath' },
        image_url: { type: 'string', description: 'Remote image URL' },
      },
      required: ['prompt'],
    },
    async execute(_id, params) {
      return contentResult(await handleEdit(config, params, {}, editSessionStore));
    },
  });

  api.registerTool({
    name: 'grok_image_to_video',
    label: 'Grok Image To Video',
    description: 'Create a video from an image with grok2api. Prefer image_path from current MediaPath or image_url.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        prompt: { type: 'string', description: 'Video instruction' },
        image_path: { type: 'string', description: 'Local image path, often from current MediaPath' },
        image_url: { type: 'string', description: 'Remote image URL' },
        aspect_ratio: { type: 'string', enum: ['16:9', '9:16', '3:2', '2:3', '1:1'] },
        video_length: { type: 'number', description: 'Video seconds: 6, 10, or 15' },
      },
      required: ['prompt'],
    },
    async execute(_id, params) {
      return contentResult(await handleVideo(config, api.runtime, params, {}, editSessionStore));
    },
  });

  api.registerTool({
    name: 'grok_text_to_video',
    label: 'Grok Text To Video',
    description: 'Create a video from text with grok2api. Use this when the user wants a brand new video and should not reuse the latest image.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        prompt: { type: 'string', description: 'Video prompt' },
        aspect_ratio: { type: 'string', enum: ['16:9', '9:16', '3:2', '2:3', '1:1'] },
        video_length: { type: 'number', description: 'Video seconds: 6, 10, or 15' },
        resolution_name: { type: 'string', enum: ['480p', '720p'] },
        preset: { type: 'string', enum: ['fun', 'normal', 'spicy', 'custom'] },
      },
      required: ['prompt'],
    },
    async execute(_id, params) {
      return contentResult(await handleTextToVideo(config, api.runtime, params, {}));
    },
  });

  api.registerTool({
    name: 'grok_task_status',
    label: 'Grok Task Status',
    description: 'Check the status of a grok-media task by task_id.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        task_id: { type: 'string', description: 'Task id returned by grok_image_to_video, grok_text_to_video, /video, /textvideo, or /t2v' },
      },
      required: ['task_id'],
    },
    async execute(_id, params) {
      return contentResult(await handleTaskStatus(config, params));
    },
  });

  api.registerCommand({
    name: 'imagine',
    description: 'Free-generate or freely reimagine an image with grok2api',
    acceptsArgs: true,
    async handler(ctx) {
      const payload = await handleImagine(config, { prompt: ctx.args || ctx.commandBody || '' });
      return commandReplyFromPayload(payload);
    },
  });

  api.registerCommand({
    name: 'edit',
    description: 'Edit an uploaded image with grok2api',
    acceptsArgs: true,
    async handler(ctx) {
      try {
        const payload = await runCommandWithRetry('edit', () => handleEdit(config, { prompt: ctx.args || ctx.commandBody || '' }, ctx, editSessionStore), api.logger);
        return commandReplyFromPayload(payload);
      } catch (error) {
        return { text: `⚠️ 图片编辑失败：${formatCommandError(error)}` };
      }
    },
  });

  api.registerCommand({
    name: 'video',
    description: 'Create a video from an uploaded image with grok2api',
    acceptsArgs: true,
    async handler(ctx) {
      try {
        const params = parseVideoCommandInput(ctx.args, ctx.commandBody);
        if (params.errors?.length) {
          return { text: buildVideoCommandHelp('video', 'image', `参数有误：${params.errors.join('；')}`) };
        }
        const payload = await runCommandWithRetry('video', () => handleVideo(config, api.runtime, params, ctx, editSessionStore), api.logger);
        if (payload?.status === 'needs_image') {
          return { text: buildVideoCommandHelp('video', 'image', payload.message) };
        }
        return commandReplyFromPayload(payload);
      } catch (error) {
        return { text: `⚠️ 视频生成失败：${formatCommandError(error)}` };
      }
    },
  });

  api.registerCommand({
    name: 'textvideo',
    description: 'Create a brand new video from text with grok2api',
    acceptsArgs: true,
    async handler(ctx) {
      try {
        const params = parseVideoCommandInput(ctx.args, ctx.commandBody);
        if (!params.prompt) {
          return { text: buildVideoCommandHelp('textvideo', 'text') };
        }
        if (params.errors?.length) {
          return { text: buildVideoCommandHelp('textvideo', 'text', `参数有误：${params.errors.join('；')}`) };
        }
        const payload = await runCommandWithRetry('textvideo', () => handleTextToVideo(config, api.runtime, params, ctx), api.logger);
        if (payload?.status === 'missing_prompt') {
          return { text: buildVideoCommandHelp('textvideo', 'text', payload.message) };
        }
        return commandReplyFromPayload(payload);
      } catch (error) {
        return { text: `⚠️ 视频生成失败：${formatCommandError(error)}` };
      }
    },
  });

  api.registerCommand({
    name: 't2v',
    description: 'Compatibility alias for /textvideo',
    acceptsArgs: true,
    async handler(ctx) {
      try {
        const params = parseVideoCommandInput(ctx.args, ctx.commandBody);
        if (!params.prompt) {
          return { text: buildVideoCommandHelp('textvideo', 'text') };
        }
        if (params.errors?.length) {
          return { text: buildVideoCommandHelp('textvideo', 'text', `参数有误：${params.errors.join('；')}`) };
        }
        const payload = await runCommandWithRetry('t2v', () => handleTextToVideo(config, api.runtime, params, ctx), api.logger);
        if (payload?.status === 'missing_prompt') {
          return { text: buildVideoCommandHelp('textvideo', 'text', payload.message) };
        }
        return commandReplyFromPayload(payload);
      } catch (error) {
        return { text: `⚠️ 视频生成失败：${formatCommandError(error)}` };
      }
    },
  });

  api.registerCommand({
    name: 'task',
    description: 'Check a grok-media video task by task id',
    acceptsArgs: true,
    async handler(ctx) {
      const payload = await handleTaskStatus(config, { task_id: String(ctx.args || '').trim() });
      return commandReplyFromPayload(payload);
    },
  });
}

export const __testing = {
  withDefaults,
  makeSessionKey,
  resolveStateFilePath,
  buildRecentMediaLookupKeys,
  findRecentMedia,
  requestJsonWithFallback,
  resolveImageInput,
  handleImagine,
  handleEdit,
  handleVideo,
  handleTextToVideo,
  parseVideoCommandInput,
  buildVideoCommandHelp,
  handleTaskStatus,
  getStoredRecentMedia,
  setStoredRecentMedia,
  sortRecentMediaByFreshness,
  pickPreferredIncomingMedia,
  findLatestTelegramInboundImage,
  buildFaithfulEditPrompt,
  extractPreferredMediaUrl,
  recentMedia,
  videoTasks,
  pendingSilentMediaTurns,
  pendingMediaCommandTurns,
  hasSilentMediaTurn,
  clearSilentMediaTurn,
  hasMediaCommandTurn,
  clearMediaCommandTurn,
  isBypassedMediaCommand,
  isKnownGrokMediaReply,
};

export default register;
