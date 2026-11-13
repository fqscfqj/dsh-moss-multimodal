import test from 'node:test'
import assert from 'node:assert/strict'
import { FEATURE_DEFAULTS, TOOL_FEATURES, normalizeFeatures, requireFeature, requireAsyncSupport } from '../features.js'

test('features default to enabled and old partial configs remain compatible', () => {
    assert.deepEqual(normalizeFeatures(), FEATURE_DEFAULTS)
    const result = normalizeFeatures({ speech: false, assets: false })
    assert.equal(result.speech, false)
    assert.equal(result.image, true)
    result.image = false
    assert.equal(FEATURE_DEFAULTS.image, true)
})

test('feature settings are booleans with only declared keys', () => {
    for (const value of [null, [], false, { image: 0 }, { speech: 'false' }, { unknown: true }, JSON.parse('{"__proto__":true}')]) {
        assert.throws(() => normalizeFeatures(value), { code: 'invalid_features', status: 400 })
    }
})

test('disabled features deny execution even for previously obtained definitions', () => {
    const options = { features: normalizeFeatures({ image: false, task: false }) }
    assert.throws(() => requireFeature(options, 'image'), { code: 'feature_disabled', status: 403 })
    assert.doesNotThrow(() => requireFeature(options, 'speech'))
    assert.throws(() => requireFeature(options, 'not-a-feature'), /Unknown/)
    assert.throws(() => requireAsyncSupport(options, { async: true }), { code: 'feature_disabled' })
    assert.doesNotThrow(() => requireAsyncSupport(options, { async: false }))
})

test('each business tool has an independent declared feature', () => {
    assert.equal(Object.keys(TOOL_FEATURES).length, 12)
    for (const feature of Object.values(TOOL_FEATURES)) assert.ok(Object.hasOwn(FEATURE_DEFAULTS, feature))
    const allOff = { features: Object.fromEntries(Object.keys(FEATURE_DEFAULTS).map((key) => [key, false])) }
    for (const feature of Object.values(TOOL_FEATURES)) assert.throws(() => requireFeature(allOff, feature), { code: 'feature_disabled' })
})
