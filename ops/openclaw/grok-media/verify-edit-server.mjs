import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const runId = `edit-verify-${Date.now()}`;
const cfgPath = '/opt/1panel/apps/openclaw/openclaw/data/conf/openclaw.json';
const pluginSrc = '/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts';
const cfgRaw = JSON.parse(await readFile(cfgPath, 'utf8'));
const grokCfg = cfgRaw?.plugins?.entries?.['grok-media']?.config || {};
const botToken = cfgRaw?.channels?.telegram?.botToken;
const chatId = String(cfgRaw?.channels?.telegram?.allowFrom?.[0] || '8202841769');
if (!botToken) throw new Error('telegram botToken missing');

await mkdir('/tmp/openclaw-grok-verify', { recursive: true });
const pluginTmp = `/tmp/openclaw-grok-verify/edit-plugin-${Date.now()}.mjs`;
await writeFile(pluginTmp, await readFile(pluginSrc, 'utf8'));
const mod = await import(pathToFileURL(pluginTmp).href);

async function telegramCall(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    throw new Error(`telegram ${method} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function sendEditResult(target, text, mediaUrl) {
  if (mediaUrl) {
    try {
      return await telegramCall('sendPhoto', {
        chat_id: target,
        photo: mediaUrl,
        caption: text,
      });
    } catch (error) {
      console.log(JSON.stringify({ stage: 'telegram-photo-fallback', error: String(error?.message || error) }));
    }
  }
  return telegramCall('sendMessage', {
    chat_id: target,
    text: mediaUrl ? `${text}\n${mediaUrl}` : text,
    disable_web_page_preview: false,
  });
}

const sourceImageUrl = `https://picsum.photos/seed/${encodeURIComponent(runId)}/768/768.jpg`;
const prompt = `把图片改成明亮插画风，保留主体结构，用于 OpenClaw grok-media /edit 验证 ${runId}`;

console.log(JSON.stringify({
  stage: 'start',
  runId,
  chatId,
  sourceImageUrl,
  prompt,
  grokCfg,
}, null, 2));

const result = await mod.__testing.handleEdit(
  grokCfg,
  {
    prompt,
    image_url: sourceImageUrl,
  },
  {
    channel: 'telegram',
    senderId: chatId,
    from: chatId,
    to: 'bot',
  },
);

console.log(JSON.stringify({ stage: 'edit-result', result }, null, 2));

const mediaUrls = Array.isArray(result?.mediaUrls) ? result.mediaUrls.filter(Boolean) : [];
const mediaUrl = mediaUrls[0] || '';
const text = [
  '图片编辑完成',
  `来源: ${sourceImageUrl}`,
  `提示词: ${prompt}`,
  result?.message ? `状态: ${result.message}` : '',
].filter(Boolean).join('\n');

const telegramResult = await sendEditResult(chatId, text, mediaUrl);
console.log(JSON.stringify({ stage: 'telegram-result', mediaUrl, telegramResult }, null, 2));
