export const FEATURE_DEFAULTS = Object.freeze({
    image: true, speech: true, transcribe: true, dialogue: true, clone: true,
    design: true, understand: true, voices: true, upload: true, task: true, assets: true,
})

export const TOOL_FEATURES = Object.freeze({
    moss_image_generate: 'image', moss_speech_generate: 'speech', moss_transcribe: 'transcribe',
    moss_dialogue_generate: 'dialogue', moss_voice_clone: 'clone', moss_voice_generate: 'design',
    moss_understand: 'understand', moss_voices_list: 'voices', moss_file_upload: 'upload',
    moss_task_get: 'task', moss_assets_list: 'assets', moss_assets_remove: 'assets',
})

export function normalizeFeatures(value) {
    if (value === undefined) return { ...FEATURE_DEFAULTS }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Object.assign(new TypeError('features must be an object'), { status: 400, code: 'invalid_features' })
    for (const [key, enabled] of Object.entries(value)) {
        if (!Object.hasOwn(FEATURE_DEFAULTS, key) || typeof enabled !== 'boolean') throw Object.assign(new TypeError(`Invalid feature setting: ${key}`), { status: 400, code: 'invalid_features' })
    }
    return { ...FEATURE_DEFAULTS, ...value }
}

export function requireFeature(options, feature) {
    if (!Object.hasOwn(FEATURE_DEFAULTS, feature)) throw new Error(`Unknown MOSS feature: ${feature}`)
    if (options.features?.[feature] === false) throw Object.assign(new Error(`MOSS 功能已关闭：${feature} / feature disabled`), { status: 403, code: 'feature_disabled' })
}

export function requireAsyncSupport(options, input) {
    if (input.async) requireFeature(options, 'task')
}
