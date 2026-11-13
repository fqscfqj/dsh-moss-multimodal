import { createHash } from 'node:crypto'
import { z } from 'zod'

const KINDS = ['image', 'audio', 'video', 'file', 'voice', 'text', 'task']
const OPERATIONS = ['image', 'speech', 'voice-design', 'clone', 'upload', 'dialogue', 'transcribe', 'understand', 'task']
const KIND_SET = new Set(KINDS)
const OPERATION_SET = new Set(OPERATIONS)

function safeHttpUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return undefined
    let parsed
    try { parsed = new URL(value) } catch { return undefined }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return undefined
    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/gu, '').replace(/\.$/u, '')
    const octets = /^\d+\.\d+\.\d+\.\d+$/u.test(host) ? host.split('.').map(Number) : null
    const privateV4 = octets && (octets.some((part) => part > 255) || octets[0] === 0 || octets[0] === 10 || octets[0] === 127 || octets[0] === 169 && octets[1] === 254 || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31 || octets[0] === 192 && octets[1] === 168 || octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127 || octets[0] >= 224)
    const privateV6 = host === '::' || host === '::1' || /^(?:f[cd]|fe[89ab]|ff)/u.test(host) && host.includes(':') || host.startsWith('::ffff:')
    if (privateV4 || privateV6 || !host.includes('.') && !host.includes(':') || /(?:^|\.)(?:localhost|local|internal|lan)$/u.test(host)) return undefined
    return parsed.toString()
}

const AssetSchema = z.object({
    id: z.string().min(1),
    kind: z.enum(KINDS),
    operation: z.enum(OPERATIONS),
    title: z.string().max(100),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    url: z.string().url().refine((value) => Boolean(safeHttpUrl(value)), 'must be a safe HTTP(S) URL').optional(),
    mediaType: z.string().min(1).optional(),
    text: z.string().max(100000).optional(),
    fileId: z.string().min(1).optional(),
    voiceId: z.string().min(1).optional(),
    taskId: z.string().min(1).optional(),
    purpose: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
}).strict()
const zodSchema = AssetSchema
const DOMAIN_SPEC = Object.freeze({
    name: 'moss_multimodal_assets',
    version: 1,
    tables: Object.freeze({ assets: Object.freeze({ valueSchema: zodSchema }) }),
    layout: 'per-record',
})

function unavailableError() {
    const error = new Error('Persistent assets are unavailable: storageDomain is required.')
    error.code = 'assets_unavailable'
    return error
}
function closedError() {
    const error = new Error('Asset library is closed.')
    error.code = 'assets_closed'
    return error
}
function invalidInput(message) {
    const error = new TypeError(message)
    error.code = 'invalid_input'
    error.status = 400
    return error
}
function hash(value) {
    return createHash('sha256').update(String(value)).digest('hex').slice(0, 32)
}
function codePoints(value, max) {
    return Array.from(String(value)).slice(0, max).join('')
}
function clone(value) {
    return structuredClone(value)
}
function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
    for (const child of Object.values(value)) freeze(child)
    return Object.freeze(value)
}
function publicClone(value) {
    return freeze(clone(value))
}
function stringValue(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
}
function objectValue(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined
}
function payloadOf(result) {
    const value = objectValue(result)
    return objectValue(value?.payload) || value?.payload || value
}
function operationKind(operation, input) {
    if (operation === 'image') return 'image'
    if (operation === 'speech' || operation === 'dialogue') return 'audio'
    if (operation === 'voice-design' || operation === 'clone') return 'voice'
    if (operation === 'upload') {
        const purpose = stringValue(input?.purpose)
        return purpose === 'image' || purpose === 'audio' || purpose === 'video' ? purpose : 'file'
    }
    if (operation === 'transcribe' || operation === 'understand') return 'text'
    return 'task'
}
function titleOf(operation, input, result) {
    const payload = payloadOf(result)
    const candidates = [input?.title, input?.name, input?.filename, input?.prompt, input?.input, input?.instruction, payload?.title, payload?.name]
    const value = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim())
    return codePoints(value || operation, 100)
}
function responseIdOf(result, payload) {
    const value = objectValue(result)
    return stringValue(value?.responseId) || stringValue(value?.response_id) || stringValue(payload?.responseId) || stringValue(payload?.response_id)
}
function taskIdOf(input, result, payload) {
    const value = objectValue(result)
    return stringValue(value?.taskId) || stringValue(value?.task_id) || stringValue(payload?.taskId) || stringValue(payload?.task_id) || stringValue(input?.taskId) || stringValue(input?.task_id)
}
function textOf(result, payload) {
    const value = objectValue(result)
    const text = value?.text ?? payload?.text
    return typeof text === 'string' ? codePoints(text, 100000) : undefined
}
function statusOf(result, payload) {
    const value = objectValue(result)
    if (value?.pending === true) return 'pending'
    const status = stringValue(value?.status) || stringValue(payload?.status)
    return status ? codePoints(status, 100) : undefined
}
function kindFromResult(operation, input, result, pending) {
    const fallback = operationKind(operation, input)
    if (pending || operation === 'task') return fallback
    const value = objectValue(result)
    return KIND_SET.has(value?.kind) ? value.kind : fallback
}
function canonicalUrl(value) {
    const safe = safeHttpUrl(value)
    if (!safe) return undefined
    const parsed = new URL(safe)
    return `${parsed.origin}${parsed.pathname}`
}
function idOf(operation, input, result, payload, taskId, url) {
    if (taskId) return `task-${hash(taskId)}`
    const responseId = responseIdOf(result, payload)
    if (responseId) return `asset-${hash(`${operation}|response|${responseId}`)}`
    const stableUrl = canonicalUrl(url)
    if (stableUrl) return `asset-${hash(`${operation}|url|${stableUrl}`)}`
    const fileId = stringValue(objectValue(result)?.file_id) || stringValue(payload?.file_id)
    const voiceId = operation === 'voice-design'
        ? stringValue(objectValue(result)?.voice_id) || stringValue(payload?.voice_id)
        : stringValue(objectValue(result)?.voiceId) || stringValue(payload?.voiceId)
    const cloneId = operation === 'clone' ? stringValue(payload?.id) : undefined
    const stable = fileId || voiceId || cloneId
    return `asset-${hash(`${operation}|${stable || titleOf(operation, input, result)}`)}`
}
function entriesOf(value) {
    if (value instanceof Map) return [...value.entries()]
    if (Array.isArray(value)) return value.map((item) => Array.isArray(item) ? item : [item?.id, item])
    if (value && typeof value[Symbol.iterator] === 'function' && typeof value !== 'string') return [...value].map((item) => Array.isArray(item) ? item : [item?.id, item])
    if (value && typeof value === 'object') return Object.entries(value)
    return []
}
async function readEntries(table) {
    const value = await table.entries()
    return entriesOf(value).map(([key, value]) => [key, value]).filter(([, value]) => value && typeof value === 'object')
}
async function putRecord(table, record) {
    if (typeof table.put !== 'function') throw new Error('Asset table does not implement put().')
    if (table.put.length >= 2) return table.put(record.id, record)
    return table.put(record)
}

function sameAssetContent(left, right) {
    const keys = ['id', 'kind', 'operation', 'title', 'createdAt', 'url', 'mediaType', 'text', 'fileId', 'voiceId', 'taskId', 'purpose', 'model', 'status']
    return keys.every((key) => left[key] === right[key])
}

export function createAssetLibrary(storageDomain) {
    let opening
    let domain
    let table
    let closing = false
    let closed = false
    let closePromise
    let writeTail = Promise.resolve()

    const ensureOpen = () => {
        if (closed) return Promise.reject(closedError())
        if (!opening) {
            opening = Promise.resolve().then(() => {
                if (!storageDomain || typeof storageDomain.open !== 'function') throw unavailableError()
                return storageDomain.open(DOMAIN_SPEC)
            }).then((opened) => {
                if (!opened || typeof opened.table !== 'function') throw new Error('Storage domain returned no table().')
                domain = opened
                table = opened.table('assets')
                if (!table) throw new Error('Storage domain returned no assets table.')
                return domain
            })
        }
        return opening
    }
    const enqueue = (operation) => {
        if (closing || closed) return Promise.reject(closedError())
        const run = writeTail.then(() => ensureOpen()).then(operation)
        writeTail = run.catch(() => undefined)
        return run
    }
    const getRecord = async (id) => {
        const value = await table.get(id)
        return value && typeof value === 'object' ? value : undefined
    }

    const record = (operation, input = {}, result = {}) => {
        if (!OPERATION_SET.has(operation)) return Promise.reject(invalidInput(`operation must be one of ${OPERATIONS.join(', ')}`))
        const sourceInput = objectValue(input) || {}
        const sourceResult = objectValue(result) || {}
        return enqueue(async () => {
            const payload = payloadOf(sourceResult)
            const taskId = taskIdOf(sourceInput, sourceResult, payload)
            const pending = sourceResult.pending === true
            const url = safeHttpUrl(sourceResult.url) || safeHttpUrl(payload?.url)
            const id = idOf(operation, sourceInput, sourceResult, payload, taskId, url)
            const existing = await getRecord(id)
            const now = new Date().toISOString()
            const sourceOperation = existing && operation === 'task' && existing.operation !== 'task' ? existing.operation : operation
            const sourceKind = existing && operation === 'task' && existing.operation !== 'task' ? existing.kind : kindFromResult(operation, sourceInput, sourceResult, pending)
            const asset = {
                id,
                kind: sourceKind,
                operation: sourceOperation,
                title: existing && operation === 'task' && existing.operation !== 'task' ? existing.title : titleOf(operation, sourceInput, sourceResult),
                createdAt: existing?.createdAt || now,
                updatedAt: now,
                ...(url ? { url } : {}),
                ...(stringValue(sourceResult.mediaType) || stringValue(payload?.mediaType) ? { mediaType: codePoints(stringValue(sourceResult.mediaType) || stringValue(payload?.mediaType), 200) } : {}),
                ...(textOf(sourceResult, payload) ? { text: textOf(sourceResult, payload) } : {}),
                ...(taskId ? { taskId } : {}),
                ...(stringValue(sourceInput.purpose) ? { purpose: codePoints(sourceInput.purpose, 100) } : {}),
                ...(stringValue(sourceInput.model) || stringValue(payload?.model) ? { model: codePoints(stringValue(sourceInput.model) || stringValue(payload?.model), 200) } : {}),
                ...(statusOf(sourceResult, payload) ? { status: statusOf(sourceResult, payload) } : {}),
            }
            const fileId = stringValue(sourceResult.file_id) || stringValue(payload?.file_id)
            if (fileId) asset.fileId = fileId
            const voiceId = operation === 'voice-design'
                ? stringValue(sourceResult.voice_id) || stringValue(payload?.voice_id)
                : stringValue(sourceResult.voiceId) || stringValue(payload?.voiceId) || (operation === 'clone' ? stringValue(payload?.id) : undefined)
            if (voiceId) asset.voiceId = voiceId
            if (existing && operation === 'task' && existing.operation !== 'task') {
                for (const key of ['url', 'mediaType', 'text', 'fileId', 'voiceId', 'taskId', 'purpose', 'model', 'status']) if (asset[key] === undefined && existing[key] !== undefined) asset[key] = existing[key]
            }
            const parsed = AssetSchema.parse(asset)
            if (existing && pending && sameAssetContent(existing, parsed)) return publicClone(existing)
            await putRecord(table, parsed)
            return publicClone(parsed)
        })
    }

    const list = (query = {}) => {
        if (query === null || typeof query !== 'object' || Array.isArray(query)) return Promise.reject(invalidInput('query must be an object'))
        const kind = query.kind ?? 'all'
        const q = query.q === undefined ? '' : query.q
        const offset = query.offset === undefined ? 0 : query.offset
        const limit = query.limit === undefined ? 40 : query.limit
        if (kind !== 'all' && !KIND_SET.has(kind)) return Promise.reject(invalidInput('kind is invalid'))
        if (typeof q !== 'string') return Promise.reject(invalidInput('q must be a string'))
        if (!Number.isSafeInteger(offset) || offset < 0) return Promise.reject(invalidInput('offset must be a non-negative safe integer'))
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) return Promise.reject(invalidInput('limit must be a safe integer in [1, 100]'))
        return writeTail.then(() => ensureOpen()).then(async () => {
            const needle = q.trim().toLocaleLowerCase()
            const rows = []
            for (const [, value] of await readEntries(table)) {
                const parsed = AssetSchema.safeParse(value)
                if (!parsed.success) continue
                const asset = parsed.data
                if (kind !== 'all' && asset.kind !== kind) continue
                if (needle) {
                    const haystack = [asset.title, asset.id, asset.kind, asset.operation, asset.model, asset.text?.slice(0, 1000)].filter(Boolean).join('\n').toLocaleLowerCase()
                    if (!haystack.includes(needle)) continue
                }
                rows.push(asset)
            }
            rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
            const items = rows.slice(offset, offset + limit).map(publicClone)
            return { items, total: rows.length, offset, limit, hasMore: offset + items.length < rows.length }
        })
    }

    const remove = (id) => {
        if (typeof id !== 'string' || !id.trim()) return Promise.reject(invalidInput('id must be a non-empty string'))
        return enqueue(async () => {
            const existing = await getRecord(id)
            if (!existing) return { removed: false }
            await table.delete(id)
            return { removed: true }
        })
    }

    const close = () => {
        if (closePromise) return closePromise
        closing = true
        closePromise = (async () => {
            await writeTail
            try { await opening } catch { closed = true; return }
            if (domain && typeof domain.close === 'function') await domain.close()
            domain = undefined
            table = undefined
            closed = true
        })()
        return closePromise
    }

    return Object.freeze({ record, list, remove, close })
}

export { AssetSchema }
