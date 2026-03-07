import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { writeFile, mkdir, readFile, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePluginPath = path.join(here, 'index.ts');

async function importPlugin() {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'grok-media-plugin-'));
  const tempPluginPath = path.join(tempDir, 'index.mjs');
  await writeFile(tempPluginPath, await readFile(sourcePluginPath, 'utf8'));
  return import(`${pathToFileURL(tempPluginPath).href}?t=${Date.now()}`);
}

function createApi(configOverrides = {}) {
  const tools = [];
  const commands = [];
  const hooks = [];
  const pluginHooks = [];
  return {
    api: {
      id: 'grok-media',
      name: 'Grok Media',
      source: pathToFileURL(sourcePluginPath).href,
      pluginConfig: {
        baseUrlPrimary: 'http://primary.test',
        baseUrlFallback: 'http://fallback.test',
        timeoutMs: 1000,
        pollIntervalMs: 10,
        pollTimeoutMs: 500,
        ...configOverrides,
      },
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
    },
    tools,
    commands,
    hooks,
    pluginHooks,
  };
}

async function withServer(handler, run) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    return await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}

const deployScriptPath = path.join(here, 'deploy.sh');

test('deploy.sh dry-run prints upload, restart, and log steps', () => {
  const result = spawnSync('bash', [deployScriptPath, '--dry-run'], {
    cwd: here,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /extensions\/grok-media\/index\.ts/);
  assert.match(result.stdout, /extensions\/grok-media\/openclaw\.plugin\.json/);
  assert.match(result.stdout, /docker restart 1Panel-openclaw-HftU/);
  assert.match(result.stdout, /docker logs --since 20s 1Panel-openclaw-HftU/);
});

test('message hook prefers the last image path when multiple media paths exist', async () => {
  const mod = await importPlugin();
  const stateFilePath = `/tmp/openclaw-grok-media-fixtures/hook-last-path-${Date.now()}.json`;
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const firstPath = '/tmp/openclaw-grok-media-fixtures/hook-first.jpg';
  const lastPath = '/tmp/openclaw-grok-media-fixtures/hook-last.jpg';
  await writeFile(firstPath, Buffer.from('first-image'));
  await writeFile(lastPath, Buffer.from('last-image'));

  const { api, hooks } = createApi({ stateFilePath });
  await mod.default(api);
  mod.__testing.recentMedia.clear();

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      mediaPath: firstPath,
      mediaType: 'image/jpeg',
      mediaPaths: [firstPath, lastPath],
      mediaTypes: ['image/jpeg', 'image/jpeg'],
      body: '',
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 30));

  const cached = mod.__testing.findRecentMedia({
    channelId: 'telegram',
    accountId: 'default',
    from: 'telegram:8202841769',
  });
  const stored = JSON.parse(await readFile(stateFilePath, 'utf8'));
  assert.equal(cached.mediaPath, lastPath);
  assert.equal(stored.recentMediaEntries[0].mediaPath, lastPath);
});

test('message_sending cancels stray text reply after bare media-only turn', async () => {
  const mod = await importPlugin();
  const { api, hooks, pluginHooks } = createApi();
  await mod.default(api);

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  const messageSending = pluginHooks.find((entry) => entry.name === 'message_sending');

  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      body: '',
      mediaPath: '/tmp/openclaw-grok-media-fixtures/bare.jpg',
      mediaType: 'image/jpeg',
    },
  });

  const first = messageSending.handler({
    to: 'telegram:8202841769',
    content: '收到新图。我现在直接用这张开一个 6 秒动态视频。',
    metadata: { channel: 'telegram', accountId: 'default', mediaUrls: [] },
  }, { channelId: 'telegram', accountId: 'default' });

  const second = messageSending.handler({
    to: 'telegram:8202841769',
    content: '收到新图。我现在直接用这张开一个 6 秒动态视频。',
    metadata: { channel: 'telegram', accountId: 'default', mediaUrls: [] },
  }, { channelId: 'telegram', accountId: 'default' });

  assert.deepEqual(first, { cancel: true });
  assert.equal(second, undefined);
});

test('message_sending keeps pending suppression for known grok-media command replies', async () => {
  const mod = await importPlugin();
  const { api, hooks, pluginHooks } = createApi();
  await mod.default(api);

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  const messageSending = pluginHooks.find((entry) => entry.name === 'message_sending');

  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      body: '',
      mediaPath: '/tmp/openclaw-grok-media-fixtures/bare.jpg',
      mediaType: 'image/jpeg',
    },
  });

  const grokReply = messageSending.handler({
    to: 'telegram:8202841769',
    content: '请发送一张图片，或传入 image_path / image_url 后再编辑。',
    metadata: { channel: 'telegram', accountId: 'default', mediaUrls: [] },
  }, { channelId: 'telegram', accountId: 'default' });

  const stray = messageSending.handler({
    to: 'telegram:8202841769',
    content: '收到新图。我现在直接用这张开一个 6 秒动态视频。',
    metadata: { channel: 'telegram', accountId: 'default', mediaUrls: [] },
  }, { channelId: 'telegram', accountId: 'default' });

  assert.equal(grokReply, undefined);
  assert.deepEqual(stray, { cancel: true });
});

test('before_prompt_build silences bare media-only telegram turns once', async () => {
  const mod = await importPlugin();
  const { api, hooks, pluginHooks } = createApi();
  await mod.default(api);

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  const beforePromptBuild = pluginHooks.find((entry) => entry.name === 'before_prompt_build');

  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      body: '',
      bodyForAgent: '',
      mediaPath: '/tmp/openclaw-grok-media-fixtures/bare.jpg',
      mediaType: 'image/jpeg',
    },
  });

  const first = beforePromptBuild.handler({ prompt: 'ignored', messages: [] }, { channelId: 'telegram', messageProvider: 'telegram' });
  const second = beforePromptBuild.handler({ prompt: 'ignored', messages: [] }, { channelId: 'telegram', messageProvider: 'telegram' });

  assert.match(first.prependContext, /\[\[silent\]\]/);
  assert.doesNotMatch(second.prependContext, /\[\[silent\]\]/);
});


test('before_prompt_build silences grok-media slash commands once', async () => {
  const mod = await importPlugin();
  const { api, hooks, pluginHooks } = createApi();
  await mod.default(api);

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  const beforePromptBuild = pluginHooks.find((entry) => entry.name === 'before_prompt_build');

  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      body: '/imagine 电影感肖像',
      bodyForAgent: '/imagine 电影感肖像',
    },
  });

  const first = beforePromptBuild.handler({ prompt: 'ignored', messages: [] }, { channelId: 'telegram', accountId: 'default', messageProvider: 'telegram' });
  const second = beforePromptBuild.handler({ prompt: 'ignored', messages: [] }, { channelId: 'telegram', accountId: 'default', messageProvider: 'telegram' });

  assert.match(first.prependContext, /\[\[silent\]\]/);
  assert.doesNotMatch(second.prependContext, /\[\[silent\]\]/);
});

test('before_prompt_build does not silence non-media slash commands', async () => {
  const mod = await importPlugin();
  const { api, hooks, pluginHooks } = createApi();
  await mod.default(api);

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  const beforePromptBuild = pluginHooks.find((entry) => entry.name === 'before_prompt_build');

  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      body: '/task abc123',
      bodyForAgent: '/task abc123',
    },
  });

  const result = beforePromptBuild.handler({ prompt: 'ignored', messages: [] }, { channelId: 'telegram', accountId: 'default', messageProvider: 'telegram' });
  assert.doesNotMatch(result.prependContext, /\[\[silent\]\]/);
});

test('message_sending cancels stray text after media slash command turn but keeps known replies', async () => {
  const mod = await importPlugin();
  const { api, hooks, pluginHooks } = createApi();
  await mod.default(api);

  const preprocessed = hooks.find((entry) => entry.name === 'message:preprocessed');
  const messageSending = pluginHooks.find((entry) => entry.name === 'message_sending');

  preprocessed.handler({
    context: {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      body: '/textvideo 雨夜城市',
      bodyForAgent: '/textvideo 雨夜城市',
    },
  });

  const known = messageSending.handler({
    to: 'telegram:8202841769',
    content: '视频任务已提交',
    metadata: { channel: 'telegram', accountId: 'default', mediaUrls: [] },
  }, { channelId: 'telegram', accountId: 'default' });

  const stray = messageSending.handler({
    to: 'telegram:8202841769',
    content: '抱歉，这个请求我不能帮你生成。',
    metadata: { channel: 'telegram', accountId: 'default', mediaUrls: [] },
  }, { channelId: 'telegram', accountId: 'default' });

  assert.equal(known, undefined);
  assert.deepEqual(stray, { cancel: true });
});

test('plugin registers tools and commands', async () => {
  const mod = await importPlugin();
  const register = mod.default;
  assert.equal(typeof register, 'function');

  const { api, tools, commands, hooks, pluginHooks } = createApi();
  await register(api);

  assert.deepEqual(tools.map((t) => t.name), [
    'grok_imagine',
    'grok_edit_image',
    'grok_image_to_video',
    'grok_text_to_video',
    'grok_task_status',
  ]);
  assert.deepEqual(commands.map((c) => c.name), ['imagine', 'edit', 'video', 'textvideo', 't2v', 'task']);
  assert.ok(hooks.some((entry) => entry.name === 'message:preprocessed'));
  assert.ok(pluginHooks.some((entry) => entry.name === 'before_prompt_build'));
});

test('resolveStateFilePath uses writable workspace path for OpenClaw runtime', async () => {
  const mod = await importPlugin();
  assert.equal(
    mod.__testing.resolveStateFilePath({}, 'file:///home/node/.openclaw/extensions/grok-media/index.ts'),
    '/home/node/.openclaw/workspace/grok-media/state.json'
  );
});


test('parseVideoCommandInput supports Chinese alias options', async () => {
  const mod = await importPlugin();
  const parsed = mod.__testing.parseVideoCommandInput('城市夜景 --比例 16:9 --时长 10 --清晰度 720p --风格 spicy', '');
  assert.equal(parsed.prompt, '城市夜景');
  assert.equal(parsed.aspect_ratio, '16:9');
  assert.equal(parsed.video_length, 10);
  assert.equal(parsed.resolution_name, '720p');
  assert.equal(parsed.preset, 'spicy');
  assert.deepEqual(parsed.errors || [], []);
});

test('extractPreferredMediaUrl prefers mp4 source over poster image', async () => {
  const mod = await importPlugin();
  const html = '<video id=\"video\" controls preload=\"none\" poster=\"https://grok.uonoe.com/v1/files/image/demo.jpg\">\n  <source id=\"mp4\" src=\"https://grok.uonoe.com/v1/files/video/demo.mp4\" type=\"video/mp4\">\n</video>';
  assert.equal(typeof mod.__testing.extractPreferredMediaUrl, 'function');
  assert.equal(mod.__testing.extractPreferredMediaUrl(html), 'https://grok.uonoe.com/v1/files/video/demo.mp4');
});

test('grok_imagine falls back when primary returns 502', async () => {
  const mod = await importPlugin();
  await withServer((req, res) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad gateway' }));
  }, async (primaryUrl) => {
    await withServer((req, res) => {
      assert.equal(req.url, '/v1/images/generations');
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => {
        const parsed = JSON.parse(body);
        assert.equal(parsed.prompt, 'test prompt');
        assert.equal(parsed.nsfw, true);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ created: 1, data: [{ url: 'https://img.example/result.jpg' }] }));
      });
    }, async (fallbackUrl) => {
      const { api, tools } = createApi({ baseUrlPrimary: primaryUrl, baseUrlFallback: fallbackUrl });
      await mod.default(api);
      const tool = tools.find((entry) => entry.name === 'grok_imagine');
      const result = await tool.execute('1', { prompt: 'test prompt', aspect_ratio: '1:1' });
      assert.equal(result.details.status, 'completed');
      assert.equal(result.details.baseUrl, fallbackUrl);
      assert.deepEqual(result.details.mediaUrls, ['https://img.example/result.jpg']);
    });
  });
});

test('imagine command with uploaded image stays in imagine flow', async () => {
  const mod = await importPlugin();
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/imagine-switch.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));

  await withServer((req, res) => {
    assert.equal(req.url, '/v1/images/generations');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.equal(parsed.prompt, '换个动作');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ created: 1, data: [{ url: 'https://img.example/imagine-free.jpg' }] }));
    });
  }, async (baseUrl) => {
    const { api, commands, hooks } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl });
    await mod.default(api);

    const hook = hooks.find((entry) => entry.name === 'message:preprocessed');
    hook.handler({
      context: {
        channelId: 'telegram',
        from: 'user-3',
        to: 'bot-1',
        mediaPath: imgPath,
        mediaType: 'image/jpeg',
      },
    });

    const command = commands.find((entry) => entry.name === 'imagine');
    const reply = await command.handler({
      channel: 'telegram',
      from: 'user-3',
      to: 'bot-1',
      commandBody: '/imagine 换个动作',
      args: '换个动作',
      isAuthorizedSender: true,
      config: {},
    });

    assert.equal(reply.mediaUrl, 'https://img.example/imagine-free.jpg');
    assert.match(reply.text, /已生成 1 张图片/);
  });
});


test('edit command still finds recent uploaded image when runtime channelId is provider-scoped', async () => {
  const mod = await importPlugin();
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/provider-scoped.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));

  await withServer((req, res) => {
    assert.equal(req.url, '/v1/public/imagine/workbench/edit');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.match(parsed.prompt, /抬手/);
      assert.match(parsed.image_base64, /^data:image\/jpeg;base64,/);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ url: 'https://img.example/provider-scoped.jpg' }] }));
    });
  }, async (baseUrl) => {
    const { api, commands, hooks } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl });
    await mod.default(api);

    const hook = hooks.find((entry) => entry.name === 'message:preprocessed');
    hook.handler({
      context: {
        channelId: 'telegram:default',
        provider: 'telegram',
        from: 'telegram:user-9',
        to: 'telegram:bot',
        mediaPath: imgPath,
        mediaType: 'image/jpeg',
      },
    });

    const command = commands.find((entry) => entry.name === 'edit');
    const reply = await command.handler({
      channel: 'telegram',
      from: 'telegram:user-9',
      to: 'telegram:dm',
      commandBody: '/edit 抬手',
      args: '抬手',
      isAuthorizedSender: true,
      config: {},
    });

    assert.equal(reply.mediaUrl, 'https://img.example/provider-scoped.jpg');
    assert.match(reply.text, /保真编辑模式/);
  });
});

test('edit command still finds recent uploaded image when command target differs', async () => {
  const mod = await importPlugin();
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/relaxed-match.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));

  await withServer((req, res) => {
    assert.equal(req.url, '/v1/public/imagine/workbench/edit');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.match(parsed.prompt, /换个动作/);
      assert.match(parsed.image_base64, /^data:image\/jpeg;base64,/);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ url: 'https://img.example/relaxed-match.jpg' }] }));
    });
  }, async (baseUrl) => {
    const { api, commands, hooks } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl });
    await mod.default(api);

    const hook = hooks.find((entry) => entry.name === 'message:preprocessed');
    hook.handler({
      context: {
        channelId: 'telegram',
        from: 'user-5',
        to: 'bot-image',
        mediaPath: imgPath,
        mediaType: 'image/jpeg',
      },
    });

    const command = commands.find((entry) => entry.name === 'edit');
    const reply = await command.handler({
      channel: 'telegram',
      from: 'user-5',
      to: 'bot-command',
      commandBody: '/edit 换个动作',
      args: '换个动作',
      isAuthorizedSender: true,
      config: {},
    });

    assert.equal(reply.mediaUrl, 'https://img.example/relaxed-match.jpg');
    assert.match(reply.text, /保真编辑模式/);
  });
});

test('edit command reuses cached media path from message hook', async () => {
  const mod = await importPlugin();
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/input.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));

  await withServer((req, res) => {
    assert.equal(req.url, '/v1/public/imagine/workbench/edit');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.match(parsed.prompt, /replace background/);
      assert.match(parsed.prompt, /保留同一人物|保持同一人物/);
      assert.match(parsed.image_base64, /^data:image\/jpeg;base64,/);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ url: 'https://img.example/edited.jpg' }] }));
    });
  }, async (baseUrl) => {
    const { api, commands, hooks } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl });
    await mod.default(api);

    const hook = hooks.find((entry) => entry.name === 'message:preprocessed');
    hook.handler({
      context: {
        channelId: 'telegram',
        from: 'user-1',
        to: 'bot-1',
        mediaPath: imgPath,
        mediaType: 'image/jpeg',
      },
    });

    const command = commands.find((entry) => entry.name === 'edit');
    const reply = await command.handler({
      channel: 'telegram',
      from: 'user-1',
      to: 'bot-1',
      commandBody: '/edit replace background',
      args: 'replace background',
      isAuthorizedSender: true,
      config: {},
    });

    assert.equal(reply.mediaUrl, 'https://img.example/edited.jpg');
    assert.match(reply.text, /图片编辑完成/);
  });
});



test('edit command falls back to stored recent media when newer cached path is unreadable', async () => {
  const mod = await importPlugin();
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const newImgPath = '/tmp/openclaw-grok-media-fixtures/fallback-new.jpg';
  const missingPath = '/tmp/openclaw-grok-media-fixtures/missing-old.jpg';
  const stateFilePath = `/tmp/openclaw-grok-media-fixtures/recent-media-fallback-${Date.now()}.json`;
  await writeFile(newImgPath, Buffer.from('fresh-image-data'));

  mod.__testing.recentMedia.clear();
  mod.__testing.recentMedia.set('user:telegram::default::telegram:8202841769', {
    channelId: 'telegram:default',
    provider: 'telegram',
    accountId: 'default',
    from: 'telegram:8202841769',
    to: 'telegram:8202841769',
    mediaPath: missingPath,
    mediaType: 'image/jpeg',
    updatedAt: Date.now() + 60_000,
  });

  await writeFile(stateFilePath, JSON.stringify({
    version: 2,
    sessions: {},
    recentMediaEntries: [{
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      mediaPath: newImgPath,
      mediaType: 'image/jpeg',
      updatedAt: Date.now(),
    }],
  }, null, 2));

  let usedBase64 = '';
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => {
      const parsed = JSON.parse(options.body);
      usedBase64 = parsed.image_base64 || '';
      return {
        status: 200,
        async json() {
          return { data: [{ url: 'https://img.example/fallback-new.jpg' }] };
        },
      };
    };

    const reply = await mod.__testing.handleEdit({
      baseUrlPrimary: 'https://example.com',
      baseUrlFallback: 'https://example.com',
      timeoutMs: 1000,
      stateFilePath,
    }, {
      prompt: '抬手',
    }, {
      channel: 'telegram',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      accountId: 'default',
      commandBody: '/edit 抬手',
    }, {
      filePath: stateFilePath,
      loaded: false,
      sessions: {},
      recentMediaEntries: [],
    });

    const newBase64 = (await readFile(newImgPath)).toString('base64');
    assert.match(usedBase64, new RegExp(`${newBase64}$`));
    assert.equal(reply.mediaUrls[0], 'https://img.example/fallback-new.jpg');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('edit command prefers newer persisted recent media over stale in-memory cache', async () => {
  const mod = await importPlugin();
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const oldImgPath = '/tmp/openclaw-grok-media-fixtures/stale-cache-old.jpg';
  const newImgPath = '/tmp/openclaw-grok-media-fixtures/stale-cache-new.jpg';
  const stateFilePath = `/tmp/openclaw-grok-media-fixtures/recent-media-priority-${Date.now()}.json`;
  await writeFile(oldImgPath, Buffer.from('old-image-data'));
  await writeFile(newImgPath, Buffer.from('new-image-data'));

  mod.__testing.recentMedia.clear();
  mod.__testing.recentMedia.set(
    'user:telegram::default::telegram:8202841769',
    {
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      mediaPath: oldImgPath,
      mediaType: 'image/jpeg',
      updatedAt: Date.now() - 60_000,
    }
  );

  await writeFile(stateFilePath, JSON.stringify({
    version: 2,
    sessions: {},
    recentMediaEntries: [{
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      mediaPath: newImgPath,
      mediaType: 'image/jpeg',
      updatedAt: Date.now(),
    }],
  }, null, 2));

  let usedBase64 = '';
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, options) => {
      const parsed = JSON.parse(options.body);
      usedBase64 = parsed.image_base64 || '';
      return {
        status: 200,
        async json() {
          return { data: [{ url: 'https://img.example/prefer-new.jpg' }] };
        },
      };
    };

    const reply = await mod.__testing.handleEdit({
      baseUrlPrimary: 'https://example.com',
      baseUrlFallback: 'https://example.com',
      timeoutMs: 1000,
      stateFilePath,
    }, {
      prompt: '抬手',
    }, {
      channel: 'telegram',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      accountId: 'default',
      commandBody: '/edit 抬手',
    }, {
      filePath: stateFilePath,
      loaded: false,
      sessions: {},
      recentMediaEntries: [],
    });

    const newBase64 = (await readFile(newImgPath)).toString('base64');
    assert.match(usedBase64, new RegExp(`${newBase64}$`));
    assert.equal(reply.mediaUrls[0], 'https://img.example/prefer-new.jpg');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('edit command can reuse persisted recent media from state file', async () => {
  const mod = await importPlugin();
  const stateFilePath = `/tmp/openclaw-grok-media-fixtures/recent-media-${Date.now()}.json`;
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/persisted-recent.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));
  await writeFile(stateFilePath, JSON.stringify({
    version: 2,
    sessions: {},
    recentMediaEntries: [{
      channelId: 'telegram:default',
      provider: 'telegram',
      accountId: 'default',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      mediaPath: imgPath,
      mediaType: 'image/jpeg',
      updatedAt: Date.now(),
    }],
  }, null, 2));

  await withServer((req, res) => {
    assert.equal(req.url, '/v1/public/imagine/workbench/edit');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.match(parsed.prompt, /抬手/);
      assert.match(parsed.image_base64, /^data:image\/jpeg;base64,/);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ url: 'https://img.example/persisted-recent.jpg' }] }));
    });
  }, async (baseUrl) => {
    const { api, commands } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl, stateFilePath });
    await mod.default(api);

    const command = commands.find((entry) => entry.name === 'edit');
    const reply = await command.handler({
      channel: 'slack',
      provider: 'slack',
      from: 'telegram:8202841769',
      to: 'telegram:8202841769',
      accountId: 'default',
      commandBody: '/edit 抬手',
      args: '抬手',
      isAuthorizedSender: true,
      config: {},
    });

    assert.equal(reply.mediaUrl, 'https://img.example/persisted-recent.jpg');
    assert.match(reply.text, /保真编辑模式/);
  });
});

test('edit command persists session context across plugin reloads', async () => {
  const stateFilePath = `/tmp/openclaw-grok-media-fixtures/edit-session-${Date.now()}.json`;
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/persisted-edit.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));

  let requestCount = 0;
  await withServer((req, res) => {
    assert.equal(req.url, '/v1/public/imagine/workbench/edit');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      requestCount += 1;
      const parsed = JSON.parse(body);
      if (requestCount === 1) {
        assert.match(parsed.prompt, /换个动作/);
        assert.match(parsed.prompt, /保持同一人物/);
        assert.match(parsed.image_base64, /^data:image\/jpeg;base64,/);
        assert.equal(parsed.parent_post_id, undefined);
        assert.equal(parsed.source_image_url, undefined);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          data: [{ url: 'https://img.example/edit-1.jpg' }],
          current_parent_post_id: 'parent-1',
          current_source_image_url: 'https://img.example/source-1.jpg',
        }));
        return;
      }

      assert.match(parsed.prompt, /再抬手一点/);
      assert.match(parsed.prompt, /保持同一人物/);
      assert.equal(parsed.parent_post_id, 'parent-1');
      assert.equal(parsed.source_image_url, 'https://img.example/source-1.jpg');
      assert.equal(parsed.image_base64, undefined);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        data: [{ url: 'https://img.example/edit-2.jpg' }],
        current_parent_post_id: 'parent-2',
        current_source_image_url: 'https://img.example/source-2.jpg',
      }));
    });
  }, async (baseUrl) => {
    const mod1 = await importPlugin();
    const first = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl, stateFilePath });
    await mod1.default(first.api);

    const firstHook = first.hooks.find((entry) => entry.name === 'message:preprocessed');
    firstHook.handler({
      context: {
        channelId: 'telegram',
        from: 'user-4',
        to: 'bot-1',
        mediaPath: imgPath,
        mediaType: 'image/jpeg',
      },
    });

    const firstCommand = first.commands.find((entry) => entry.name === 'edit');
    const firstReply = await firstCommand.handler({
      channel: 'slack',
      provider: 'slack',
      from: 'user-4',
      to: 'bot-1',
      commandBody: '/edit 换个动作',
      args: '换个动作',
      isAuthorizedSender: true,
      config: {},
    });
    assert.equal(firstReply.mediaUrl, 'https://img.example/edit-1.jpg');

    const mod2 = await importPlugin();
    const second = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl, stateFilePath });
    await mod2.default(second.api);

    const secondCommand = second.commands.find((entry) => entry.name === 'edit');
    const secondReply = await secondCommand.handler({
      channel: 'slack',
      provider: 'slack',
      from: 'user-4',
      to: 'bot-1',
      commandBody: '/edit 再抬手一点',
      args: '再抬手一点',
      isAuthorizedSender: true,
      config: {},
    });
    assert.equal(secondReply.mediaUrl, 'https://img.example/edit-2.jpg');
  });
});

test('video command parses inline options and proactively pushes result to telegram when task completes', async () => {
  const mod = await importPlugin();
  const sent = [];
  await mkdir('/tmp/openclaw-grok-media-fixtures', { recursive: true });
  const imgPath = '/tmp/openclaw-grok-media-fixtures/video-input.jpg';
  await writeFile(imgPath, Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', 'base64'));

  let sseHit = false;
  await withServer((req, res) => {
    if (req.url === '/v1/public/video/start') {
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => {
        const parsed = JSON.parse(body);
        assert.equal(parsed.prompt, 'make it move');
        assert.equal(parsed.aspect_ratio, '9:16');
        assert.equal(parsed.video_length, 10);
        assert.equal(parsed.resolution_name, '720p');
        assert.equal(parsed.preset, 'fun');
        assert.equal(parsed.nsfw, true);
        assert.match(parsed.image_url, /^data:image\/jpeg;base64,/);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ task_id: 'task-123' }));
      });
      return;
    }
    if (req.url === '/v1/public/video/sse?task_id=task-123') {
      sseHit = true;
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write('data: {"choices":[{"delta":{"content":"正在生成视频中，当前进度100%\n"}}]}\n\n');
      res.write('data: {"choices":[{"delta":{"content":"https://grok.uonoe.com/v1/files/video/demo.mp4"}}]}\n\n');
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
    res.writeHead(404);
    res.end();
  }, async (baseUrl) => {
    const { api, commands, hooks } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl, pollTimeoutMs: 1000 });
    api.runtime.channel.telegram.sendMessageTelegram = async (...args) => { sent.push(args); return { messageId: '1', chatId: String(args[0]) }; };
    await mod.default(api);

    const hook = hooks.find((entry) => entry.name === 'message:preprocessed');
    hook.handler({
      context: {
        channelId: 'telegram',
        from: 'user-2',
        to: 'bot-1',
        mediaPath: imgPath,
        mediaType: 'image/jpeg',
      },
    });

    const command = commands.find((entry) => entry.name === 'video');
    const reply = await command.handler({
      channel: 'telegram',
      senderId: '8202841769',
      from: 'user-2',
      to: 'bot-1',
      commandBody: '/video make it move --ratio 9:16 --len 10 --res 720p --preset fun',
      args: 'make it move --ratio 9:16 --len 10 --res 720p --preset fun',
      isAuthorizedSender: true,
      config: {},
    });

    assert.equal(reply.text.includes('视频任务已提交'), true);
    await new Promise((resolve) => setTimeout(resolve, 220));
    assert.equal(sseHit, true);
    assert.equal(sent.length, 1);
    assert.equal(sent[0][0], '8202841769');
    assert.match(sent[0][1], /视频生成完成/);
    assert.match(sent[0][1], /任务: task-123/);
    assert.match(sent[0][1], /提示词: make it move/);
    assert.equal(sent[0][2].mediaUrl, 'https://grok.uonoe.com/v1/files/video/demo.mp4');
  });
});


test('textvideo command parses inline options for pure text-to-video and t2v remains a compatibility alias', async () => {
  const mod = await importPlugin();
  const requests = [];

  await withServer((req, res) => {
    if (req.url === '/v1/public/video/start') {
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => {
        const parsed = JSON.parse(body);
        requests.push(parsed);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ task_id: `task-${requests.length}` }));
      });
      return;
    }
    if (req.url === '/v1/public/video/sse?task_id=task-1' || req.url === '/v1/public/video/sse?task_id=task-2') {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write(`data: {"choices":[{"delta":{"content":"正在生成视频中，当前进度100%\n"}}]}\n\n`);
      res.write(`data: {"choices":[{"delta":{"content":"https://grok.uonoe.com/v1/files/video/t2v.mp4"}}]}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }
    res.writeHead(404);
    res.end();
  }, async (baseUrl) => {
    const { api, commands } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl, pollTimeoutMs: 1000 });
    await mod.default(api);

    const textvideo = commands.find((entry) => entry.name === 'textvideo');
    const alias = commands.find((entry) => entry.name === 't2v');
    assert.ok(textvideo);
    assert.ok(alias);

    const reply = await textvideo.handler({
      channel: 'telegram',
      senderId: '8202841769',
      from: 'user-textvideo',
      to: 'bot-1',
      commandBody: '/textvideo 一只猫在月球上散步 --ratio 16:9 --len 10 --res 720p --preset spicy',
      args: '一只猫在月球上散步 --ratio 16:9 --len 10 --res 720p --preset spicy',
      isAuthorizedSender: true,
      config: {},
    });
    assert.match(reply.text, /视频任务已提交/);

    const aliasReply = await alias.handler({
      channel: 'telegram',
      senderId: '8202841769',
      from: 'user-t2v',
      to: 'bot-1',
      commandBody: '/t2v 雨夜城市',
      args: '雨夜城市',
      isAuthorizedSender: true,
      config: {},
    });
    assert.match(aliasReply.text, /视频任务已提交/);

    await new Promise((resolve) => setTimeout(resolve, 220));
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0], {
      prompt: '一只猫在月球上散步',
      aspect_ratio: '16:9',
      video_length: 10,
      resolution_name: '720p',
      preset: 'spicy',
      nsfw: true,
    });
    assert.deepEqual(requests[1], {
      prompt: '雨夜城市',
      aspect_ratio: '1:1',
      video_length: 6,
      resolution_name: '480p',
      preset: 'normal',
      nsfw: true,
    });
  });
});


test('textvideo command returns friendly help for missing prompt or invalid options', async () => {
  const mod = await importPlugin();
  const { api, commands } = createApi();
  await mod.default(api);

  const textvideo = commands.find((entry) => entry.name === 'textvideo');

  const missingPromptReply = await textvideo.handler({
    channel: 'telegram',
    senderId: '8202841769',
    from: 'user-help-1',
    to: 'bot-1',
    commandBody: '/textvideo --比例 16:9 --时长 10',
    args: '--比例 16:9 --时长 10',
    isAuthorizedSender: true,
    config: {},
  });
  assert.match(missingPromptReply.text, /请先提供视频提示词/);
  assert.match(missingPromptReply.text, /\/textvideo 赛博朋克城市/);
  assert.match(missingPromptReply.text, /--比例/);
  assert.match(missingPromptReply.text, /--时长/);

  const invalidReply = await textvideo.handler({
    channel: 'telegram',
    senderId: '8202841769',
    from: 'user-help-2',
    to: 'bot-1',
    commandBody: '/textvideo 城市夜景 --比例 4:3 --时长 8',
    args: '城市夜景 --比例 4:3 --时长 8',
    isAuthorizedSender: true,
    config: {},
  });
  assert.match(invalidReply.text, /参数有误/);
  assert.match(invalidReply.text, /16:9/);
  assert.match(invalidReply.text, /6\/10\/15/);
});


test('grok_imagine allows explicit nsfw false override', async () => {
  const mod = await importPlugin();
  await withServer((req, res) => {
    assert.equal(req.url, '/v1/images/generations');
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.equal(parsed.prompt, 'safe prompt');
      assert.equal(parsed.nsfw, false);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ created: 1, data: [{ url: 'https://img.example/safe.jpg' }] }));
    });
  }, async (baseUrl) => {
    const { api, tools } = createApi({ baseUrlPrimary: baseUrl, baseUrlFallback: baseUrl });
    await mod.default(api);
    const tool = tools.find((entry) => entry.name === 'grok_imagine');
    const result = await tool.execute('2', { prompt: 'safe prompt', nsfw: false });
    assert.equal(result.details.status, 'completed');
    assert.deepEqual(result.details.mediaUrls, ['https://img.example/safe.jpg']);
  });
});
