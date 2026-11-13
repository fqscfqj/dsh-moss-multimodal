import test from 'node:test'
import assert from 'node:assert/strict'
import { MODEL_IDS, validateImage, validateSpeech, validateDesign, validateDialogue, validateUnderstanding, validateTranscription, validateUpload, validateClone } from '../moss-api.js'

const speech = { input: 'Hello', voice_id: 'voice-1' }
const design = { input: 'Hello', instruction: 'A warm voice' }
const dialogue = { speakers: [{ id: 'a', voice_id: 'voice-1' }], segments: [{ speaker: 'a', text: 'Hello' }] }
const understanding = { instruction: 'Describe', image_urls: ['https://example.com/image.png'] }
const transcription = { url: 'https://example.com/audio.wav' }
const rejects = (fn) => assert.throws(fn, (error) => error.code === 'invalid_input' && error.status === 400)

test('model catalogs expose exact public model IDs and immutable lists', () => {
    assert.deepEqual(Object.keys(MODEL_IDS), ['image', 'speech', 'voice', 'dialogue', 'vl', 'transcription'])
    assert.equal(MODEL_IDS.transcription.includes('moss-transcribe-1.0'), true)
    assert.throws(() => MODEL_IDS.image.push('unknown'))
})

test('image defaults and exact ranges preserve explicit zero and false', () => {
    const body = validateImage({ prompt: 'Poster', seed: 0, guidance_scale: 0, output_watermark: false })
    assert.equal(body.model, 'moss-image-sft-1.0')
    assert.equal(body.n, 1)
    assert.equal(body.response_format, 'url')
    assert.equal(body.seed, 0)
    assert.equal(body.guidance_scale, 0)
    assert.deepEqual(body.output_watermark, { enabled: false })
    assert.equal(validateImage({ prompt: 'x', size: '2048x1024' }).size, '2048x1024')
    assert.equal(validateImage({ prompt: 'x' }, { imageModel: 'moss-image-base-1.0', imageWatermark: false }).model, 'moss-image-base-1.0')
})

test('image rejects invalid types, unsupported fields and size limits', () => {
    for (const change of [{ prompt: '' }, { prompt: 'x'.repeat(4001) }, { negative_prompt: 'x'.repeat(4001) }, { seed: '1' }, { seed: -1 }, { seed: Number.MAX_SAFE_INTEGER + 1 }, { guidance_scale: NaN }, { guidance_scale: 11 }, { num_inference_steps: 1.5 }, { num_inference_steps: 101 }, { size: '2048x2048' }, { size: '257x1024' }, { size: '256X256' }, { n: 2 }, { response_format: 'b64_json' }, { model: 'unknown' }, { prompt_enhance: 'false' }, { prompt_enhance: null }, { output_watermark: { enabled: 1 } }, { stream: true }]) rejects(() => validateImage({ prompt: 'x', ...change }))
})

test('speech and design default to URL results and accept snapshots', () => {
    assert.equal(validateSpeech(speech).delivery_method, 'url')
    assert.equal(validateSpeech({ ...speech, model: 'moss-tts-1.5-flash-2026-06-26', language: 'Cantonese', expected_duration_sec: 1 }).language, 'Cantonese')
    assert.equal(validateDesign({ ...design, create_voice: true }).create_voice, true)
    assert.equal(validateDesign(design, { audioFormat: 'wav' }).response_format, 'wav')
    rejects(() => validateDesign({ ...design, create_voice: true, delivery_method: 'audio' }))
    rejects(() => validateDesign({ ...design, create_voice: 'true' }))
})

test('speech streaming enforces PCM and incompatible modes', () => {
    assert.deepEqual(validateSpeech({ ...speech, stream: true, stream_format: 'sse' }), { model: 'moss-tts-1.5-flash', ...speech, stream: true, response_format: 'pcm', stream_format: 'sse' })
    for (const change of [{ response_format: 'mp3' }, { async: true }, { delivery_method: 'url' }, { webhook_url: 'https://example.com/hook' }, { model: 'moss-tts-1.0-pro' }, { stream_format: 'invalid' }]) rejects(() => validateSpeech({ ...speech, stream: true, ...change }))
    for (const change of [{ language: 'zh' }, { expected_duration_sec: 0 }, { expected_duration_sec: Infinity }, { async: 'true' }, { voice_id: 1 }, { stream: 'true' }, { stream_format: 'sse' }, { voice_url: 'https://example.com/ref.wav' }]) rejects(() => validateSpeech({ ...speech, ...change }))
    rejects(() => validateSpeech({ ...speech, model: 'moss-tts-1.0-pro', language: 'Chinese' }))
})

test('dialogue validates speaker references, duplicates and metadata', () => {
    const body = validateDialogue({ ...dialogue, aigc_metadata: { enabled: false, propagate_id: 'id' } })
    assert.equal(body.model, 'moss-ttsd-1.0')
    assert.deepEqual(body.aigc_metadata, { enabled: false, propagate_id: 'id' })
    rejects(() => validateDialogue({ ...dialogue, segments: [{ speaker: 'missing', text: 'Hi' }] }))
    rejects(() => validateDialogue({ ...dialogue, speakers: [...dialogue.speakers, ...dialogue.speakers] }))
    rejects(() => validateDialogue({ ...dialogue, speakers: [] }))
    rejects(() => validateDialogue({ ...dialogue, segments: [{ speaker: 'a', text: '' }] }))
    rejects(() => validateDialogue({ ...dialogue, aigc_metadata: { enabled: 'false' } }))
    rejects(() => validateDialogue({ ...dialogue, stream: true }))
})

test('understanding builds official content from URL and file ID inputs', () => {
    const body = validateUnderstanding({ ...understanding, image_file_ids: ['file-1'] })
    assert.deepEqual(body.input[0].content[2], { type: 'input_image', file_id: 'file-1' })
    assert.equal(body.input[0].role, 'user')
    assert.equal(validateUnderstanding({ instruction: 'Summarize', video_file_id: 'file-2' }).input[0].content[1].type, 'input_video')
    assert.deepEqual(validateUnderstanding(body), body)
    assert.equal(validateUnderstanding({ ...understanding, max_output_tokens: 8192 }).max_output_tokens, 8192)
})

test('understanding rejects media counts, source conflicts and malformed native messages', () => {
    for (const change of [{ image_urls: [] }, { image_urls: Array(6).fill('https://example.com/x') }, { video_url: 'https://example.com/movie.mp4' }, { max_output_tokens: 8193 }, { max_output_tokens: '1024' }, { instruction: '' }, { image_urls: ['data:image/png;base64,YQ=='] }, { image_urls: 'https://example.com/x' }]) rejects(() => validateUnderstanding({ ...understanding, ...change }))
    const native = (content) => ({ input: [{ role: 'user', content }] })
    rejects(() => validateUnderstanding(native([{ type: 'input_text', text: 'x' }, { type: 'input_image', image_url: 'https://example.com/x', file_id: 'file-1' }])))
    rejects(() => validateUnderstanding(native([{ type: 'input_text', text: 'x' }, { type: 'input_image' }])))
    rejects(() => validateUnderstanding({ ...native([{ type: 'input_text', text: 'x' }, { type: 'input_image', file_id: 'file-1' }]), instruction: 'x' }))
    rejects(() => validateUnderstanding({ input: [{ role: 'assistant', content: [] }] }))
    rejects(() => validateUnderstanding({ input: [] }))
})

test('transcription validates source, diarization, hotwords and stream formats', () => {
    assert.equal(validateTranscription(transcription).response_format, 'json')
    assert.equal(validateTranscription({ file_id: 'file-1', async: true }).async, true)
    const pro = { file_id: 'file-1', model: 'moss-transcribe-diarize-pro' }
    assert.deepEqual(validateTranscription({ ...pro, keyterms: ['MOSS'], diarize: true }).keyterms, ['MOSS'])
    assert.equal(validateTranscription({ ...pro, stream: true }).response_format, 'verbose_json')
    assert.equal(validateTranscription({ ...pro, response_format: 'diarized_json' }).response_format, 'diarized_json')
    for (const change of [{ file_id: 'f' }, { audio_data: 'YQ==' }, { diarize: true }, { keyterms: ['MOSS'] }, { stream: true }, { response_format: 'verbose_json' }, { response_format: 'diarized_json' }, { keyterms: ['x'.repeat(31)] }, { keyterms: [1] }, { keyterms: 'MOSS' }]) rejects(() => validateTranscription({ ...transcription, ...change }))
    rejects(() => validateTranscription({ ...pro, stream: true, async: true }))
    rejects(() => validateTranscription({ ...pro, stream: true, response_format: 'text' }))
    rejects(() => validateTranscription({ ...pro, keyterms: Array(21).fill('MOSS') }))
    rejects(() => validateTranscription({}))
})

test('public media and callback URLs reject private, inline and credentialed addresses', () => {
    for (const url of ['http://localhost/x', 'http://127.0.0.1/x', 'http://10.1.2.3/x', 'http://172.16.0.1/x', 'http://192.168.1.1/x', 'http://169.254.169.254/x', 'http://[::1]/x', 'http://[fc00::1]/x', 'http://[::ffff:127.0.0.1]/x', 'http://2130706433/x', 'https://user:pass@example.com/x', 'file:///tmp/x', 'data:audio/wav;base64,YQ==', '/local/file.wav']) rejects(() => validateTranscription({ url }))
    rejects(() => validateSpeech({ ...speech, webhook_url: 'http://example.com/hook', async: true }))
    assert.equal(validateSpeech({ ...speech, webhook_url: 'https://example.com/hook', async: true }).async, true)
})

test('upload and clone decode canonical Base64 and enforce formats and metadata', () => {
    assert.equal(validateUpload({ filename: 'image.png', file_base64: 'YQ==', purpose: 'image' }).bytes.toString(), 'a')
    assert.equal(validateClone({ audio_base64: 'data:audio/wav;base64,YQ==', name: 'Voice', duration_sec: 30 }).name, 'Voice')
    for (const audio_base64 of ['!!!', '', 'Y', 'YQ=', 'YR==', 'YQ==junk']) rejects(() => validateClone({ audio_base64 }))
    rejects(() => validateClone({ audio_base64: 'YQ==', filename: 'sample.ogg' }))
    rejects(() => validateClone({ audio_base64: 'YQ==', filename: '../sample.wav' }))
    rejects(() => validateClone({ audio_base64: 'YQ==', duration_sec: 31 }))
    rejects(() => validateClone({ audio_base64: 'YQ==', description: 'not an official field' }))
    rejects(() => validateUpload({ filename: 'image.png', file_base64: 'YQ==', purpose: 'unknown' }))
})

test('all validators reject null, array and unknown input fields without coercion', () => {
    for (const fn of [validateImage, validateSpeech, validateDesign, validateDialogue, validateUnderstanding, validateTranscription, validateUpload, validateClone]) for (const value of [null, [], 'x', { unknown: true }]) rejects(() => fn(value))
})

test('exact character, numeric and media-count boundaries are accepted', () => {
    assert.equal(validateImage({ prompt: '\u{1f600}'.repeat(4000), seed: Number.MAX_SAFE_INTEGER, num_inference_steps: 100, guidance_scale: 10 }).prompt.length, 8000)
    assert.equal(validateUnderstanding({ instruction: 'Compare', image_file_ids: ['1', '2', '3', '4', '5'], max_output_tokens: 1 }).input[0].content.length, 6)
    rejects(() => validateUnderstanding({ ...understanding, image_file_ids: ['1', '2', '3', '4', '5'] }))
    const body = validateTranscription({ file_id: 'file-1', model: 'moss-transcribe-diarize-pro', keyterms: Array(20).fill('x'.repeat(30)) })
    assert.equal(body.keyterms.length, 20)
})

test('clone rejects oversized encoded files before allocating decoded bytes', () => {
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1).toString('base64')
    rejects(() => validateClone({ audio_base64: oversized }))
})

test('validators never mutate caller bodies or arrays', () => {
    const input = structuredClone(dialogue)
    const original = structuredClone(input)
    const result = validateDialogue(input)
    result.segments[0].text = 'Changed'
    result.speakers[0].id = 'Changed'
    assert.deepEqual(input, original)
    const native = validateUnderstanding(understanding)
    const nativeOriginal = structuredClone(native)
    validateUnderstanding(native).input[0].content[1].image_url = 'changed'
    assert.deepEqual(native, nativeOriginal)
})
