// Public API contracts: https://platform.moss.cn/docs/reference
export const MODEL_IDS = Object.freeze({
    image: Object.freeze(['moss-image-base-1.0', 'moss-image-sft-1.0', 'moss-image-base-1.0-2026-10-09', 'moss-image-sft-1.0-2026-10-09']),
    speech: Object.freeze(['moss-tts-1.5-flash', 'moss-tts-1.0-pro', 'moss-tts-1.5-flash-2026-06-26', 'moss-tts-1.0-pro-2026-02-07']),
    voice: Object.freeze(['moss-voice-generator-1.0', 'moss-voice-generator-1.0-2026-07-22']),
    dialogue: Object.freeze(['moss-ttsd-1.0', 'moss-ttsd-1.0-2026-03-20']),
    vl: Object.freeze(['moss-vl-1.0', 'moss-vl-1.0-2026-07-08']),
    transcription: Object.freeze(['moss-transcribe-1.0', 'moss-transcribe-diarize-pro']),
})
const AUDIO_FORMATS = ['mp3', 'wav', 'pcm', 'flac', 'aac', 'opus']
const LANGUAGES = ['Chinese', 'Cantonese', 'English', 'Arabic', 'Czech', 'Danish', 'Dutch', 'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hindi', 'Hungarian', 'Italian', 'Japanese', 'Korean', 'Macedonian', 'Malay', 'Persian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Spanish', 'Swahili', 'Swedish', 'Tagalog', 'Thai', 'Turkish', 'Vietnamese']
const has = (input, key) => input[key] !== undefined

function fail(field, detail) {
    const error = new TypeError(`${field}: ${detail}`)
    Object.assign(error, { code: 'invalid_input', status: 400, param: field })
    throw error
}
function object(value, field = 'input') {
    if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(field, 'must be an object')
    return value
}
function keys(input, allowed, field = 'input') {
    object(input, field)
    for (const key of Object.keys(input)) {
        if (!allowed.includes(key)) fail(`${field}.${key}`, 'unsupported field')
        if (input[key] === null) fail(`${field}.${key}`, 'must not be null')
    }
}
function text(value, field, max = Infinity, allowEmpty = false) {
    if (typeof value !== 'string' || !allowEmpty && !value.trim()) fail(field, 'must be a non-empty string')
    if (max !== Infinity && [...value].length > max) fail(field, `must not exceed ${max} characters`)
    return value
}
function enumeration(value, field, choices) {
    if (!choices.includes(value)) fail(field, `must be one of ${choices.join(', ')}`)
    return value
}
function bool(value, field) {
    if (typeof value !== 'boolean') fail(field, 'must be a boolean')
    return value
}
function number(value, field, min, max, integer = false) {
    if (typeof value !== 'number' || !Number.isFinite(value) || integer && !Number.isSafeInteger(value) || value < min || value > max) fail(field, `must be ${integer ? 'an integer' : 'a number'} in [${min}, ${max}]`)
    return value
}
function array(value, field, min = 0, max = Infinity) {
    if (!Array.isArray(value) || value.length < min || value.length > max) fail(field, `must be an array with ${min}..${max} items`)
    return value
}
// Literal-address screening only; the service must still enforce DNS/IP rules.
function publicUrl(value, field, httpsOnly = false) {
    text(value, field)
    let url
    try { url = new URL(value) } catch { fail(field, 'must be an absolute public HTTP(S) URL') }
    if (!(httpsOnly ? ['https:'] : ['http:', 'https:']).includes(url.protocol) || url.username || url.password) fail(field, 'must be a public HTTP(S) URL without credentials')
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/gu, '').replace(/\.$/u, '')
    const ip = /^\d+\.\d+\.\d+\.\d+$/u.test(host) ? host.split('.').map(Number) : null
    const privateV4 = ip && (ip[0] === 0 || ip[0] === 10 || ip[0] === 127 || ip[0] === 169 && ip[1] === 254 || ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31 || ip[0] === 192 && ip[1] === 168 || ip[0] === 100 && ip[1] >= 64 && ip[1] <= 127 || ip[0] >= 224)
    const privateV6 = host === '::' || host === '::1' || /^(?:f[cd]|fe[89ab]|ff)/u.test(host) && host.includes(':') || host.startsWith('::ffff:')
    if (privateV4 || privateV6 || !host.includes('.') && !host.includes(':') || /(?:^|\.)(?:localhost|local|internal|lan)$/u.test(host)) fail(field, 'must not address a local or private host')
    return value
}
function model(input, options, option, kind, fallback) {
    return enumeration(input.model ?? options[option] ?? fallback, 'model', MODEL_IDS[kind])
}
function asyncFields(input, body) {
    if (has(input, 'async')) body.async = bool(input.async, 'async')
    if (has(input, 'webhook_url')) body.webhook_url = publicUrl(input.webhook_url, 'webhook_url', true)
}
function audioFields(input, body, options) {
    body.response_format = enumeration(input.response_format ?? options.audioFormat ?? 'mp3', 'response_format', AUDIO_FORMATS)
    body.delivery_method = enumeration(input.delivery_method ?? 'url', 'delivery_method', ['audio', 'url'])
    asyncFields(input, body)
}
function metadata(input, body) {
    if (!has(input, 'aigc_metadata')) return
    keys(input.aigc_metadata, ['enabled', 'content_propagator', 'propagate_id'], 'aigc_metadata')
    const value = {}
    if (has(input.aigc_metadata, 'enabled')) value.enabled = bool(input.aigc_metadata.enabled, 'aigc_metadata.enabled')
    for (const field of ['content_propagator', 'propagate_id']) if (has(input.aigc_metadata, field)) value[field] = text(input.aigc_metadata[field], `aigc_metadata.${field}`, Infinity, true)
    body.aigc_metadata = value
}

export function validateImage(input, options = {}) {
    keys(input, ['model', 'prompt', 'size', 'n', 'response_format', 'negative_prompt', 'seed', 'num_inference_steps', 'guidance_scale', 'prompt_enhance', 'output_watermark'])
    const body = {
        model: model(input, options, 'imageModel', 'image', 'moss-image-sft-1.0'),
        prompt: text(input.prompt, 'prompt', 4000),
        size: text(input.size ?? options.imageSize ?? '1024x1024', 'size'),
        n: enumeration(input.n ?? 1, 'n', [1]),
        response_format: enumeration(input.response_format ?? 'url', 'response_format', ['url']),
        prompt_enhance: bool(input.prompt_enhance ?? options.imagePromptEnhance ?? false, 'prompt_enhance'),
    }
    const match = /^(\d+)x(\d+)$/u.exec(body.size)
    if (!match) fail('size', 'must use WIDTHxHEIGHT')
    const [width, height] = match.slice(1).map(Number)
    if ([width, height].some((value) => value < 256 || value > 2048 || value % 16 !== 0) || width * height > 2097152) fail('size', 'sides must be 256..2048, multiples of 16, at most 2097152 pixels')
    let watermark = input.output_watermark
    if (watermark !== undefined && typeof watermark !== 'boolean') {
        keys(watermark, ['enabled'], 'output_watermark')
        watermark = watermark.enabled ?? options.imageWatermark ?? true
    }
    body.output_watermark = { enabled: bool(watermark ?? options.imageWatermark ?? true, 'output_watermark.enabled') }
    if (has(input, 'negative_prompt')) body.negative_prompt = text(input.negative_prompt, 'negative_prompt', 4000, true)
    for (const [field, min, max, integer] of [['seed', 0, Number.MAX_SAFE_INTEGER, true], ['num_inference_steps', 1, 100, true], ['guidance_scale', 0, 10, false]]) if (has(input, field)) body[field] = number(input[field], field, min, max, integer)
    return body
}

export function validateSpeech(input, options = {}) {
    keys(input, ['model', 'input', 'voice_id', 'language', 'expected_duration_sec', 'response_format', 'delivery_method', 'async', 'webhook_url', 'stream', 'stream_format', 'aigc_metadata'])
    const body = { model: model(input, options, 'speechModel', 'speech', 'moss-tts-1.5-flash'), input: text(input.input, 'input'), voice_id: text(input.voice_id, 'voice_id') }
    const flash = body.model.startsWith('moss-tts-1.5-flash')
    if (has(input, 'language')) {
        if (!flash) fail('language', 'supported only by moss-tts-1.5-flash')
        body.language = enumeration(input.language, 'language', LANGUAGES)
    }
    if (has(input, 'expected_duration_sec')) body.expected_duration_sec = number(input.expected_duration_sec, 'expected_duration_sec', Number.MIN_VALUE, Infinity)
    const stream = has(input, 'stream') ? bool(input.stream, 'stream') : false
    if (stream) {
        if (!flash) fail('stream', 'supported only by moss-tts-1.5-flash')
        if (has(input, 'async') && bool(input.async, 'async')) fail('async', 'cannot be combined with stream')
        if (has(input, 'webhook_url') || has(input, 'delivery_method')) fail('stream', 'cannot be combined with webhook_url or delivery_method')
        body.stream = true
        body.response_format = enumeration(input.response_format ?? 'pcm', 'response_format', ['pcm'])
        body.stream_format = enumeration(input.stream_format ?? 'audio', 'stream_format', ['audio', 'sse'])
    } else {
        if (has(input, 'stream_format')) fail('stream_format', 'requires stream=true')
        audioFields(input, body, options)
        if (has(input, 'stream')) body.stream = false
    }
    metadata(input, body)
    return body
}

export function validateDesign(input, options = {}) {
    keys(input, ['model', 'input', 'instruction', 'response_format', 'delivery_method', 'create_voice', 'async', 'webhook_url'])
    const body = { model: model(input, options, 'voiceModel', 'voice', 'moss-voice-generator-1.0'), input: text(input.input, 'input'), instruction: text(input.instruction, 'instruction') }
    audioFields(input, body, options)
    if (has(input, 'create_voice')) {
        body.create_voice = bool(input.create_voice, 'create_voice')
        if (body.create_voice && body.delivery_method !== 'url') fail('create_voice', 'requires delivery_method=url')
    }
    return body
}

export function validateDialogue(input, options = {}) {
    keys(input, ['model', 'speakers', 'segments', 'response_format', 'delivery_method', 'async', 'webhook_url', 'aigc_metadata'])
    const ids = new Set()
    const speakers = array(input.speakers, 'speakers', 1).map((speaker, index) => {
        const field = `speakers[${index}]`
        keys(speaker, ['id', 'voice_id'], field)
        const id = text(speaker.id, `${field}.id`)
        if (ids.has(id)) fail(`${field}.id`, 'duplicate speaker id')
        ids.add(id)
        return { id, voice_id: text(speaker.voice_id, `${field}.voice_id`) }
    })
    const segments = array(input.segments, 'segments', 1).map((segment, index) => {
        const field = `segments[${index}]`
        keys(segment, ['speaker', 'text'], field)
        const speaker = text(segment.speaker, `${field}.speaker`)
        if (!ids.has(speaker)) fail(`${field}.speaker`, 'must reference a declared speaker id')
        return { speaker, text: text(segment.text, `${field}.text`) }
    })
    const body = { model: model(input, options, 'dialogueModel', 'dialogue', 'moss-ttsd-1.0'), speakers, segments }
    audioFields(input, body, options)
    metadata(input, body)
    return body
}

function media(item, index) {
    const field = `input[0].content[${index}]`
    object(item, field)
    if (item.type === 'input_text') {
        keys(item, ['type', 'text'], field)
        return { type: item.type, text: text(item.text, `${field}.text`) }
    }
    enumeration(item.type, `${field}.type`, ['input_image', 'input_video'])
    const urlField = item.type === 'input_image' ? 'image_url' : 'video_url'
    keys(item, ['type', urlField, 'file_id'], field)
    if (Number(has(item, urlField)) + Number(has(item, 'file_id')) !== 1) fail(field, `provide exactly one of ${urlField} or file_id`)
    return has(item, 'file_id') ? { type: item.type, file_id: text(item.file_id, `${field}.file_id`) } : { type: item.type, [urlField]: publicUrl(item[urlField], `${field}.${urlField}`) }
}

export function validateUnderstanding(input, options = {}) {
    keys(input, ['model', 'input', 'instruction', 'image_urls', 'image_file_ids', 'video_url', 'video_file_id', 'max_output_tokens'])
    let content
    if (has(input, 'input')) {
        for (const field of ['instruction', 'image_urls', 'image_file_ids', 'video_url', 'video_file_id']) if (has(input, field)) fail(field, 'cannot combine flat fields with native input')
        const messages = array(input.input, 'input', 1, 1)
        keys(messages[0], ['role', 'content'], 'input[0]')
        enumeration(messages[0].role, 'input[0].role', ['user'])
        content = array(messages[0].content, 'input[0].content', 2).map(media)
    } else {
        content = [{ type: 'input_text', text: text(input.instruction, 'instruction') }]
        for (const [field, source] of [['image_urls', 'image_url'], ['image_file_ids', 'file_id']]) {
            if (has(input, field)) for (const value of array(input[field], field, 0, 5)) content.push(media({ type: 'input_image', [source]: value }, content.length))
        }
        if (has(input, 'video_url') && has(input, 'video_file_id')) fail('video_file_id', 'cannot combine video_url and video_file_id')
        if (has(input, 'video_url')) content.push(media({ type: 'input_video', video_url: input.video_url }, content.length))
        if (has(input, 'video_file_id')) content.push(media({ type: 'input_video', file_id: input.video_file_id }, content.length))
    }
    const images = content.filter((item) => item.type === 'input_image').length
    const videos = content.filter((item) => item.type === 'input_video').length
    if (!content.some((item) => item.type === 'input_text') || images + videos === 0 || images > 5 || videos > 1 || images && videos) fail('input', 'requires text and either 1..5 images or one video, never mixed')
    return { model: model(input, options, 'vlModel', 'vl', 'moss-vl-1.0'), input: [{ role: 'user', content }], max_output_tokens: number(input.max_output_tokens ?? 1024, 'max_output_tokens', 1, 8192, true) }
}

export function validateTranscription(input, options = {}) {
    keys(input, ['model', 'file_id', 'url', 'audio_url', 'diarize', 'keyterms', 'stream', 'response_format', 'async', 'webhook_url'])
    const sources = ['file_id', 'url', 'audio_url'].filter((field) => has(input, field))
    if (sources.length !== 1) fail('input', 'provide exactly one of file_id, url or audio_url; upload local files first')
    const body = { model: model(input, options, 'transcriptionModel', 'transcription', 'moss-transcribe-1.0') }
    const source = sources[0]
    body[source] = source === 'file_id' ? text(input[source], source) : publicUrl(input[source], source)
    const pro = body.model === 'moss-transcribe-diarize-pro'
    if (has(input, 'diarize')) {
        body.diarize = bool(input.diarize, 'diarize')
        if (body.diarize && !pro) fail('diarize', 'requires moss-transcribe-diarize-pro')
    }
    if (has(input, 'keyterms')) {
        body.keyterms = array(input.keyterms, 'keyterms', 0, 20).map((term, index) => text(term, `keyterms[${index}]`, 30))
        if (body.keyterms.length && !pro) fail('keyterms', 'requires moss-transcribe-diarize-pro')
    }
    const stream = has(input, 'stream') ? bool(input.stream, 'stream') : false
    if (stream && !pro) fail('stream', 'requires moss-transcribe-diarize-pro')
    body.response_format = enumeration(input.response_format ?? (stream ? 'verbose_json' : 'json'), 'response_format', ['json', 'text', 'diarized_json', 'verbose_json'])
    if (body.response_format === 'diarized_json' && !pro) fail('response_format', 'diarized_json requires moss-transcribe-diarize-pro')
    if (body.response_format === 'verbose_json' && !stream || body.response_format === 'text' && stream) fail('response_format', 'format is incompatible with stream mode')
    if (has(input, 'stream')) body.stream = stream
    asyncFields(input, body)
    if (stream && body.async) fail('async', 'cannot be combined with stream')
    return body
}

function decodeFile(input, field, limit) {
    const encoded = text(input[field], field)
    const match = /^(?:data:[^;,]+;base64,)?([A-Za-z0-9+/]*={0,2})$/u.exec(encoded)
    if (!match || !match[1] || match[1].length % 4 === 1 || match[1].includes('=') && match[1].length % 4 !== 0) fail(field, 'must contain valid Base64 file bytes')
    if (match[1].replace(/=+$/u, '').length > Math.ceil(limit * 4 / 3)) fail(field, 'file exceeds the byte limit')
    const bytes = Buffer.from(match[1], 'base64')
    if (!bytes.length || bytes.length > limit || bytes.toString('base64').replace(/=+$/u, '') !== match[1].replace(/=+$/u, '')) fail(field, 'invalid Base64 or file exceeds the byte limit')
    const filename = text(input.filename, 'filename')
    if (/[\\/\x00-\x1f]/u.test(filename)) fail('filename', 'must be a filename without path separators')
    return { filename, bytes }
}
export function validateUpload(input) {
    keys(input, ['filename', 'file_base64', 'purpose'])
    return { ...decodeFile(input, 'file_base64', 512 * 1024 * 1024), purpose: enumeration(input.purpose, 'purpose', ['audio', 'image', 'video']) }
}
export function validateClone(input) {
    keys(input, ['filename', 'audio_base64', 'name', 'duration_sec'])
    const result = decodeFile({ ...input, filename: input.filename ?? 'voice-sample.wav' }, 'audio_base64', 10 * 1024 * 1024)
    if (!/\.(?:wav|mp3|m4a|flac)$/iu.test(result.filename)) fail('filename', 'supported clone formats are wav, mp3, m4a, flac')
    if (has(input, 'name')) result.name = text(input.name, 'name', Infinity, true)
    // Duration cannot be established from Base64 alone; hosts may supply probed duration.
    if (has(input, 'duration_sec')) number(input.duration_sec, 'duration_sec', Number.MIN_VALUE, 30)
    return result
}
