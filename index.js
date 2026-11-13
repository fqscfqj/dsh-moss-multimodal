import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { AsyncLocalStorage } from 'node:async_hooks'
import { createHash } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { FEATURE_DEFAULTS, TOOL_FEATURES, normalizeFeatures, requireFeature, requireAsyncSupport } from './features.js'
import { createAssetLibrary } from './assets.js'
import { MODEL_IDS, validateImage, validateSpeech, validateDesign, validateDialogue, validateUnderstanding, validateTranscription, validateUpload, validateClone } from './moss-api.js'

const operationScope = new AsyncLocalStorage()

const DEFAULT_BASE_URL = 'https://api.mosi.cn'
const DEFAULT_CREDENTIAL_KEY = 'MOSS_API_KEY'
const DEFAULTS = {
    baseUrl: DEFAULT_BASE_URL,
    credentialKey: DEFAULT_CREDENTIAL_KEY,
    timeoutMs: 900000,
    imageModel: 'moss-image-sft-1.0',
    speechModel: 'moss-tts-1.5-flash',
    voiceModel: 'moss-voice-generator-1.0',
    vlModel: 'moss-vl-1.0',
    dialogueModel: 'moss-ttsd-1.0',
    transcriptionModel: 'moss-transcribe-1.0',
    imageSize: '1024x1024',
    imagePromptEnhance: false,
    imageWatermark: true,
    audioFormat: 'mp3',
    pollIntervalMs: 2000,
    features: FEATURE_DEFAULTS,
}

export const inject = ['tools']
export const Config = Schema.object({
    baseUrl: Schema.string().default(DEFAULTS.baseUrl).description('MOSS API base URL。'),
    credentialKey: Schema.string().default(DEFAULTS.credentialKey).description('DSH 凭据服务中的 API Key 键名。'),
    timeoutMs: Schema.natural().default(DEFAULTS.timeoutMs).description('单次 MOSS 请求超时（毫秒）。'),
    imageModel: Schema.string().default(DEFAULTS.imageModel).description('默认图像模型。'),
    speechModel: Schema.string().default(DEFAULTS.speechModel).description('默认单人语音模型。'),
    voiceModel: Schema.string().default(DEFAULTS.voiceModel).description('默认音色设计模型。'),
    vlModel: Schema.string().default(DEFAULTS.vlModel).description('默认 MOSS-VL 模型。'),
    dialogueModel: Schema.string().default(DEFAULTS.dialogueModel).description('默认多人语音模型。'),
    transcriptionModel: Schema.string().default(DEFAULTS.transcriptionModel).description('默认音频转写模型。'),
    imageSize: Schema.string().default(DEFAULTS.imageSize).description('默认图像尺寸。'),
    imagePromptEnhance: Schema.boolean().default(DEFAULTS.imagePromptEnhance).description('图像生成是否默认增强提示词。'),
    imageWatermark: Schema.boolean().default(DEFAULTS.imageWatermark).description('图像是否默认保留可见水印。'),
    audioFormat: Schema.string().default(DEFAULTS.audioFormat).description('默认音频格式。'),
    features: Schema.object(Object.fromEntries(Object.keys(FEATURE_DEFAULTS).map((key) => [key, Schema.boolean().default(true)]))).default({ ...FEATURE_DEFAULTS }).description('MOSS 功能开关，同时控制工作台和 Agent 工具。'),
    pollIntervalMs: Schema.natural().default(DEFAULTS.pollIntervalMs).description('异步任务轮询间隔。'),
})

const plain = (value) => value && typeof value.get === 'function' ? value.get() : value
const safeText = (value, fallback = '') => typeof value === 'string' ? value.trim() : fallback

function readOptions(config) {
    const value = {}
    for (const key of Object.keys(DEFAULTS)) value[key] = plain(config?.[key]) ?? DEFAULTS[key]
    value.features = normalizeFeatures(value.features)
    value.baseUrl = String(value.baseUrl).replace(/\/+$/u, '')
    value.timeoutMs = Math.max(1000, Number(value.timeoutMs) || DEFAULTS.timeoutMs)
    value.pollIntervalMs = Math.max(500, Number(value.pollIntervalMs) || DEFAULTS.pollIntervalMs)
    return value
}

function configRevision(value) {
    return createHash('sha256').update(JSON.stringify(readOptions(value))).digest('hex').slice(0, 24)
}

function validateConfig(value) {
    for (const [key, min, max] of [['timeoutMs', 1000, 3600000], ['pollIntervalMs', 500, 60000]]) {
        const field = plain(value[key]) ?? DEFAULTS[key]
        if (!Number.isSafeInteger(field) || field < min || field > max) throw Object.assign(new Error(`${key} 必须是 ${min}–${max} 范围内的整数。`), { status: 400 })
    }
    const current = readOptions(value)
    const url = new URL(current.baseUrl)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw Object.assign(new Error('API 地址必须是无凭据、无 query/hash 的 HTTP(S) URL。'), { status: 400 })
    if (current.timeoutMs < 1000 || current.timeoutMs > 3600000 || current.pollIntervalMs < 500 || current.pollIntervalMs > 60000) throw Object.assign(new Error('超时需为 1000–3600000 毫秒，轮询间隔需为 500–60000 毫秒。'), { status: 400 })
    validateImage({ prompt: 'validation' }, current)
    validateSpeech({ input: 'validation', voice_id: 'validation' }, current)
    validateDesign({ input: 'validation', instruction: 'validation' }, current)
    validateDialogue({ speakers: [{ id: 'a', voice_id: 'a' }], segments: [{ speaker: 'a', text: 'validation' }] }, current)
    validateTranscription({ file_id: 'validation' }, current)
    validateUnderstanding({ instruction: 'validation', image_file_ids: ['validation'] }, current)
    return current
}

function errorText(status, payload) {
    const detail = payload?.error?.message ?? payload?.message ?? payload?.error ?? ''
    const code = payload?.error?.code ?? payload?.code ?? ''
    return [`MOSS 请求失败（HTTP ${status}${code ? ` · ${code}` : ''}）`, detail].filter(Boolean).join('：')
}

function apiError(status, payload) {
    const error = new Error(errorText(status, payload))
    error.status = status
    error.code = payload?.error?.code ?? payload?.code ?? `http_${status}`
    error.payload = payload
    return error
}

async function getKey(ctx, options) {
    const credentials = ctx.get('credentials')
    if (!credentials) return undefined
    const record = await credentials.readRecord?.('dsh-moss-multimodal/api-key')
    if (record?.kind === 'api-key' && record.key) return record.key
    if (!credentials.resolve) return undefined
    const resolved = await credentials.resolve(options.credentialKey)
    const value = typeof resolved === 'string' ? resolved : resolved?.value
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function keyHint(key) {
    return key ? `${key.slice(0, 4)}…${key.length} 位` : ''
}

async function mossFetch(ctx, options, path, init = {}) {
    const key = await getKey(ctx, options)
    if (!key) {
        const error = new Error(`还没有配置 MOSS API Key（凭据键名：${options.credentialKey}）。`)
        error.code = 'missing_api_key'
        throw error
    }
    const headers = new Headers(init.headers || {})
    headers.set('Authorization', `Bearer ${key}`)
    if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) headers.set('Content-Type', 'application/json')
    const response = await fetch(`${options.baseUrl}${path}`, {
        ...init,
        headers,
        signal: AbortSignal.any([init.signal, options.signal, operationScope.getStore(), AbortSignal.timeout(options.timeoutMs)].filter(Boolean)),
        redirect: 'error',
    })
    return response
}

async function jsonResponse(response) {
    const text = await response.text()
    let payload
    try { payload = text ? JSON.parse(text) : {} } catch { payload = { message: text.slice(0, 500) } }
    if (!response.ok) throw apiError(response.status, payload)
    return payload
}

async function callJson(ctx, options, path, body) {
    const response = await mossFetch(ctx, options, path, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    })
    return jsonResponse(response)
}

async function pollTask(ctx, options, taskId, retryAfter = 0) {
    if (!taskId) throw new Error('Missing MOSS task ID')
    const signal = AbortSignal.any([options.signal, operationScope.getStore(), AbortSignal.timeout(options.timeoutMs)].filter(Boolean))
    let latest
    let failures = 0
    let waitMs = Math.min(60000, Math.max(0, Number(retryAfter) * 1000 || 0))
    try {
        while (!signal.aborted) {
            if (waitMs) await delay(waitMs, undefined, { signal })
            let response
            try {
                response = await mossFetch(ctx, options, `/v1/audio/tasks/${encodeURIComponent(taskId)}`, { headers: { Accept: 'application/json' }, signal })
            } catch (error) {
                if (signal.aborted || ++failures > 4) throw error
                waitMs = Math.min(30000, options.pollIntervalMs * 2 ** failures)
                continue
            }
            if ((response.status === 429 || response.status >= 500) && ++failures <= 4) {
                const seconds = Number(response.headers.get('retry-after'))
                waitMs = Math.min(60000, Math.max(options.pollIntervalMs, Number.isFinite(seconds) ? seconds * 1000 : options.pollIntervalMs * 2 ** failures))
                await response.body?.cancel()
                continue
            }
            latest = await jsonResponse(response)
            checkTaskFailure(latest)
            if (String(latest.status || '').toUpperCase() === 'SUCCESS') return { ...latest, task_id: taskId }
            failures = 0
            waitMs = Math.max(options.pollIntervalMs, Math.min(60000, Number(latest.retry_after) * 1000 || 0))
        }
        signal.throwIfAborted()
    } catch (cause) {
        const error = new Error(`任务 ${taskId}：${cause.message}。可在任务查询中继续查看，请勿直接重复提交。`, { cause })
        error.code = cause.code || 'task_state_unknown'
        error.task_id = taskId
        error.task = latest
        throw error
    }
}

function taskIdOf(payload) { return payload?.task_id || payload?.taskId || payload?.id }
function audioUrlOf(payload) { return typeof payload?.url === 'string' ? payload.url : undefined }
function imageUrlOf(payload) { return typeof payload?.data?.[0]?.url === 'string' ? payload.data[0].url : undefined }

async function attachImage(ctx, options, url, name = 'moss-image.png') {
    const attachments = ctx.get('attachments')
    if (!attachments?.saveImage) return undefined
    try {
        const response = await fetch(url, { signal: AbortSignal.any([options.signal, operationScope.getStore(), AbortSignal.timeout(30000)].filter(Boolean)), redirect: 'error' })
        if (!response.ok || Number(response.headers.get('content-length') || 0) > 20 * 1024 * 1024) { await response.body?.cancel(); return undefined }
        const chunks = []
        let bytes = 0
        for await (const chunk of response.body) {
            bytes += chunk.length
            if (bytes > 20 * 1024 * 1024) throw new Error('Image download too large')
            chunks.push(chunk)
        }
        return await attachments.saveImage({ data: Buffer.concat(chunks), mediaType: 'image/png', name })
    } catch { return undefined }
}

async function remember(options, operation, input, result) {
    if (!options.features.assets) return result
    try { await options.assets.record(operation, input, result) }
    catch (error) {
        options.log?.warn('MOSS asset indexing failed: %s', error.message)
        return { ...result, assetWarning: '本次结果已返回，但本地资产记录保存失败；请保留结果链接，不要重复提交生成。' }
    }
    return result
}

async function generateImage(ctx, options, input, withAttachment = false) {
    requireFeature(options, 'image')
    const body = validateImage(input, options)
    const payload = await callJson(ctx, options, '/v1/images/generations', body)
    const url = imageUrlOf(payload)
    if (!url) throw new Error('MOSS 没有返回图片 URL。')
    const image = withAttachment ? await attachImage(ctx, options, url) : undefined
    return remember(options, 'image', input, { payload, url, kind: 'image', mediaType: 'image/png', ...(image ? { image } : {}) })
}

function checkTaskFailure(payload) {
    const status = String(payload.status || '').toUpperCase()
    if (['FAILED', 'CANCELED', 'CANCELLED'].includes(status)) {
        const error = new Error(payload.error?.message || `MOSS task ${status}`)
        error.code = payload.error?.code || 'task_failed'
        throw error
    }
}

async function finishAudio(ctx, options, payload, body) {
    checkTaskFailure(payload)
    const pending = ['PENDING', 'PROCESSING', 'QUEUED'].includes(String(payload.status || '').toUpperCase())
    if (!audioUrlOf(payload) && (payload.task_id || pending || body.async)) {
        const id = taskIdOf(payload)
        if (!id) throw new Error('异步响应缺少 task_id。')
        return { pending: true, taskId: id, payload, kind: 'task', retryAfter: Math.max(1, Number(payload.retry_after) || options.pollIntervalMs / 1000) }
    }
    checkTaskFailure(payload)
    const url = audioUrlOf(payload)
    if (!url) throw new Error('MOSS 没有返回音频 URL。')
    return { payload, url, kind: 'audio', mediaType: payload.content_type || `audio/${payload.response_format || body.response_format}`, responseFormat: payload.response_format || body.response_format }
}

async function generateSpeech(ctx, options, input) {
    requireFeature(options, 'speech')
    const body = validateSpeech(input, options)
    requireAsyncSupport(options, body)
    if (body.stream || body.delivery_method !== 'url') throw Object.assign(new Error('工作台使用 URL 交付；此入口不提供原始 PCM/SSE。'), { status: 400 })
    return remember(options, 'speech', input, await finishAudio(ctx, options, await callJson(ctx, options, '/v1/audio/speech', body), body))
}

async function cloneVoice(ctx, options, input) {
    requireFeature(options, 'clone')
    const sample = validateClone(input)
    const form = new FormData()
    form.append('audio_sample', new Blob([sample.bytes]), sample.filename)
    if (sample.name) form.append('name', sample.name)
    const response = await mossFetch(ctx, options, '/v1/audio/voices', { method: 'POST', body: form, headers: { Accept: 'application/json' } })
    const payload = await jsonResponse(response)
    if (!payload.id && !payload.voice_id) throw new Error('MOSS 没有返回音色 ID。')
    return remember(options, 'clone', input, payload)
}

async function designVoice(ctx, options, input) {
    requireFeature(options, 'design')
    const body = validateDesign(input, options)
    requireAsyncSupport(options, body)
    if (body.delivery_method !== 'url') throw Object.assign(new Error('音色工作台需要 URL 交付。'), { status: 400 })
    const result = await finishAudio(ctx, options, await callJson(ctx, options, '/v1/audio/voice/generations', body), body)
    return remember(options, 'voice-design', input, { ...result, ...(result.payload.voice_id ? { voiceId: result.payload.voice_id } : {}) })
}

async function understand(ctx, options, input) {
    requireFeature(options, 'understand')
    const payload = await callJson(ctx, options, '/v1/responses', validateUnderstanding(input, options))
    if (!['completed', 'incomplete'].includes(payload.status)) throw new Error('MOSS-VL 没有返回有效响应状态。')
    const text = (payload.output || []).flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text).filter(Boolean).join('\n')
    return remember(options, 'understand', input, { payload, text, kind: 'text', incomplete: payload.status === 'incomplete' })
}

async function generateDialogue(ctx, options, input) {
    requireFeature(options, 'dialogue')
    const body = validateDialogue(input, options)
    requireAsyncSupport(options, body)
    if (body.delivery_method !== 'url') throw Object.assign(new Error('多人语音工作台需要 URL 交付。'), { status: 400 })
    return remember(options, 'dialogue', input, await finishAudio(ctx, options, await callJson(ctx, options, '/v1/audio/speech/speakers', body), body))
}

async function transcribe(ctx, options, input) {
    requireFeature(options, 'transcribe')
    const body = validateTranscription(input, options)
    requireAsyncSupport(options, body)
    if (body.stream) throw Object.assign(new Error('转写工作台暂不提供 SSE 流。'), { status: 400 })
    let payload
    if (body.response_format === 'text' && !body.async) {
        const response = await mossFetch(ctx, options, '/v1/audio/transcriptions', { method: 'POST', body: JSON.stringify(body) })
        if (!response.ok) await jsonResponse(response)
        payload = { text: await response.text() }
    } else {
        payload = await callJson(ctx, options, '/v1/audio/transcriptions', body)
    }
    checkTaskFailure(payload)
    if (body.async || payload.task_id) {
        const id = taskIdOf(payload)
        if (!id) throw new Error('异步转写响应缺少 task_id。')
        return remember(options, 'transcribe', input, { pending: true, taskId: id, payload, kind: 'task', retryAfter: Math.max(1, Number(payload.retry_after) || options.pollIntervalMs / 1000) })
    }
    checkTaskFailure(payload)
    return remember(options, 'transcribe', input, { payload, text: payload.text || '', kind: 'text' })
}

async function upload(ctx, options, input) {
    requireFeature(options, 'upload')
    const asset = validateUpload(input)
    const form = new FormData()
    form.append('file', new Blob([asset.bytes]), asset.filename)
    form.append('purpose', asset.purpose)
    const payload = await jsonResponse(await mossFetch(ctx, options, '/v1/files', { method: 'POST', body: form, headers: { Accept: 'application/json' } }))
    if (!payload.id) throw new Error('MOSS 上传没有返回 file_id。')
    return remember(options, 'upload', input, { payload, file_id: payload.id, kind: 'file' })
}

function audioResultText(result, label) {
    if (result.pending) return `${label}已提交，task_id：${result.taskId}。调用 moss_task_get 查询或等待；不要重复提交。`
    return `${label}已生成：${result.url}${result.voiceId ? `\nvoice_id：${result.voiceId}` : ''}`
}

function defineTools(ctx, options) {
    const register = (definition) => {
        const feature = TOOL_FEATURES[definition.name]
        if (options.features[feature] === false) return () => {}
        return ctx.tools.register(defineTool({
        ...definition,
        parameters: definition.parameters.properties,
        execute: (args, exec) => operationScope.run(exec?.signal, () => {
            requireFeature(options, feature)
            return definition.execute(args, exec)
        }),
        output: definition.output || {
            schema: { type: 'object', additionalProperties: false, properties: { text: { type: 'string', required: true } } },
            render: (_args, value) => [{ type: 'text', text: value.text }],
        },
        }))
    }
    const disposers = []
    disposers.push(register({
        name: 'moss_image_generate',
        description: '使用 MOSS 图像生成接口生成一张 PNG。用户要插画、海报、配图或重新画图时调用。',
        parameters: { type: 'object', properties: { prompt: { type: 'string', required: true }, model: { type: 'string' }, size: { type: 'string' }, negative_prompt: { type: 'string' }, prompt_enhance: { type: 'boolean' }, seed: { type: 'integer' }, num_inference_steps: { type: 'integer' }, guidance_scale: { type: 'number' }, output_watermark: { type: 'boolean' } } },
        output: { schema: { type: 'object', additionalProperties: true, properties: { text: { type: 'string', required: true }, image: { type: 'object', additionalProperties: true } } }, render: (_args, value) => [{ type: 'text', text: value.text }, ...(value.image ? [{ type: 'image', attachment: value.image }] : [])] },
        isConcurrencySafe: () => true,
        async execute(args) {
            try { const result = await generateImage(ctx, options, args, true); return { text: `MOSS 图像已生成。\n${result.url}`, ...(result.image ? { image: result.image } : {}) } } catch (error) { return { text: `MOSS 图像生成失败：${error.message}` } }
        },
    }))
    disposers.push(register({
        name: 'moss_speech_generate',
        description: '使用 MOSS 单人语音生成，把文本转换为音频 URL。需要 voice_id，可先调用 moss_voices_list 或 moss_voice_clone。',
        parameters: { type: 'object', properties: { input: { type: 'string', required: true }, voice_id: { type: 'string', required: true }, model: { type: 'string' }, response_format: { type: 'string' }, language: { type: 'string' }, async: { type: 'boolean' } } },
        async execute(args) { try { const result = await generateSpeech(ctx, options, args); return { text: audioResultText(result, 'MOSS 语音') } } catch (error) { return { text: `MOSS 语音生成失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_voice_clone',
        description: '上传 WAV/MP3/M4A/FLAC 音频样本创建可复用 MOSS 音色。参数 audio_base64 需为文件 Base64，最大 10 MB、30 秒。',
        parameters: { type: 'object', properties: { audio_base64: { type: 'string', required: true }, filename: { type: 'string' }, name: { type: 'string' }, duration_sec: { type: 'number' } } },
        async execute(args) { try { const payload = await cloneVoice(ctx, options, args); return { text: `MOSS 音色克隆成功，voice_id：${payload.id || payload.voice_id || '未返回'}` } } catch (error) { return { text: `MOSS 音色克隆失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_voice_generate',
        description: '按文字描述设计一个 MOSS 音色并生成试听，可选 create_voice=true 创建可复用 voice_id。',
        parameters: { type: 'object', properties: { input: { type: 'string', required: true }, instruction: { type: 'string', required: true }, model: { type: 'string' }, response_format: { type: 'string' }, create_voice: { type: 'boolean' }, async: { type: 'boolean' } } },
        async execute(args) { try { const result = await designVoice(ctx, options, args); return { text: audioResultText(result, 'MOSS 音色试听') } } catch (error) { return { text: `MOSS 音色生成失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_voices_list',
        description: '列出当前 MOSS 账号可用音色及 voice_id。',
        parameters: { type: 'object', properties: { limit: { type: 'integer' }, offset: { type: 'integer' }, after: { type: 'string' } } },
        async execute(args) { try { const query = new URLSearchParams(); if (args.limit !== undefined) query.set('limit', String(args.limit)); if (args.offset !== undefined) query.set('offset', String(args.offset)); if (args.after) query.set('after', args.after); const payload = await listVoices(ctx, options, query); return { text: JSON.stringify(payload, null, 2) } } catch (error) { return { text: `MOSS 音色列表失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_understand',
        description: '使用 MOSS-VL 理解 1–5 张图片或一个视频 URL，返回文字分析。',
        parameters: { type: 'object', properties: { instruction: { type: 'string', required: true }, image_urls: { type: 'array', items: { type: 'string' } }, image_file_ids: { type: 'array', items: { type: 'string' } }, video_url: { type: 'string' }, video_file_id: { type: 'string' }, model: { type: 'string' }, max_output_tokens: { type: 'integer' } } },
        async execute(args) { try { const result = await understand(ctx, options, args); return { text: result.text || JSON.stringify(result.payload) } } catch (error) { return { text: `MOSS-VL 失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_dialogue_generate',
        description: 'MOSS 多人配音：speakers 提供 id 与 voice_id，segments 按 speaker 与 text 组成对话。',
        parameters: { properties: {
            model: { type: 'string' },
            speakers: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: { id: { type: 'string', required: true }, voice_id: { type: 'string', required: true } } } },
            segments: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: { speaker: { type: 'string', required: true }, text: { type: 'string', required: true } } } },
            response_format: { type: 'string' }, async: { type: 'boolean' },
        } },
        async execute(args) { try { const result = await generateDialogue(ctx, options, args); return { text: audioResultText(result, 'MOSS 多人语音') } } catch (error) { return { text: `MOSS 多人语音失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_transcribe',
        description: 'MOSS 音频转写。输入 file_id、url、audio_url 三选一；可设置 diarize=true 识别说话人。',
        parameters: { properties: { model: { type: 'string' }, file_id: { type: 'string' }, url: { type: 'string' }, audio_url: { type: 'string' }, diarize: { type: 'boolean' }, keyterms: { type: 'array', items: { type: 'string' } }, async: { type: 'boolean' } } },
        async execute(args) { try { const result = await transcribe(ctx, options, args); return { text: result.pending ? `MOSS 转写已提交，task_id：${result.taskId}。请调用 moss_task_get 查询。` : JSON.stringify(result.payload, null, 2) } } catch (error) { return { text: `MOSS 转写失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_file_upload',
        description: '上传音频、图片或视频到 MOSS，返回可在转写/视觉理解中使用的 file_id。',
        parameters: { properties: { filename: { type: 'string', required: true }, purpose: { type: 'string', enum: ['audio', 'image', 'video'], required: true }, file_base64: { type: 'string', required: true } } },
        async execute(args) { try { const result = await upload(ctx, options, args); return { text: JSON.stringify(result.payload, null, 2) } } catch (error) { return { text: `MOSS 上传失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_task_get', description: '查询已提交的 MOSS 异步音频任务，不重新创建或重复扣费。',
        parameters: { properties: { task_id: { type: 'string', required: true }, wait: { type: 'boolean', description: 'true 时轮询至终态，false 只查一次。' } } },
        async execute(args) { try { const result = await getTask(ctx, options, args.task_id, args.wait); return { text: JSON.stringify(result, null, 2) } } catch (error) { return { text: `MOSS 任务查询失败：${error.message}` } } },
    }))
    disposers.push(register({
        name: 'moss_assets_list', description: '浏览本插件记录的本地资产索引，可按类型搜索和分页；不枚举账号全部历史云文件。',
        parameters: { properties: { kind: { type: 'string', enum: ['all', 'image', 'audio', 'video', 'file', 'voice', 'text', 'task'] }, q: { type: 'string' }, offset: { type: 'integer' }, limit: { type: 'integer' } } },
        async execute(args) { return { text: JSON.stringify(await listAssets(options, args), null, 2) } },
    }))
    disposers.push(register({
        name: 'moss_assets_remove', description: '仅移除指定本地资产索引记录，不会删除 MOSS 云文件或音色。',
        parameters: { properties: { id: { type: 'string', required: true } } },
        async execute(args) { return { text: JSON.stringify(await removeAsset(options, args.id)) } },
    }))
    return () => disposers.forEach((dispose) => { try { dispose() } catch {} })
}

async function getTask(ctx, options, taskId, wait = false) {
    requireFeature(options, 'task')
    if (typeof taskId !== 'string' || !taskId.trim() || taskId.length > 512) throw Object.assign(new Error('缺少有效任务 ID。'), { status: 400 })
    let payload
    try { payload = wait ? await pollTask(ctx, options, taskId) : await jsonResponse(await mossFetch(ctx, options, `/v1/audio/tasks/${encodeURIComponent(taskId)}`)) }
    catch (error) {
        if (error.task) await remember(options, 'task', { task_id: taskId }, { taskId, payload: error.task, kind: 'task' })
        throw error
    }
    const pending = ['PENDING', 'PROCESSING', 'QUEUED'].includes(String(payload.status || '').toUpperCase())
    return remember(options, 'task', { task_id: taskId }, { payload, taskId, pending, retryAfter: Math.max(1, Number(payload.retry_after) || options.pollIntervalMs / 1000), kind: 'task', ...(payload.url ? { url: payload.url, kind: 'audio', mediaType: payload.content_type } : {}), ...(payload.text ? { text: payload.text, kind: 'text' } : {}), ...(payload.voice_id ? { voiceId: payload.voice_id } : {}) })
}

async function listAssets(options, query) {
    requireFeature(options, 'assets')
    return options.assets.list(query)
}

async function removeAsset(options, id) {
    requireFeature(options, 'assets')
    return options.assets.remove(id)
}

async function listVoices(ctx, options, query = new URLSearchParams()) {
    requireFeature(options, 'voices')
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await mossFetch(ctx, options, `/v1/audio/voices${suffix}`, { headers: { Accept: 'application/json' } })
    return jsonResponse(response)
}

export function apply(ctx, config) {
    const shutdown = new AbortController()
    const log = ctx.logger?.('dsh-moss-multimodal') ?? { warn() {} }
    const assets = createAssetLibrary({ open(spec) {
        const storage = ctx.get('storageDomain')
        if (!storage) throw Object.assign(new Error('DSH 持久资产存储不可用。'), { code: 'assets_unavailable', status: 503 })
        return storage.open(spec)
    } })
    ctx.effect(() => async () => { shutdown.abort(); await assets.close() })
    const options = () => ({ ...readOptions(config), signal: shutdown.signal, assets, log })
    const disposeTools = defineTools(ctx, options())
    ctx.effect(() => disposeTools)

    ctx.inject(['connection'], (wctx) => {
        const saveConfig = async (next, expectedRevision) => {
            const entry = ctx.fiber?.entry
            const editor = ctx.get('configEditor')
            if (!entry || !editor) throw new Error('当前 DSH 没有可写配置编辑器。')
            await editor.edit(entry, (current) => {
                if (expectedRevision && configRevision(current) !== expectedRevision) throw Object.assign(new Error('配置已被其他页面修改；草稿未保存，请重新读取。'), { status: 409, code: 'config_conflict' })
                const candidate = { ...current, ...next }
                validateConfig(candidate)
                return candidate
            })
        }
        wctx.effect(() => ctx.tools.register(defineTool({
            name: 'moss_settings',
            description: '读取/保存/重置 MOSS 插件公开设置，或测试已保存连接。密钥只由用户在设置页保存，工具不会读取完整密钥。',
            parameters: {
                action: { type: 'string', enum: ['get', 'save', 'reset', 'probe'], required: true },
                values: { type: 'object', additionalProperties: true },
                expected_revision: { type: 'string' },
            },
            output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
            async execute(args) {
                try {
                    if (args.action === 'probe') return JSON.stringify(await jsonResponse(await mossFetch(ctx, options(), '/v1/models', { signal: AbortSignal.timeout(20000) })))
                    if (args.action === 'save' || args.action === 'reset') {
                        const value = args.values || {}
                        const allowed = args.action === 'reset' ? DEFAULTS : Object.fromEntries(Object.keys(DEFAULTS).filter((key) => value[key] !== undefined).map((key) => [key, value[key]]))
                        await saveConfig(allowed, args.expected_revision)
                        return 'MOSS settings saved.'
                    }
                    return JSON.stringify({ value: readOptions(config), revision: configRevision(config) }, null, 2)
                } catch (error) { return `MOSS settings failed: ${error.message}` }
            },
        })))
        const methods = { state: ['GET'], key: ['POST', 'DELETE'], config: ['POST', 'DELETE'], probe: ['GET'], assets: ['GET', 'POST'], image: ['POST'], speech: ['POST'], 'voice-design': ['POST'], understand: ['POST'], voices: ['GET'], task: ['GET'], clone: ['POST'], transcribe: ['POST'], dialogue: ['POST'], upload: ['POST'] }
        const dispatch = async (endpoint, request) => {
            if (!request || typeof request !== 'object' || Array.isArray(request)) throw Object.assign(new Error('Invalid RPC request'), { status: 400 })
            const method = request.method || 'GET'
            const body = request.body ?? {}
            const query = new URLSearchParams(request.query || {})
            if (!methods[endpoint]) throw Object.assign(new Error('Not found'), { status: 404 })
            if (!methods[endpoint].includes(method)) throw Object.assign(new Error('Method not allowed'), { status: 405 })
            if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('Body must be an object'), { status: 400 })
            const limit = endpoint === 'upload' ? 280 * 1024 * 1024 : endpoint === 'clone' ? 15 * 1024 * 1024 : 256 * 1024
            if (Buffer.byteLength(JSON.stringify(body)) > limit) throw Object.assign(new Error('请求体过大。'), { status: 413 })
            const current = options()
            if (endpoint === 'state') {
                const key = await getKey(ctx, current)
                const record = await ctx.get('credentials')?.readRecord?.('dsh-moss-multimodal/api-key')
                const hasStoredKey = Boolean(record?.kind === 'api-key' && record.key)
                return { configured: Boolean(key), keyHint: keyHint(key), keySource: hasStoredKey ? 'plugin-record' : key ? 'reference' : 'none', hasStoredKey, credentialKey: current.credentialKey, revision: configRevision(config), value: readOptions(config), features: current.features, models: MODEL_IDS }
            }
            if (endpoint === 'key') {
                const credentials = ctx.get('credentials')
                if (!credentials) throw new Error('凭据服务不可用。')
                if (method === 'DELETE') { await credentials.deleteRecord('dsh-moss-multimodal/api-key'); return { message: '插件 API Key 已清除；环境回退凭据保持不变。' } }
                const value = safeText(body.value)
                if (value.length < 8 || value.length > 4096) throw Object.assign(new Error('API Key 长度无效。'), { status: 400 })
                await credentials.modifyRecord('dsh-moss-multimodal/api-key', async () => ({ kind: 'api-key', key: value }))
                return { keyHint: keyHint(value), message: 'API Key 已保存到 DSH 凭据服务。' }
            }
            if (endpoint === 'config') {
                const allowed = method === 'DELETE' ? DEFAULTS : Object.fromEntries(Object.keys(DEFAULTS).filter((key) => body[key] !== undefined).map((key) => [key, body[key]]))
                if (allowed.features !== undefined) allowed.features = normalizeFeatures(allowed.features)
                await saveConfig(allowed, body.expectedRevision)
                return { message: '配置已保存。' }
            }
            if (endpoint === 'probe') {
                const payload = await jsonResponse(await mossFetch(ctx, current, '/v1/models', { signal: AbortSignal.timeout(20000) }))
                return { message: `连接正常，可用模型 ${Array.isArray(payload.data) ? payload.data.length : 0} 个。`, payload }
            }
            if (endpoint === 'image') return generateImage(ctx, current, body)
            if (endpoint === 'speech') return generateSpeech(ctx, current, body)
            if (endpoint === 'voice-design') return designVoice(ctx, current, body)
            if (endpoint === 'understand') return understand(ctx, current, body)
            if (endpoint === 'voices') return { payload: await listVoices(ctx, current, query) }
            if (endpoint === 'task') {
                const id = query.get('id')
                if (!id) throw Object.assign(new Error('缺少任务 id。'), { status: 400 })
                return getTask(ctx, current, id, query.get('wait') === 'true')
            }
            if (endpoint === 'assets') {
                if (method === 'GET') return listAssets(current, {
                    kind: query.get('kind') || 'all',
                    q: query.get('q') || '',
                    offset: query.has('offset') ? Number(query.get('offset')) : 0,
                    limit: query.has('limit') ? Number(query.get('limit')) : 40,
                })
                if (typeof body.id !== 'string' || !body.id.trim()) throw Object.assign(new Error('缺少资产 ID。'), { status: 400 })
                return removeAsset(current, body.id)
            }
            if (endpoint === 'clone') return { payload: await cloneVoice(ctx, current, body) }
            if (endpoint === 'upload') return upload(ctx, current, body)
            if (endpoint === 'dialogue') return generateDialogue(ctx, current, body)
            if (endpoint === 'transcribe') return transcribe(ctx, current, body)
        }
        wctx.effect(() => wctx.connection.rpc.handle('/x-moss-multimodal', async (endpoint, request, signal, peer) => {
            if (peer?.principal?.kind !== 'owner') return { ok: false, error: { code: 'forbidden', message: 'MOSS workbench requires an owner connection.', details: { status: 403 } } }
            try {
                const value = await operationScope.run(signal, () => dispatch(endpoint, request))
                return { ok: true, value: { ok: true, ...value } }
            } catch (error) {
                log.warn('MOSS operation %s failed: %s', endpoint, error.message)
                return { ok: false, error: { code: String(error.code || 'moss_error'), message: error.message || String(error), details: { status: error.status || 500, ...(error.task_id ? { task_id: error.task_id } : {}) } } }
            }
        }))
    })
}
