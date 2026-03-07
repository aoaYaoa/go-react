import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const runId = `imagine-image-verify-${Date.now()}`;
const cfgPath = '/opt/1panel/apps/openclaw/openclaw/data/conf/openclaw.json';
const pluginSrc = '/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts';
const cfgRaw = JSON.parse(await readFile(cfgPath, 'utf8'));
const botToken = cfgRaw?.channels?.telegram?.botToken;
const chatId = String(cfgRaw?.channels?.telegram?.allowFrom?.[0] || '8202841769');
if (!botToken) throw new Error('telegram botToken missing');

await mkdir('/tmp/openclaw-grok-verify', { recursive: true });
const pluginTmp = `/tmp/openclaw-grok-verify/imagine-plugin-${Date.now()}.mjs`;
await writeFile(pluginTmp, await readFile(pluginSrc, 'utf8'));
const mod = await import(pathToFileURL(pluginTmp).href);

const tools = [];
const commands = [];
const hooks = [];
const pluginHooks = [];
const api = {
  id: 'grok-media',
  name: 'Grok Media',
  source: pathToFileURL(pluginTmp).href,
  pluginConfig: cfgRaw?.plugins?.entries?.['grok-media']?.config || {},
  logger: console,
  runtime: { channel: { telegram: { sendMessageTelegram: async (...args) => ({ args }) } } },
  config: {},
  registerTool(tool) { tools.push(tool); },
  registerCommand(command) { commands.push(command); },
  registerHook(name, handler) { hooks.push({ name, handler }); },
  resolvePath(input) { return input; },
  on(name, handler) { pluginHooks.push({ name, handler }); },
  registerHttpRoute() {},
  registerChannel() {},
  registerGatewayMethod() {},
  registerCli() {},
  registerService() {},
  registerProvider() {},
};
await mod.default(api);

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

const sourceImageUrl = `https://picsum.photos/seed/${encodeURIComponent(runId)}/768/1024.jpg`;
const sourceImageRes = await fetch(sourceImageUrl, { redirect: 'follow' });
if (!sourceImageRes.ok) throw new Error(`download source image failed: ${sourceImageRes.status}`);
const sourceImageBuf = Buffer.from(await sourceImageRes.arrayBuffer());
const sourceImagePath = `/tmp/openclaw-grok-verify/${runId}.jpg`;
await writeFile(sourceImagePath, sourceImageBuf);

console.log(JSON.stringify({
  stage: 'start',
  runId,
  chatId,
  sourceImageUrl,
  sourceImagePath,
  bytes: sourceImageBuf.length,
}, null, 2));

const preprocessedHook = hooks.find((entry) => entry.name === 'message:preprocessed');
if (!preprocessedHook) throw new Error('message:preprocessed hook not found');
preprocessedHook.handler({
  context: {
    channelId: 'telegram',
    from: chatId,
    to: 'bot',
    mediaPath: sourceImagePath,
    mediaType: 'image/jpeg',
  },
});

const imagineCommand = commands.find((entry) => entry.name === 'imagine');
if (!imagineCommand) throw new Error('imagine command not found');
const reply = await imagineCommand.handler({
  channel: 'telegram',
  senderId: chatId,
  from: chatId,
  to: 'bot',
  commandBody: '/imagine 换个动作',
  args: '换个动作',
  isAuthorizedSender: true,
  config: {},
});

console.log(JSON.stringify({ stage: 'command-reply', reply }, null, 2));

const mediaUrl = reply?.mediaUrl || (Array.isArray(reply?.mediaUrls) ? reply.mediaUrls[0] : '');
const text = [
  '带图 /imagine 验证完成',
  `原图: ${sourceImageUrl}`,
  `命令: /imagine 换个动作`,
  `返回文本: ${reply?.text || ''}`,
].join('\n');

let telegramResult;
if (mediaUrl) {
  try {
    telegramResult = await telegramCall('sendPhoto', {
      chat_id: chatId,
      photo: mediaUrl,
      caption: text,
    });
  } catch (error) {
    telegramResult = await telegramCall('sendMessage', {
      chat_id: chatId,
      text: `${text}\n结果: ${mediaUrl}\n发送图片失败，已退回文本。原因: ${String(error?.message || error)}`,
      disable_web_page_preview: false,
    });
  }
} else {
  telegramResult = await telegramCall('sendMessage', {
    chat_id: chatId,
    text,
    disable_web_page_preview: false,
  });
}

console.log(JSON.stringify({ stage: 'telegram-result', mediaUrl, telegramResult }, null, 2));
