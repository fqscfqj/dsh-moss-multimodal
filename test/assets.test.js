import test from 'node:test'
import assert from 'node:assert/strict'
import { createAssetLibrary } from '../assets.js'

function fakeStorage(options = {}) {
    const records = new Map()
    const state = { opens: 0, closes: 0, puts: 0, deletes: 0, failNextPut: false, specs: [] }
    const table = {
        async get(id) { return records.get(id) && structuredClone(records.get(id)) },
        async entries() { return [...records.entries()].map(([id, value]) => [id, structuredClone(value)]) },
        async put(id, value) {
            state.puts++
            if (state.failNextPut) {
                state.failNextPut = false
                throw new Error('transient storage failure')
            }
            records.set(id, structuredClone(value))
        },
        async delete(id) { state.deletes++; return records.delete(id) },
        async update(id, value) { records.set(id, structuredClone(value)) },
    }
    const storage = {
        state,
        records,
        async open(spec) {
            state.opens++
            state.specs.push(spec)
            if (options.failOpen) throw new Error('open failed')
            return {
                table(name) {
                    assert.equal(name, 'assets')
                    return table
                },
                async close() { state.closes++ },
            }
        },
    }
    return storage
}

async function items(library, query = {}) {
    return (await library.list(query)).items
}

test('opens the prescribed storage domain lazily and persists across library instances', async () => {
    const storage = fakeStorage()
    const first = createAssetLibrary(storage)
    assert.equal(storage.state.opens, 0)
    const saved = await first.record('image', { prompt: 'Sunrise' }, { responseId: 'response-1', url: 'https://cdn.example.com/a.png', mediaType: 'image/png' })
    assert.equal(storage.state.opens, 1)
    assert.equal(storage.state.specs[0].name, 'moss_multimodal_assets')
    assert.equal(storage.state.specs[0].version, 1)
    assert.equal(storage.state.specs[0].layout, 'per-record')
    assert.ok(saved.id.startsWith('asset-'))
    await first.close()
    const second = createAssetLibrary(storage)
    assert.deepEqual((await second.list()).items[0], saved)
    await second.close()
    assert.equal(storage.state.opens, 2)
    assert.equal(storage.state.closes, 2)
})

test('async pending tasks use one stable task id and terminal task lookup preserves source metadata', async () => {
    const storage = fakeStorage()
    const library = createAssetLibrary(storage)
    const pending = await library.record('image', { prompt: 'A cat' }, { pending: true, taskId: 'remote-42', kind: 'task' })
    const duplicate = await library.record('image', { prompt: 'A cat' }, { pending: true, taskId: 'remote-42', kind: 'task' })
    assert.equal(duplicate.id, pending.id)
    assert.equal(duplicate.updatedAt, pending.updatedAt)
    assert.equal(storage.state.puts, 1)
    const terminal = await library.record('task', { taskId: 'remote-42' }, { taskId: 'remote-42', status: 'SUCCESS', payload: { url: 'https://cdn.example.com/cat.png' } })
    assert.equal(terminal.id, pending.id)
    assert.equal(terminal.operation, 'image')
    assert.equal(terminal.kind, 'image')
    assert.equal(terminal.title, 'A cat')
    assert.equal(terminal.createdAt, pending.createdAt)
    assert.equal(terminal.status, 'SUCCESS')
    assert.equal(terminal.url, 'https://cdn.example.com/cat.png')
    await library.close()
})

test('record excludes secrets, base64 and unsafe URLs while retaining bounded text', async () => {
    const storage = fakeStorage()
    const library = createAssetLibrary(storage)
    const asset = await library.record('transcribe', { input: 'ignored', apiKey: 'secret-key' }, {
        payload: { text: 'x'.repeat(100001), rawpayload: 'do-not-save' },
        url: 'http://127.0.0.1/private',
        audio_base64: 'YQ==',
    })
    assert.equal(asset.text.length, 100000)
    assert.equal('url' in asset, false)
    assert.equal('apiKey' in asset, false)
    assert.equal('audio_base64' in asset, false)
    assert.equal('rawpayload' in asset, false)
    assert.equal('payload' in asset, false)
    await library.close()
})

test('voice id extraction follows operation-specific rules', async () => {
    const storage = fakeStorage()
    const library = createAssetLibrary(storage)
    const clone = await library.record('clone', { name: 'Cloned voice' }, { payload: { id: 'voice-clone-1' } })
    const designIgnoresGenericId = await library.record('voice-design', { instruction: 'Warm voice' }, { payload: { id: 'not-a-voice-id' } })
    const design = await library.record('voice-design', { instruction: 'Bright voice' }, { payload: { voice_id: 'voice-designed-1' } })
    assert.equal(clone.voiceId, 'voice-clone-1')
    assert.equal('voiceId' in designIgnoresGenericId, false)
    assert.equal(design.voiceId, 'voice-designed-1')
    await library.close()
})

test('list filters, paginates, sorts newest first, and remove only deletes the local record', async () => {
    const storage = fakeStorage()
    const library = createAssetLibrary(storage)
    const image = await library.record('image', { title: 'Red poster' }, { url: 'https://cdn.example.com/red.png' })
    await new Promise((resolve) => setTimeout(resolve, 2))
    await library.record('speech', { title: 'Blue narration', model: 'moss-tts-1.5-flash' }, { url: 'https://cdn.example.com/blue.mp3' })
    const page = await library.list({ kind: 'audio', q: 'BLUE', offset: 0, limit: 1 })
    assert.equal(page.total, 1)
    assert.equal(page.items[0].title, 'Blue narration')
    assert.equal(page.hasMore, false)
    assert.equal(Object.isFrozen(page.items[0]), true)
    assert.throws(() => { page.items[0].title = 'changed' }, TypeError)
    assert.deepEqual(await library.remove(image.id), { removed: true })
    assert.deepEqual(await library.remove(image.id), { removed: false })
    await library.close()
})

test('writes stay serialized and a failed write does not poison later writes', async () => {
    const storage = fakeStorage()
    storage.state.failNextPut = true
    const library = createAssetLibrary(storage)
    const first = library.record('image', { title: 'first' }, { url: 'https://cdn.example.com/first.png' })
    const second = library.record('image', { title: 'second' }, { url: 'https://cdn.example.com/second.png' })
    await assert.rejects(first, /transient storage failure/)
    const saved = await second
    assert.equal(saved.title, 'second')
    assert.equal((await library.list()).total, 1)
    await library.close()
})

test('close waits for a write queued immediately before it', async () => {
    const storage = fakeStorage()
    const library = createAssetLibrary(storage)
    const pending = library.record('image', { title: 'queued' }, { url: 'https://cdn.example.com/queued.png' })
    await library.close()
    const saved = await pending
    assert.equal(saved.title, 'queued')
    assert.equal(storage.state.puts, 1)
})

test('missing storage is explicit and opening failure is not retried blindly', async () => {
    const unavailable = createAssetLibrary()
    await assert.rejects(unavailable.list(), (error) => error.code === 'assets_unavailable')
    await unavailable.close()

    const storage = fakeStorage({ failOpen: true })
    const library = createAssetLibrary(storage)
    await assert.rejects(library.list(), /open failed/)
    await assert.rejects(library.list(), /open failed/)
    assert.equal(storage.state.opens, 1)
    await library.close()
})

test('list validates bounds and returns clones without exposing persisted objects', async () => {
    const storage = fakeStorage()
    const library = createAssetLibrary(storage)
    await library.record('upload', { filename: 'pic.png', purpose: 'image' }, { file_id: 'file-1' })
    for (const query of [{ offset: -1 }, { limit: 0 }, { limit: 101 }, { kind: 'unknown' }, { q: 1 }]) await assert.rejects(library.list(query), (error) => error.code === 'invalid_input')
    const result = await library.list()
    assert.throws(() => { result.items[0].title = 'mutated outside' }, TypeError)
    assert.equal((await library.list()).items[0].title, 'pic.png')
    await library.close()
})
