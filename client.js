window.__ModuleLoader__.load({
    id: 'dsh-moss-multimodal',
    factory(require) {
        const React = require('react')
        const h = React.createElement
        const BASE = '/x-moss-multimodal'
        const pkg = 'dsh-moss-multimodal'
        const NS = 'mossMultimodal'
        const LocaleContext = React.createContext(null)
        const FeatureContext = React.createContext({})
        const FEATURE_KEYS = ['image', 'speech', 'transcribe', 'dialogue', 'clone', 'design', 'understand', 'voices', 'upload', 'task', 'assets']
        const FEATURE_DEFAULTS = Object.fromEntries(FEATURE_KEYS.map((key) => [key, true]))
        function normalizeFeatures(features) { return { ...FEATURE_DEFAULTS, ...(features && typeof features === 'object' ? Object.fromEntries(FEATURE_KEYS.map((key) => [key, features[key] !== false])) : {}) } }
        function useFeatures() { return React.useContext(FeatureContext) }
        function featureLabel(t, key) { return t(`${key}Feature`) }
        const words = {
            workbench: ['MOSS 工作台', 'MOSS workbench'], workspaceKicker: ['多模态创作空间', 'MULTIMODAL WORKSPACE'], workspaceSubtitle: ['集中处理生成、理解与本地资产。', 'Generate, understand and organize your local assets in one place.'], settings: ['MOSS 设置', 'MOSS settings'], openSettings: ['打开设置', 'Open settings'], back: ['返回工作台', 'Back to workbench'], assets: ['资产浏览', 'Assets'], featureSwitches: ['功能开关', 'Feature switches'], enabled: ['已启用', 'Enabled'], disabled: ['已停用', 'Disabled'], noFeature: ['所有工作台功能均已停用；可在设置中重新启用。', 'All workbench features are disabled; re-enable one in settings.'], assetSearch: ['搜索资产', 'Search assets'], assetKind: ['资产类型', 'Asset type'], allAssets: ['全部', 'All'], imageAsset: ['图像', 'Image'], audioAsset: ['音频', 'Audio'], videoAsset: ['视频', 'Video'], fileAsset: ['文件', 'File'], voiceAsset: ['音色', 'Voice'], textAsset: ['文本', 'Text'], taskAsset: ['任务', 'Task'], assetRefresh: ['刷新资产', 'Refresh assets'], assetEmpty: ['暂无资产记录。', 'No assets recorded.'], assetLoading: ['加载资产中…', 'Loading assets…'], assetPrev: ['上一页', 'Previous'], assetNext: ['下一页', 'Next'], assetDelete: ['删除本地记录', 'Delete local record'], assetDeletePrompt: ['确认删除这条本地资产记录？云端文件不会被删除。', 'Delete this local asset record? Cloud files are not deleted.'], assetCancel: ['取消', 'Cancel'], assetConfirm: ['确认删除', 'Confirm delete'], assetLocalOnly: ['仅删除本地索引，不会删除云端文件。', 'Deletes only the local index; cloud files are not deleted.'], assetNoPreview: ['暂无可预览 URL', 'No preview URL'], assetSource: ['来源', 'Source'], assetOperation: ['操作', 'Operation'], assetCreated: ['创建时间', 'Created'], assetsPerPage: ['每页 20 条', '20 per page'], assetCount: ['{count} 条资产', '{count} assets'], assetSelected: ['已选择 {count} 条', '{count} selected'], assetSelect: ['选择资产', 'Select asset'], assetUnselect: ['取消选择', 'Unselect asset'], assetSelectAll: ['全选当前页', 'Select current page'], assetClearSelection: ['清除选择', 'Clear selection'], assetDeleteSelected: ['批量删除', 'Delete selected'], assetDeleteSelectedPrompt: ['确认删除已选择的 {count} 条本地记录？云端文件不会被删除。', 'Delete the {count} selected local records? Cloud files are not deleted.'], assetDeleteSelectedConfirm: ['确认批量删除', 'Confirm bulk delete'], assetDeleted: ['已清理 {count} 条本地记录。', 'Cleaned up {count} local records.'], assetsOverview: ['本地资产索引', 'Local asset index'], assetsFilterHint: ['按类型或关键词快速定位', 'Filter by type or keyword'], uploadFeature: ['媒体上传', 'Media upload'], taskFeature: ['异步任务', 'Async tasks'], imageFeature: ['图像生成', 'Image generation'], speechFeature: ['语音生成', 'Speech generation'], transcribeFeature: ['语音转写', 'Transcription'], dialogueFeature: ['多人语音', 'Dialogue'], cloneFeature: ['音色克隆', 'Voice cloning'], designFeature: ['音色设计', 'Voice design'], understandFeature: ['视觉理解', 'Visual understanding'], voicesFeature: ['音色列表', 'Voices'], assetsFeature: ['资产浏览', 'Asset browser'],
            image: ['图像生成', 'Image generation'], speech: ['语音生成', 'Speech generation'], transcribe: ['语音转写', 'Transcription'], dialogue: ['多人语音', 'Dialogue'], clone: ['音色克隆', 'Voice cloning'], design: ['音色设计', 'Voice design'], understand: ['视觉理解', 'Visual understanding'], voices: ['音色列表', 'Voices'],
            configured: ['密钥已配置', 'Key configured'], unconfigured: ['未配置 API Key', 'API key not configured'], loading: ['读取中…', 'Loading…'], failed: ['请求失败（HTTP {status}）', 'Request failed (HTTP {status})'], done: ['已完成。', 'Completed.'], working: ['处理中…', 'Processing…'], asyncSubmitted: ['异步任务已提交，正在等待结果。', 'Async task submitted; waiting for the result.'], stoppedWaiting: ['已停止本地等待，云端任务仍会继续。', 'Local waiting stopped; the cloud task continues.'], stopWaiting: ['停止等待', 'Stop waiting'], taskFailed: ['任务失败。', 'Task failed.'], retry: ['重新读取', 'Retry'],
            service: ['服务连接', 'Connection'], apiUrl: ['API 地址', 'API URL'], credential: ['凭据状态', 'Credential status'], credentialName: ['凭据键名：{name}', 'Credential reference: {name}'], replacement: ['替换 API Key', 'Replace API key'], saveKey: ['保存密钥', 'Save key'], clear: ['清除', 'Clear'], probe: ['测试连接', 'Test connection'], saved: ['配置已保存。', 'Settings saved.'], keySaved: ['密钥已保存。', 'Key saved.'], keyCleared: ['插件密钥已清除；环境变量回退保持不变。', 'Plugin key cleared; environment fallback is unchanged.'], clearPluginKey: ['清除插件密钥', 'Clear plugin key'], sourcePlugin: ['插件记录', 'Plugin record'], sourceReference: ['环境变量引用', 'Environment reference'], sourceNone: ['无', 'None'], restored: ['已恢复默认配置。', 'Defaults restored.'], saveWarning: ['保存或恢复配置会中止正在运行的生成。', 'Saving or resetting settings stops active generations.'], defaults: ['默认参数', 'Defaults'], runtime: ['运行参数', 'Runtime'], save: ['保存配置', 'Save settings'], restore: ['恢复默认', 'Restore defaults'], timeout: ['请求超时（毫秒）', 'Request timeout (ms)'], polling: ['轮询间隔（毫秒）', 'Polling interval (ms)'],
            model: ['模型', 'Model'], imageModel: ['图像模型', 'Image model'], speechModel: ['语音模型', 'Speech model'], voiceModel: ['音色模型', 'Voice model'], vlModel: ['视觉模型', 'Vision model'], transcriptionModel: ['转写模型', 'Transcription model'], dialogueModel: ['多人语音模型', 'Dialogue model'], invalidDuration: ['参考音频必须不超过 30 秒。', 'Reference audio must be no longer than 30 seconds.'], metadataError: ['无法读取音频时长，请选择有效音频。', 'Could not read audio duration. Choose a valid audio file.'], size: ['图像尺寸', 'Image size'], format: ['音频格式', 'Audio format'], enhance: ['增强提示词', 'Enhance prompt'], watermark: ['保留可见水印', 'Visible watermark'],
            prompt: ['提示词', 'Prompt'], negative: ['负向提示词（可选）', 'Negative prompt (optional)'], text: ['文本', 'Text'], voice: ['音色', 'Voice'], selectVoice: ['选择音色', 'Select voice'], voiceId: ['音色 ID', 'Voice ID'], customVoice: ['其他音色 ID', 'Other voice ID'], async: ['异步任务', 'Asynchronous task'], generate: ['生成', 'Generate'], create: ['创建音色', 'Create voice'], instruction: ['指令', 'Instruction'], previewText: ['试听文本', 'Preview text'], description: ['音色描述', 'Voice description'], name: ['名称（可选）', 'Name (optional)'], reusable: ['创建可复用音色', 'Create reusable voice'],
            source: ['素材来源', 'Source'], upload: ['上传文件', 'Upload file'], uploaded: ['已上传', 'Uploaded'], uploadFile: ['选择文件', 'Choose file'], fileId: ['文件 ID', 'File ID'], url: ['URL', 'URL'], audio: ['音频', 'Audio'], video: ['视频', 'Video'], pictures: ['图片', 'Images'], media: ['媒体类型', 'Media type'], language: ['语言', 'Language'], automatic: ['自动检测', 'Auto detect'], chinese: ['中文', 'Chinese'], english: ['英语', 'English'], japanese: ['日语', 'Japanese'], korean: ['韩语', 'Korean'], french: ['法语', 'French'], german: ['德语', 'German'], spanish: ['西班牙语', 'Spanish'],
            startTranscribe: ['开始转写', 'Transcribe'], startUnderstand: ['开始理解', 'Analyze'], imageUrls: ['图片 URL（每行一个，最多 5 个）', 'Image URLs (one per line, up to 5)'], videoUrl: ['视频 URL', 'Video URL'], fileIds: ['文件 ID（每行一个）', 'File IDs (one per line)'], uploadedFile: ['已上传文件：{name}', 'Uploaded file: {name}'], invalidFile: ['没有选择文件。', 'No file selected.'], fileTooLarge: ['文件超过客户端上传上限（{size} MB）。', 'File exceeds the client upload limit ({size} MB).'], noFileId: ['上传响应没有返回文件 ID。', 'Upload response contains no file ID.'], uploadError: ['读取文件失败。', 'Could not read file.'], maxImages: ['最多允许 5 张图片。', 'At most 5 images are allowed.'],
            speakers: ['说话人', 'Speakers'], speaker: ['说话人 ID', 'Speaker ID'], addSpeaker: ['添加说话人', 'Add speaker'], remove: ['移除', 'Remove'], segments: ['对话片段', 'Segments'], addSegment: ['添加片段', 'Add segment'], invalidSpeakers: ['说话人 ID 必须唯一且不能为空，每位说话人均需选择音色。', 'Speaker IDs must be unique and nonempty, with a voice selected for each.'], invalidSegments: ['每个片段需有文本并关联有效说话人。', 'Each segment needs text and a valid speaker.'],
            result: ['结果', 'Result'], task: ['任务查询', 'Task lookup'], taskId: ['任务 ID', 'Task ID'], query: ['查询任务', 'Query task'], raw: ['原始响应', 'Raw response'], openResult: ['打开结果', 'Open result'], copy: ['复制', 'Copy'], copied: ['已复制。', 'Copied.'], copyFailed: ['复制失败。', 'Copy failed.'], refresh: ['刷新列表', 'Refresh'], voiceCount: ['{count} 个音色', '{count} voices'], noVoices: ['暂无音色。', 'No voices available.'], unnamed: ['未命名音色', 'Unnamed voice'], reference: ['参考音频', 'Reference audio'], cloneLimit: ['最大 10 MB，最长 30 秒。', 'Up to 10 MB and 30 seconds.'], incompatible: ['返回的结果类型无法预览。', 'This result type has no preview.'], notConfigured: ['请先配置 API Key。', 'Configure an API key first.'],
        }
        const en = Object.fromEntries(Object.entries(words).map(([key, values]) => [key, values[1]]))
        const zh = Object.fromEntries(Object.entries(words).map(([key, values]) => [key, values[0]]))
        const theme = {
            text: 'var(--dsw-alias-label-primary, #202124)', muted: 'var(--dsw-alias-label-secondary, #6b7280)', bg: 'var(--dsw-alias-bg-base, #ffffff)', layer: 'var(--dsw-alias-bg-layer-1, #f7f8fa)', layer2: 'var(--dsw-alias-bg-layer-2, #ffffff)', border: 'var(--dsw-alias-border-l1, #e5e7eb)', borderStrong: 'var(--dsw-alias-border-l2, #cbd5e1)', accent: 'var(--dsw-alias-brand-primary, #287f8d)', accentSoft: 'color-mix(in srgb, var(--dsw-alias-brand-primary, #287f8d) 10%, transparent)', success: 'var(--dsw-alias-state-success-primary, #2f855a)', error: 'var(--dsw-alias-state-error-primary, #c53030)', warn: 'var(--dsw-alias-state-warn-primary, #b7791f)',
        }
        const styles = {
            page: { height: '100%', minHeight: 0, minWidth: 0, overflow: 'auto', color: theme.text, background: theme.layer, fontSize: 13, overflowWrap: 'anywhere' },
            content: { maxWidth: 1180, minWidth: 0, boxSizing: 'border-box', margin: '0 auto', padding: 'calc(var(--dsh-frame-top-clearance, 0px) + 30px) 24px 48px' },
            header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 26 },
            title: { margin: 0, fontSize: 27, lineHeight: 1.25, fontWeight: 680, letterSpacing: 0 }, kicker: { color: theme.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 }, subtitle: { margin: '7px 0 0', color: theme.muted, lineHeight: 1.5 }, statusPill: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: `1px solid ${theme.border}`, borderRadius: 999, background: theme.layer2, color: theme.muted, whiteSpace: 'nowrap' }, nav: { display: 'flex', gap: 3, overflowX: 'auto', padding: 4, border: `1px solid ${theme.border}`, borderRadius: 10, background: theme.layer2, marginBottom: 22 },
            tab: { flex: '0 0 auto', whiteSpace: 'nowrap', border: 0, borderRadius: 7, background: 'transparent', color: theme.muted, padding: '9px 13px', font: 'inherit', cursor: 'pointer' },
            activeTab: { color: theme.text, fontWeight: 650, background: theme.accentSoft }, grid: { display: 'block', minWidth: 0 }, featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '4px 24px' }, settingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '0 24px' },
            section: { minWidth: 0, padding: 22, marginBottom: 18, border: `1px solid ${theme.border}`, borderRadius: 12, background: theme.layer2 }, sectionTitle: { margin: '0 0 18px', fontSize: 15, fontWeight: 650 }, label: { display: 'block', color: theme.muted, fontSize: 12, marginBottom: 6 },
            input: { width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', border: `1px solid ${theme.borderStrong}`, background: theme.layer2, color: theme.text, padding: '9px 10px', borderRadius: 6, font: 'inherit' },
            area: { width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 112, resize: 'vertical', border: `1px solid ${theme.borderStrong}`, background: theme.layer2, color: theme.text, padding: '9px 10px', borderRadius: 6, font: 'inherit', lineHeight: 1.5 },
            row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 12 }, field: { marginBottom: 14, minWidth: 0 }, buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', minWidth: 0 },
            button: { maxWidth: '100%', border: `1px solid ${theme.borderStrong}`, background: theme.layer2, color: theme.text, padding: '8px 12px', borderRadius: 6, font: 'inherit', cursor: 'pointer', whiteSpace: 'normal' }, primary: { borderColor: theme.accent, color: theme.accent, fontWeight: 600 },
            hint: { color: theme.muted, fontSize: 12, lineHeight: 1.5, overflowWrap: 'anywhere' }, status: { marginTop: 12, minHeight: 20, color: theme.muted, whiteSpace: 'pre-wrap', lineHeight: 1.5 }, result: { marginTop: 20, borderTop: `1px solid ${theme.border}`, paddingTop: 18, minWidth: 0 }, assetToolbar: { display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', paddingBottom: 18, borderBottom: `1px solid ${theme.border}` }, assetToolbarField: { flex: '1 1 260px', minWidth: 180 }, assetToolbarKind: { flex: '0 1 190px', minWidth: 160 }, assetActions: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }, assetSummary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '16px 0 2px' }, assetList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 14, marginTop: 16 }, assetItem: { minWidth: 0, overflow: 'hidden', border: `1px solid ${theme.border}`, background: theme.layer, borderRadius: 10, transition: 'border-color 120ms ease, box-shadow 120ms ease' }, assetSelected: { borderColor: theme.accent, boxShadow: `0 0 0 2px ${theme.accentSoft}` }, assetCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px 0' }, assetCheck: { display: 'inline-flex', alignItems: 'center', gap: 8, color: theme.muted, fontSize: 12, cursor: 'pointer' }, assetBadge: { display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 999, background: theme.accentSoft, color: theme.accent, fontSize: 11, fontWeight: 650 }, assetPreview: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 118, margin: '10px 14px 0', borderRadius: 7, overflow: 'hidden', background: theme.layer2 }, assetThumb: { display: 'block', width: '100%', height: 178, objectFit: 'contain', background: theme.layer2 }, assetMedia: { display: 'block', width: '100%', maxWidth: '100%', margin: 0 }, assetMeta: { display: 'grid', gap: 6, minWidth: 0 }, assetText: { margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.5 }, assetPlaceholder: { color: theme.muted, fontSize: 12, textAlign: 'center', padding: 20 }, assetBody: { display: 'grid', gap: 7, minWidth: 0, padding: '12px 14px 14px' }, assetTitle: { margin: 0, fontSize: 14, lineHeight: 1.35, fontWeight: 650 }, assetAction: { padding: '6px 9px', fontSize: 12 }, assetBulkConfirm: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 14, padding: '12px 14px', border: `1px solid ${theme.warn}`, borderRadius: 8, background: theme.layer }, confirm: { margin: '0 14px 14px', paddingTop: 12, borderTop: `1px solid ${theme.border}` }, assetPagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
            media: { display: 'block', width: '100%', maxWidth: '100%', maxHeight: 440, objectFit: 'contain', background: theme.layer }, code: { fontFamily: 'ui-monospace, monospace', fontSize: 12, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }, badge: { display: 'inline-flex', alignItems: 'center', gap: 6, color: theme.muted, fontSize: 12 },
        }
        const MODELS = { imageModel: ['moss-image-base-1.0', 'moss-image-sft-1.0', 'moss-image-base-1.0-2026-10-09', 'moss-image-sft-1.0-2026-10-09'], speechModel: ['moss-tts-1.5-flash', 'moss-tts-1.0-pro', 'moss-tts-1.5-flash-2026-06-26', 'moss-tts-1.0-pro-2026-02-07'], voiceModel: ['moss-voice-generator-1.0', 'moss-voice-generator-1.0-2026-07-22'], dialogueModel: ['moss-ttsd-1.0', 'moss-ttsd-1.0-2026-03-20'], vlModel: ['moss-vl-1.0', 'moss-vl-1.0-2026-07-08'], transcriptionModel: ['moss-transcribe-1.0', 'moss-transcribe-diarize-pro'] }
        let currentModels = MODELS
        function resolveModels(models) {
            if (!models || typeof models !== 'object') return MODELS
            const map = { image: 'imageModel', speech: 'speechModel', voice: 'voiceModel', dialogue: 'dialogueModel', vl: 'vlModel', transcription: 'transcriptionModel' }
            const next = { ...MODELS }
            for (const [source, field] of Object.entries(map)) if (Array.isArray(models[source]) && models[source].length) next[field] = models[source].filter((item) => typeof item === 'string')
            return next
        }
        const SIZES = ['1024x1024', '1280x720', '720x1280', '1536x1024']
        const FORMATS = ['mp3', 'wav', 'flac', 'opus', 'aac']
        let clientContext
        let disposed = false
        const activeRequests = new Set()
        function useT() { return React.useContext(LocaleContext) }
        function Root({ component: Component, ...props }) {
            const locale = clientContext.locale
            React.useSyncExternalStore((notify) => locale.subscribe(notify), () => locale.getSnapshot())
            return h(LocaleContext.Provider, { value: locale.bind(NS) }, h(Component, props))
        }
        async function call(path, options = {}) {
            const controller = new AbortController()
            activeRequests.add(controller)
            try {
                const url = new URL(path, 'http://moss')
                const rpc = clientContext.connection?.rpc
                if (!rpc?.call) throw new Error('MOSS Connection RPC 尚未就绪。')
                const reply = await rpc.call(BASE, url.pathname.replace(/^\//u, ''), { method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : {}, query: Object.fromEntries(url.searchParams) }, controller.signal)
                if (!reply.ok) throw new Error(reply.error?.message || 'MOSS 请求失败。')
                return reply.value
            } finally { activeRequests.delete(controller) }
        }
        const post = (path, body) => call(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        const lines = (value) => value.split(/\s+/u).filter(Boolean)
        const option = (value, label = value) => h('option', { key: value, value }, label)
        const Button = ({ children, primary, disabled, onClick, title, ariaLabel, style }) => h('button', { type: 'button', title, 'aria-label': ariaLabel, disabled, onClick, style: { ...styles.button, ...(primary ? styles.primary : {}), ...(style || {}), ...(disabled ? { opacity: 0.5, cursor: 'default' } : {}) } }, children)
        function Field({ label, children, hint }) {
            const id = React.useId()
            const control = React.isValidElement(children) && children.type !== 'div' ? React.cloneElement(children, { id }) : children
            return h('div', { style: styles.field }, h('label', { htmlFor: id, style: styles.label }, label), control, hint ? h('div', { style: styles.hint }, hint) : null)
        }
        const TextInput = (props) => h('input', { ...props, style: { ...styles.input, ...(props.style || {}) } })
        const TextArea = (props) => h('textarea', { ...props, style: styles.area })
        const Select = ({ values = [], value, ...props }) => {
            const options = [], seen = new Set()
            for (const item of values) {
                const optionValue = typeof item === 'object' ? item?.value : item
                if (optionValue === undefined || optionValue === null || seen.has(optionValue)) continue
                seen.add(optionValue)
                options.push(typeof item === 'object' ? { value: optionValue, label: item.label ?? optionValue } : { value: optionValue, label: optionValue })
            }
            if (value !== undefined && value !== null && !seen.has(value)) options.unshift({ value, label: value })
            return h('select', { ...props, value, style: styles.input }, options.map((item) => option(item.value, item.label)))
        }
        function Check({ label, value, onChange, disabled = false }) { return h('label', { style: { ...styles.badge, display: 'flex', marginBottom: 14, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1 } }, h('input', { type: 'checkbox', role: 'switch', checked: Boolean(value), disabled, onChange: (e) => onChange(e.target.checked) }), label) }
        function useDefault(value) {
            const [state, setState] = React.useState(value)
            const dirty = React.useRef(false)
            React.useEffect(() => { if (!dirty.current) setState(value) }, [value])
            return [state, (next) => { dirty.current = true; setState(next) }]
        }
        function useOperation() {
            const [busy, setBusy] = React.useState(false)
            const [message, setMessage] = React.useState(null)
            const [result, setResult] = React.useState(null)
            const [waitingTask, setWaitingTask] = React.useState(false)
            const running = React.useRef(false)
            const generation = React.useRef(0)
            const alive = React.useRef(true)
            React.useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current++ } }, [])
            const stop = () => {
                generation.current++; running.current = false
                if (alive.current) { setWaitingTask(false); setBusy(false); setMessage({ key: 'stoppedWaiting' }) }
            }
            const run = async (operation, success = 'done') => {
                if (running.current || disposed) return
                const token = ++generation.current
                const active = () => alive.current && !disposed && token === generation.current
                running.current = true; setWaitingTask(false)
                setBusy(true); setResult(null); setMessage({ key: 'working' })
                try {
                    let data = await operation()
                    if (!active()) return data
                    if (data?.pending && data.taskId) {
                        const taskId = data.taskId
                        const deadline = Date.now() + 3600000
                        setResult(data); setWaitingTask(true); setMessage({ key: 'asyncSubmitted' })
                        let waitMs = Math.min(60000, Math.max(500, (Number(data.retryAfter) || 2) * 1000))
                        while (active()) {
                            if (Date.now() >= deadline) throw new Error(`${taskId}: task wait timeout; use task query to continue.`)
                            await new Promise((resolve) => setTimeout(resolve, waitMs))
                            if (!active()) break
                            const task = await call(`/task?id=${encodeURIComponent(taskId)}`)
                            if (!active()) break
                            const taskPayload = task.payload || task
                            const status = String(taskPayload.status || task.status || '').toLowerCase()
                            const failed = ['failed', 'error', 'canceled', 'cancelled'].includes(status)
                            const terminal = failed || ['success', 'succeeded', 'completed'].includes(status)
                            data = { ...task, taskId, pending: !terminal }
                            setResult(data)
                            if (terminal) { setMessage({ key: failed ? 'taskFailed' : success }); break }
                            waitMs = Math.min(60000, Math.max(500, (Number(task.retryAfter ?? taskPayload.retry_after) || waitMs / 1000) * 1000))
                        }
                    } else {
                        if (data !== undefined) setResult(data)
                        const status = String(data?.payload?.status || data?.status || '').toLowerCase()
                        setMessage({ key: ['failed', 'error', 'canceled', 'cancelled'].includes(status) ? 'taskFailed' : success })
                    }
                    return data
                } catch (error) { if (active()) setMessage({ text: error.message }) }
                finally {
                    if (token === generation.current) {
                        running.current = false
                        if (alive.current && !disposed) { setWaitingTask(false); setBusy(false) }
                    }
                }
            }
            return { busy, waiting: waitingTask, message, result, run, stop }
        }
        function Status({ op }) {
            const t = useT()
            return h('div', { role: 'status', 'aria-live': 'polite', style: styles.status }, op.message?.text || (op.message?.key ? t(op.message.key) : ''))
        }
        function Output({ op, kind }) { const t = useT(); return h(React.Fragment, null, h(Status, { op }), op.waiting ? h(Button, { disabled: false, onClick: op.stop }, t('stopWaiting')) : null, h(Result, { data: op.result, kind })) }
        function Model({ field, value, onChange }) { const t = useT(); return h(Field, { label: t(field) }, h(Select, { value, values: currentModels[field] || MODELS[field], onChange: (e) => onChange(e.target.value) })) }
        function AudioOptions({ model, setModel, format, setFormat, asyncMode, setAsync, modelField = 'speechModel' }) {
            const t = useT(), features = useFeatures()
            React.useEffect(() => { if (!features.task && asyncMode) setAsync(false) }, [features.task, asyncMode, setAsync])
            return h(React.Fragment, null, h('div', { style: styles.row }, h(Model, { field: modelField, value: model, onChange: setModel }), h(Field, { label: t('format') }, h(Select, { value: format, values: FORMATS, onChange: (e) => setFormat(e.target.value) }))), h(Check, { label: t('async'), value: asyncMode, disabled: !features.task, onChange: setAsync }))
        }
        function VoiceSelect({ value, onChange, voices, label }) {
            const t = useT()
            const ids = voices.map((voice) => voice.id || voice.voice_id).filter(Boolean)
            const selected = !value || ids.includes(value) ? value : '__custom'
            return h('div', { style: styles.field }, h('label', { style: styles.label }, label || t('voice'), h('select', { value: selected, onChange: (e) => onChange(e.target.value === '__custom' ? ' ' : e.target.value), style: { ...styles.input, marginTop: 6 } }, option('', t('selectVoice')), ...voices.map((voice) => option(voice.id || voice.voice_id, `${voice.name || t('unnamed')} · ${voice.id || voice.voice_id}`)), option('__custom', t('customVoice')))), selected === '__custom' ? h(TextInput, { 'aria-label': t('voiceId'), value: value.trim(), onChange: (e) => onChange(e.target.value || ' '), style: { marginTop: 8 } }) : null)
        }
        function Result({ data, kind }) {
            const t = useT()
            if (!data) return null
            const payload = data.payload || data
            const returnedType = String(data.mediaType || data.media_type || data.contentType || data.kind || data.type || '')
            const mediaKind = returnedType.startsWith('audio') ? 'audio' : returnedType.startsWith('image') ? 'image' : returnedType.startsWith('video') ? 'video' : kind
            const rawUrl = data.url || payload.url
            const url = typeof rawUrl === 'string' && /^(https?:|data:(audio|image|video)\/|blob:)/iu.test(rawUrl) ? rawUrl : null
            const voiceId = data.voiceId || payload.voice_id
            const taskId = data.taskId || payload.task_id || payload.taskId
            const text = data.text || payload.text
            const preview = !url ? null : mediaKind === 'audio' ? h('audio', { controls: true, preload: 'none', src: url, style: { width: '100%', maxWidth: '100%' } }) : mediaKind === 'image' ? h('img', { src: url, alt: t('result'), style: styles.media }) : mediaKind === 'video' ? h('video', { controls: true, preload: 'metadata', src: url, style: styles.media }) : h('p', { style: styles.hint }, t('incompatible'))
            return h('section', { style: styles.result, 'aria-label': t('result') }, preview,
                url ? h('p', { style: styles.hint }, h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', style: { color: theme.accent } }, t('openResult'))) : null,
                text ? h('pre', { style: { ...styles.code, fontFamily: 'inherit', lineHeight: 1.6 } }, text) : null,
                taskId ? h('p', { style: styles.hint }, t('taskId'), ': ', h('code', { style: styles.code }, taskId)) : null,
                voiceId ? h('p', { style: styles.hint }, t('voiceId'), ': ', h('code', { style: styles.code }, voiceId)) : null,
                h('details', null, h('summary', { style: { cursor: 'pointer', color: theme.muted } }, t('raw')), h('pre', { style: { ...styles.code, maxHeight: 280, overflow: 'auto', color: theme.muted } }, JSON.stringify(payload, null, 2))))
        }
        function sourceLabel(t, source) { return t(source === 'plugin-record' ? 'sourcePlugin' : source === 'reference' ? 'sourceReference' : 'sourceNone') }
        function Header({ state, onSettings }) {
            const t = useT()
            return h('header', { style: styles.header }, h('div', null, h('div', { style: styles.kicker }, t('workspaceKicker')), h('h1', { style: styles.title }, t('workbench')), h('p', { style: styles.subtitle }, t('workspaceSubtitle'))), h('div', { style: styles.buttonRow }, h('span', { style: styles.statusPill }, h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: state.configured ? theme.success : theme.warn } }), t(state.configured ? 'configured' : 'unconfigured'), ` · ${sourceLabel(t, state.keySource)}`, state.keyHint ? ` · ${state.keyHint}` : ''), h(Button, { onClick: onSettings }, t('openSettings'))))
        }
        function SettingsPage({ onBack }) {
            const t = useT()
            const [state, setState] = React.useState(null)
            const [form, setForm] = React.useState({})
            const [key, setKey] = React.useState('')
            const op = useOperation()
            const refresh = async () => { const data = await call('/state'); currentModels = resolveModels(data.models); setState({ ...data, features: normalizeFeatures(data.features || data.value?.features) }); setForm({ ...(data.value || {}), features: normalizeFeatures(data.features || data.value?.features) }); return undefined }
            React.useEffect(() => { void op.run(refresh) }, [])
            const patch = (name, value) => setForm((prev) => ({ ...prev, [name]: value }))
            const selectField = (name, values) => h(Field, { key: name, label: t(name === 'imageSize' ? 'size' : name === 'audioFormat' ? 'format' : name) }, h(Select, { value: form[name] || '', values: values || currentModels[name] || MODELS[name], onChange: (e) => patch(name, e.target.value) }))
            if (!state) return h('div', { style: styles.page }, h('div', { style: styles.content }, h(Button, { disabled: op.busy, onClick: () => op.run(refresh) }, t(op.busy ? 'loading' : 'retry')), h(Status, { op })))
            return h('div', { style: styles.page }, h('div', { style: styles.content },
                h('header', { style: styles.header }, h('h1', { style: styles.title }, t('settings')), onBack ? h(Button, { onClick: onBack }, t('back')) : null),
                h('fieldset', { disabled: op.busy, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } },
                    h('div', { style: styles.grid },
                        h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('service')),
                            h(Field, { label: t('apiUrl') }, h(TextInput, { type: 'url', value: form.baseUrl || '', onChange: (e) => patch('baseUrl', e.target.value) })),
                            h(Field, { label: t('credential'), hint: `${t('credentialName', { name: state.credentialKey })} · ${sourceLabel(t, state.keySource)}` }, h('span', { style: styles.badge }, t(state.configured ? 'configured' : 'unconfigured'))),
                            h(Field, { label: t('replacement') }, h(TextInput, { type: 'password', value: key, autoComplete: 'off', onChange: (e) => setKey(e.target.value) })),
                            h('div', { style: styles.buttonRow }, h(Button, { disabled: op.busy || !key.trim(), onClick: () => op.run(async () => { await post('/key', { value: key }); setKey(''); await refresh() }, 'keySaved') }, t('saveKey')), h(Button, { disabled: op.busy || !state.hasStoredKey, onClick: () => op.run(async () => { await call('/key', { method: 'DELETE' }); await refresh() }, 'keyCleared') }, t('clearPluginKey')), h(Button, { disabled: op.busy || !state.configured, onClick: () => op.run(async () => { const data = await call('/probe'); if (data.message) return { text: data.message }; return data }) }, t('probe')))),
                        h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('defaults')), h('div', { style: styles.settingsGrid }, ...Object.entries(currentModels).map(([field, models]) => selectField(field, models)), selectField('imageSize', SIZES), selectField('audioFormat', FORMATS)), h('div', { style: styles.featureGrid }, h(Check, { label: t('enhance'), value: Boolean(form.imagePromptEnhance), onChange: (value) => patch('imagePromptEnhance', value) }), h(Check, { label: t('watermark'), value: Boolean(form.imageWatermark), onChange: (value) => patch('imageWatermark', value) }))),
                        h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('featureSwitches')), h('div', { style: styles.featureGrid }, ...FEATURE_KEYS.map((key) => h(Check, { key, label: `${featureLabel(t, key)} · ${form.features?.[key] !== false ? t('enabled') : t('disabled')}`, value: form.features?.[key] !== false, onChange: (value) => patch('features', { ...normalizeFeatures(form.features), [key]: value }) })))),
                         h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('runtime')), h('div', { style: styles.row }, ...[['timeoutMs', 'timeout', 1000], ['pollIntervalMs', 'polling', 500]].map(([name, label, min]) => h(Field, { key: name, label: t(label) }, h(TextInput, { type: 'number', min, step: 500, value: form[name] ?? '', onChange: (e) => patch(name, Number(e.target.value)) })))))),
                    h('p', { style: styles.hint }, t('saveWarning')),
                    h('div', { style: { ...styles.buttonRow, marginTop: 20 } }, h(Button, { primary: true, disabled: op.busy || !form.baseUrl || !Number.isFinite(form.timeoutMs) || form.timeoutMs < 1000 || !Number.isFinite(form.pollIntervalMs) || form.pollIntervalMs < 500, onClick: () => op.run(async () => { await post('/config', { ...form, expectedRevision: state.revision }); await refresh() }, 'saved') }, t(op.busy ? 'working' : 'save')), h(Button, { disabled: op.busy, onClick: () => op.run(async () => { await call('/config', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expectedRevision: state.revision }) }); await refresh() }, 'restored') }, t('restore')))), h(Output, { op })))
        }
        function ImageTab({ defaults }) {
            const t = useT(), op = useOperation()
            const [prompt, setPrompt] = React.useState(''), [negative, setNegative] = React.useState('')
            const [model, setModel] = useDefault(defaults.imageModel), [size, setSize] = useDefault(defaults.imageSize)
            const [enhance, setEnhance] = useDefault(Boolean(defaults.imagePromptEnhance)), [watermark, setWatermark] = useDefault(Boolean(defaults.imageWatermark))
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('image')), h(Field, { label: t('prompt') }, h(TextArea, { value: prompt, onChange: (e) => setPrompt(e.target.value) })), h('div', { style: styles.row }, h(Model, { field: 'imageModel', value: model, onChange: setModel }), h(Field, { label: t('size') }, h(Select, { value: size, values: SIZES, onChange: (e) => setSize(e.target.value) }))), h(Field, { label: t('negative') }, h(TextInput, { value: negative, onChange: (e) => setNegative(e.target.value) })), h(Check, { label: t('enhance'), value: enhance, onChange: setEnhance }), h(Check, { label: t('watermark'), value: watermark, onChange: setWatermark }), h(Button, { primary: true, disabled: op.busy || !prompt.trim(), onClick: () => op.run(() => post('/image', { prompt, model, size, negative_prompt: negative, prompt_enhance: enhance, output_watermark: watermark })) }, t(op.busy ? 'working' : 'generate')), h(Output, { op, kind: 'image' }))
        }
        function SpeechTab({ defaults, voices }) {
            const t = useT(), op = useOperation()
            const [input, setInput] = React.useState(''), [voice, setVoice] = React.useState(''), [asyncMode, setAsync] = React.useState(false)
            const [model, setModel] = useDefault(defaults.speechModel), [format, setFormat] = useDefault(defaults.audioFormat)
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('speech')), h(Field, { label: t('text') }, h(TextArea, { value: input, onChange: (e) => setInput(e.target.value) })), h(VoiceSelect, { value: voice, onChange: setVoice, voices }), h(AudioOptions, { model, setModel, format, setFormat, asyncMode, setAsync }), h(Button, { primary: true, disabled: op.busy || !input.trim() || !voice.trim(), onClick: () => op.run(() => post('/speech', { input, voice_id: voice.trim(), model, response_format: format, async: asyncMode })) }, t(op.busy ? 'working' : 'generate')), h(Output, { op, kind: 'audio' }))
        }
        async function encodeFile(file, maxMb = 50) {
            const t = clientContext.locale.bind(NS)
            if (!file) throw new Error(t('invalidFile'))
            if (file.size > maxMb * 1024 * 1024) throw new Error(t('fileTooLarge', { size: maxMb }))
            return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(t('uploadError'))); reader.onabort = () => reject(new Error(t('uploadError'))); reader.readAsDataURL(file) })
        }
        function MediaSource({ type, value, onChange }) {
            const t = useT(), features = useFeatures(), uploadOp = useOperation()
            const [file, setFile] = React.useState(null)
            React.useEffect(() => { if (!features.upload && value.mode === 'upload') onChange({ ...value, mode: 'url', fileId: '', filename: '' }) }, [features.upload, value, onChange])
            const modes = [...(features.upload ? [['upload', 'upload']] : []), ['url', 'url'], ['file', 'fileId']]
            const upload = () => uploadOp.run(async () => {
                const data = await post('/upload', { filename: file.name, purpose: type, file_base64: await encodeFile(file) })
                const payload = data.payload || data
                const id = data.file_id || data.fileId || payload.file_id || payload.id
                if (!id) throw new Error(t('noFileId'))
                onChange({ ...value, fileId: id, filename: file.name })
                return undefined
            }, 'uploaded')
            const activeMode = !features.upload && value.mode === 'upload' ? 'url' : value.mode
            return h('div', null, h(Field, { label: t('source') }, h('select', { value: activeMode, onChange: (e) => onChange({ ...value, mode: e.target.value }), style: styles.input }, ...modes.map(([id, key]) => option(id, t(key))))),
                activeMode === 'url' ? h(Field, { label: t(type === 'video' ? 'videoUrl' : 'url') }, h(TextInput, { type: 'url', value: value.url, onChange: (e) => onChange({ ...value, url: e.target.value }) })) : activeMode === 'file' ? h(Field, { label: t('fileId') }, h(TextInput, { value: value.fileId, onChange: (e) => onChange({ ...value, fileId: e.target.value }) })) : h(React.Fragment, null,
                    h(Field, { label: t('uploadFile') }, h('input', { type: 'file', accept: `${type}/*`, disabled: uploadOp.busy, onChange: (e) => { setFile(e.target.files?.[0] || null); onChange({ ...value, fileId: '', filename: '' }) }, style: { ...styles.input, padding: 8 } })), h(Button, { disabled: uploadOp.busy || !file, onClick: upload }, t(uploadOp.busy ? 'working' : 'upload')), value.fileId ? h('p', { style: styles.hint }, t('uploadedFile', { name: value.filename || value.fileId }), h('br'), h('code', { style: styles.code }, value.fileId)) : null, h(Status, { op: uploadOp })))
        }
        const emptySource = (uploadEnabled = true) => ({ mode: uploadEnabled ? 'upload' : 'url', fileId: '', url: '', filename: '' })
        function sourceReady(source) { return source.mode === 'url' ? /^https?:\/\//iu.test(source.url.trim()) : Boolean(source.fileId.trim()) }
        function TranscribeTab({ defaults }) {
            const t = useT(), features = useFeatures(), op = useOperation()
            const [source, setSource] = React.useState(() => emptySource(features.upload)), [asyncMode, setAsync] = React.useState(false)
            React.useEffect(() => { if (!features.task && asyncMode) setAsync(false) }, [features.task, asyncMode])
            const [model, setModel] = useDefault(defaults.transcriptionModel || currentModels.transcriptionModel[0])
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('transcribe')), h(Model, { field: 'transcriptionModel', value: model, onChange: setModel }), h(MediaSource, { type: 'audio', value: source, onChange: setSource }), h(Check, { label: t('async'), value: asyncMode, disabled: !features.task, onChange: setAsync }), h(Button, { primary: true, disabled: op.busy || !sourceReady(source), onClick: () => op.run(() => post('/transcribe', { model, ...(source.mode === 'url' ? { url: source.url.trim() } : { file_id: source.fileId.trim() }), async: asyncMode && features.task })) }, t(op.busy ? 'working' : 'startTranscribe')), h(Output, { op, kind: 'text' }))
        }
        async function validateCloneAudio(file) {
            const t = clientContext.locale.bind(NS)
            if (!file) throw new Error(t('invalidFile'))
            if (file.size > 10 * 1024 * 1024) throw new Error(t('fileTooLarge', { size: 10 }))
            return await new Promise((resolve, reject) => {
                const url = URL.createObjectURL(file)
                const audio = new Audio()
                let timer
                const finish = (error, duration) => {
                    clearTimeout(timer)
                    audio.onloadedmetadata = null; audio.onerror = null
                    audio.removeAttribute('src'); audio.load(); URL.revokeObjectURL(url)
                    if (error) reject(error); else resolve(duration)
                }
                audio.preload = 'metadata'
                audio.onloadedmetadata = () => { const duration = audio.duration; finish(!Number.isFinite(duration) || duration <= 0 ? new Error(t('metadataError')) : duration > 30 ? new Error(t('invalidDuration')) : null, duration) }
                audio.onerror = () => finish(new Error(t('metadataError')))
                timer = setTimeout(() => finish(new Error(t('metadataError'))), 10000)
                audio.src = url
            })
        }
        function CloneTab({ onCreated }) {
            const t = useT(), op = useOperation()
            const [file, setFile] = React.useState(null), [name, setName] = React.useState(''), [duration, setDuration] = React.useState(null)
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('clone')), h(Field, { label: t('reference'), hint: t('cloneLimit') }, h('input', { type: 'file', accept: '.wav,.mp3,.m4a,.flac,audio/*', disabled: op.busy, onChange: (e) => setFile(e.target.files?.[0] || null), style: styles.input })), h('div', { style: styles.row }, h(Field, { label: t('name') }, h(TextInput, { value: name, onChange: (e) => setName(e.target.value) }))), h(Button, { primary: true, disabled: op.busy || !file, onClick: () => op.run(async () => { const durationSec = await validateCloneAudio(file); setDuration(durationSec); const encoded = await encodeFile(file, 10); const data = await post('/clone', { audio_base64: encoded, filename: file.name, duration_sec: durationSec, name }); onCreated(); return { ...data, voiceId: data.voiceId || data.payload?.id || data.payload?.voice_id } }) }, t(op.busy ? 'working' : 'create')), h(Output, { op }))
        }
        function DesignTab({ defaults, onCreated }) {
            const t = useT(), op = useOperation()
            const [input, setInput] = React.useState(''), [instruction, setInstruction] = React.useState(''), [createVoice, setCreateVoice] = React.useState(false)
            const [model, setModel] = useDefault(defaults.voiceModel), [format, setFormat] = useDefault(defaults.audioFormat)
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('design')), h(Field, { label: t('previewText') }, h(TextArea, { value: input, onChange: (e) => setInput(e.target.value) })), h(Field, { label: t('description') }, h(TextArea, { value: instruction, onChange: (e) => setInstruction(e.target.value) })), h('div', { style: styles.row }, h(Model, { field: 'voiceModel', value: model, onChange: setModel }), h(Field, { label: t('format') }, h(Select, { value: format, values: FORMATS, onChange: (e) => setFormat(e.target.value) }))), h(Check, { label: t('reusable'), value: createVoice, onChange: setCreateVoice }), h(Button, { primary: true, disabled: op.busy || !input.trim() || !instruction.trim(), onClick: () => op.run(async () => { const data = await post('/voice-design', { input, instruction, model, response_format: format, create_voice: createVoice }); if (createVoice) onCreated(); return data }) }, t(op.busy ? 'working' : 'generate')), h(Output, { op, kind: 'audio' }))
        }
        function DialogueTab({ defaults, voices }) {
            const t = useT(), op = useOperation()
            const [speakers, setSpeakers] = React.useState([{ id: 'speaker_1', voice_id: '' }, { id: 'speaker_2', voice_id: '' }])
            const [segments, setSegments] = React.useState([{ speaker: 'speaker_1', text: '' }, { speaker: 'speaker_2', text: '' }])
            const [model, setModel] = useDefault(defaults.dialogueModel || MODELS.dialogueModel[0]), [format, setFormat] = useDefault(defaults.audioFormat), [asyncMode, setAsync] = React.useState(false)
            const changeSpeaker = (index, field, value) => { const previous = speakers[index].id; setSpeakers(speakers.map((row, i) => i === index ? { ...row, [field]: value } : row)); if (field === 'id') setSegments(segments.map((row) => row.speaker === previous ? { ...row, speaker: value } : row)) }
            const validSpeakers = speakers.length > 0 && new Set(speakers.map((row) => row.id.trim())).size === speakers.length && speakers.every((row) => row.id.trim() && row.voice_id.trim())
            const validSegments = segments.length > 0 && segments.every((row) => row.text.trim() && speakers.some((speaker) => speaker.id === row.speaker))
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('dialogue')), h(AudioOptions, { model, setModel, format, setFormat, asyncMode, setAsync, modelField: 'dialogueModel' }), h('h3', { style: styles.sectionTitle }, t('speakers')),
                ...speakers.map((row, index) => h('div', { key: index, style: { ...styles.row, paddingBottom: 8 } }, h(Field, { label: t('speaker') }, h(TextInput, { value: row.id, onChange: (e) => changeSpeaker(index, 'id', e.target.value) })), h(VoiceSelect, { value: row.voice_id, onChange: (value) => changeSpeaker(index, 'voice_id', value), voices }), h('div', { style: styles.buttonRow }, h(Button, { disabled: op.busy || speakers.length < 2, onClick: () => setSpeakers(speakers.filter((_, i) => i !== index)) }, t('remove'))))),
                h(Button, { disabled: op.busy, onClick: () => { let suffix = speakers.length + 1; while (speakers.some((row) => row.id === `speaker_${suffix}`)) suffix++; setSpeakers([...speakers, { id: `speaker_${suffix}`, voice_id: '' }]) } }, t('addSpeaker')), h('h3', { style: { ...styles.sectionTitle, marginTop: 24 } }, t('segments')),
                ...segments.map((row, index) => h('div', { key: index, style: { borderTop: `1px solid ${theme.border}`, paddingTop: 14 } }, h(Field, { label: t('speaker') }, h('select', { value: row.speaker, onChange: (e) => setSegments(segments.map((item, i) => i === index ? { ...item, speaker: e.target.value } : item)), style: styles.input }, !speakers.some((speaker) => speaker.id === row.speaker) ? option(row.speaker, row.speaker) : null, ...speakers.map((speaker) => option(speaker.id)))), h(Field, { label: t('text') }, h(TextArea, { value: row.text, onChange: (e) => setSegments(segments.map((item, i) => i === index ? { ...item, text: e.target.value } : item)) })), h(Button, { disabled: op.busy || segments.length < 2, onClick: () => setSegments(segments.filter((_, i) => i !== index)) }, t('remove')))),
                h('div', { style: { ...styles.buttonRow, marginTop: 16 } }, h(Button, { disabled: op.busy, onClick: () => setSegments([...segments, { speaker: speakers[0]?.id || '', text: '' }]) }, t('addSegment')), h(Button, { primary: true, disabled: op.busy || !validSpeakers || !validSegments, onClick: () => op.run(() => post('/dialogue', { model, speakers: speakers.map((row) => ({ id: row.id.trim(), voice_id: row.voice_id.trim() })), segments: segments.map((row) => ({ ...row, speaker: row.speaker.trim() })), response_format: format, async: asyncMode })) }, t(op.busy ? 'working' : 'generate'))), h(Output, { op, kind: 'audio' }))
        }
        function UnderstandTab({ defaults }) {
            const t = useT(), features = useFeatures(), op = useOperation()
            const [instruction, setInstruction] = React.useState(''), [type, setType] = React.useState('image'), [urls, setUrls] = React.useState(''), [fileIds, setFileIds] = React.useState(''), [source, setSource] = React.useState(() => emptySource(features.upload))
            const [model, setModel] = useDefault(defaults.vlModel)
            const imageList = [...lines(urls), ...(source.mode === 'url' && source.url.trim() ? [source.url.trim()] : [])]
            const ids = [...new Set([...lines(fileIds), ...(source.mode !== 'url' && source.fileId ? [source.fileId] : [])])]
            const valid = instruction.trim() && (type === 'video' ? sourceReady(source) : (imageList.length > 0 || ids.length > 0) && imageList.length + ids.length <= 5 && imageList.every((url) => /^https?:\/\//iu.test(url)))
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('understand')), h('div', { style: styles.row }, h(Model, { field: 'vlModel', value: model, onChange: setModel }), h(Field, { label: t('media') }, h('select', { value: type, onChange: (e) => { setType(e.target.value); setSource(emptySource(features.upload)) }, style: styles.input }, option('image', t('pictures')), option('video', t('video'))))), h(Field, { label: t('instruction') }, h(TextArea, { value: instruction, onChange: (e) => setInstruction(e.target.value) })),
                type === 'image' ? h(React.Fragment, null, h(Field, { label: t('imageUrls') }, h(TextArea, { value: urls, onChange: (e) => setUrls(e.target.value) })), h(Field, { label: t('fileIds') }, h(TextArea, { value: fileIds, onChange: (e) => setFileIds(e.target.value) }))) : null,
                h(MediaSource, { key: type, type, value: source, onChange: setSource }), h('div', { style: { marginTop: 16 } }, h(Button, { primary: true, disabled: op.busy || !valid, onClick: () => op.run(() => post('/understand', { model, instruction, ...(type === 'image' ? { image_urls: imageList, image_file_ids: ids } : source.mode === 'url' ? { video_url: source.url.trim() } : { video_file_id: source.fileId.trim() }) })) }, t(op.busy ? 'working' : 'startUnderstand'))), h(Output, { op, kind: 'text' }))
        }
        function TaskTab() {
            const t = useT(), op = useOperation()
            const [taskId, setTaskId] = React.useState('')
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('task')), h(Field, { label: t('taskId') }, h(TextInput, { value: taskId, onChange: (e) => setTaskId(e.target.value), placeholder: 'task_id' })), h(Button, { primary: true, disabled: op.busy || !taskId.trim(), onClick: () => op.run(() => call(`/task?id=${encodeURIComponent(taskId.trim())}`)) }, t(op.busy ? 'working' : 'query')), h(Output, { op }))
        }
        function VoicesTab({ voices, reload, loading, error }) {
            const t = useT(), op = useOperation()
            return h('section', { style: styles.section }, h('h2', { style: styles.sectionTitle }, t('voices')), h('div', { style: styles.buttonRow }, h(Button, { disabled: op.busy || loading, onClick: () => op.run(reload) }, t(loading ? 'loading' : 'refresh')), h('span', { style: styles.hint }, t('voiceCount', { count: voices.length }))), error ? h('p', { role: 'status', style: styles.status }, error) : null, h(Status, { op }), !voices.length ? h('p', { style: styles.hint }, t('noVoices')) : h('div', null, voices.map((voice) => h('div', { key: voice.id || voice.voice_id, style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: `1px solid ${theme.border}` } }, h('strong', null, voice.name || t('unnamed')), h('code', { style: styles.code }, voice.id || voice.voice_id)))))
        }
        function assetKindLabel(t, kind) { return t({ all: 'allAssets', image: 'imageAsset', audio: 'audioAsset', video: 'videoAsset', file: 'fileAsset', voice: 'voiceAsset', text: 'textAsset', task: 'taskAsset' }[kind] || 'allAssets') }
        function safeAssetUrl(value) { return typeof value === 'string' && /^(?:https?:|blob:|data:(?:image|audio|video)\/)/iu.test(value) ? value : null }
        async function copyValue(value, t, setMessage) { try { await navigator.clipboard.writeText(String(value)); setMessage({ key: 'copied' }) } catch { setMessage({ key: 'copyFailed' }) } }
        function AssetsTab() {
            const t = useT(), features = useFeatures()
            const [items, setItems] = React.useState([]), [total, setTotal] = React.useState(0), [offset, setOffset] = React.useState(0), [query, setQuery] = React.useState(''), [kind, setKind] = React.useState('all'), [loading, setLoading] = React.useState(true), [deleting, setDeleting] = React.useState(false), [error, setError] = React.useState(''), [confirm, setConfirm] = React.useState(null), [bulkConfirm, setBulkConfirm] = React.useState(false), [message, setMessage] = React.useState(null), [selected, setSelected] = React.useState(() => new Set())
            const requestSeq = React.useRef(0)
            const limit = 20
            const load = React.useCallback(async (nextOffset = offset) => {
                const requestId = ++requestSeq.current
                setLoading(true); setError('')
                try {
                    const data = await call(`/assets?kind=${encodeURIComponent(kind)}&q=${encodeURIComponent(query.trim())}&offset=${nextOffset}&limit=${limit}`)
                    if (requestId !== requestSeq.current) return
                    const nextItems = Array.isArray(data.items) ? data.items : []
                    setItems(nextItems); setTotal(Number(data.total) || 0); setOffset(Number.isSafeInteger(Number(data.offset)) ? Number(data.offset) : nextOffset)
                    setSelected((current) => { const visible = new Set(nextItems.map((item) => item.id)); return new Set([...current].filter((id) => visible.has(id))) })
                } catch (cause) {
                    if (requestId === requestSeq.current) setError(cause.message)
                } finally {
                    if (requestId === requestSeq.current) setLoading(false)
                }
            }, [kind, query, offset])
            React.useEffect(() => {
                requestSeq.current++
                if (!features.assets) return undefined
                const timer = setTimeout(() => void load(0), 250)
                return () => { clearTimeout(timer); requestSeq.current++ }
            }, [features.assets, kind, query])
            const visibleIds = items.map((item) => item.id).filter(Boolean)
            const selectedCount = selected.size
            const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
            const toggleItem = (id) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
            const toggleAll = () => setSelected((current) => allSelected ? new Set() : new Set(visibleIds))
            const remove = async (item) => {
                setDeleting(true); setError('')
                try {
                    await call('/assets', { method: 'POST', body: JSON.stringify({ action: 'remove', id: item.id }) })
                    setConfirm(null); setSelected((current) => { const next = new Set(current); next.delete(item.id); return next })
                    const nextOffset = items.length === 1 && offset > 0 ? Math.max(0, offset - limit) : offset
                    await load(nextOffset)
                } catch (cause) { setError(cause.message) } finally { setDeleting(false) }
            }
            const removeSelected = async () => {
                const ids = [...selected]
                if (!ids.length) return
                setDeleting(true); setError('')
                try {
                    const result = await call('/assets', { method: 'POST', body: JSON.stringify({ ids }) })
                    setBulkConfirm(false); setSelected(new Set()); setMessage({ key: 'assetDeleted', count: Number(result.removed) || ids.length })
                    const nextOffset = items.length <= ids.length && offset > 0 ? Math.max(0, offset - limit) : offset
                    await load(nextOffset)
                } catch (cause) { setError(cause.message) } finally { setDeleting(false) }
            }
            const operation = (item) => item.operation || item.purpose || item.kind || t('file')
            const range = total && items.length ? `${offset + 1}-${Math.min(offset + items.length, total)} / ${total}` : `0 / ${total}`
            return h('section', { style: styles.section },
                h('h2', { style: styles.sectionTitle }, t('assetsOverview')),
                h('p', { style: { ...styles.hint, margin: '-10px 0 18px' } }, t('assetsFilterHint')),
                h('div', { style: styles.assetToolbar },
                    h('div', { style: styles.assetToolbarField }, h(Field, { label: t('assetSearch') }, h(TextInput, { value: query, onChange: (e) => { setQuery(e.target.value); setOffset(0) }, placeholder: t('assetSearch') }))),
                    h('div', { style: styles.assetToolbarKind }, h(Field, { label: t('assetKind') }, h(Select, { value: kind, values: ['all', 'image', 'audio', 'video', 'file', 'voice', 'text', 'task'].map((value) => ({ value, label: assetKindLabel(t, value) })), onChange: (e) => { setKind(e.target.value); setOffset(0) } }))),
                    h('div', { style: styles.assetActions }, h(Button, { disabled: loading || deleting, onClick: () => load(offset) }, t('assetRefresh')))
                ),
                h('div', { style: styles.assetSummary },
                    h('div', { style: styles.assetActions }, h('strong', null, t('assetCount', { count: total })), h('span', { style: styles.hint }, range), selectedCount ? h('span', { style: styles.assetBadge }, t('assetSelected', { count: selectedCount })) : null),
                    h('div', { style: styles.assetActions }, h(Button, { disabled: loading || deleting || !visibleIds.length, onClick: toggleAll }, t(allSelected ? 'assetClearSelection' : 'assetSelectAll')), selectedCount ? h(Button, { disabled: loading || deleting, onClick: () => setSelected(new Set()) }, t('assetClearSelection')) : null, h(Button, { primary: selectedCount > 0, disabled: loading || deleting || !selectedCount, onClick: () => setBulkConfirm(true) }, t('assetDeleteSelected')))
                ),
                bulkConfirm ? h('div', { style: styles.assetBulkConfirm }, h('span', { style: styles.hint }, t('assetDeleteSelectedPrompt', { count: selectedCount })), h('div', { style: styles.assetActions }, h(Button, { disabled: deleting, onClick: () => setBulkConfirm(false) }, t('assetCancel')), h(Button, { primary: true, disabled: deleting, onClick: () => void removeSelected() }, t('assetDeleteSelectedConfirm')))) : null,
                error ? h('p', { role: 'status', style: { ...styles.status, color: theme.error } }, error) : null,
                message ? h('p', { role: 'status', style: styles.status }, t(message.key, { count: message.count })) : null,
                !items.length && loading ? h('p', { style: styles.hint }, t('assetLoading')) : !items.length ? h('p', { style: { ...styles.hint, padding: '28px 0 12px', textAlign: 'center' } }, t('assetEmpty')) : h('div', { style: styles.assetList, 'aria-busy': loading }, loading ? h('p', { style: { ...styles.hint, gridColumn: '1 / -1' } }, t('assetLoading')) : null, items.map((item) => {
                    const url = safeAssetUrl(item.url), id = item.id || item.fileId || item.voiceId || item.taskId, isSelected = selected.has(item.id)
                    const preview = url && item.kind === 'image' ? h('img', { loading: 'lazy', src: url, alt: item.title || t('imageAsset'), style: styles.assetThumb }) : url && item.kind === 'audio' ? h('audio', { controls: true, preload: 'none', src: url, style: styles.assetMedia }) : url && item.kind === 'video' ? h('video', { controls: true, preload: 'metadata', src: url, style: styles.assetMedia }) : h('span', { style: styles.assetPlaceholder }, t('assetNoPreview'))
                    const text = item.text && item.text.length > 220 ? `${item.text.slice(0, 220)}…` : item.text
                    return h('article', { key: item.id || `${item.kind}-${id}`, 'aria-selected': isSelected, style: { ...styles.assetItem, ...(isSelected ? styles.assetSelected : {}) } },
                        h('div', { style: styles.assetCardTop }, h('label', { style: styles.assetCheck }, h('input', { type: 'checkbox', checked: isSelected, 'aria-label': `${isSelected ? t('assetUnselect') : t('assetSelect')}: ${item.title || id || item.kind}`, onChange: () => toggleItem(item.id) }), isSelected ? t('assetUnselect') : t('assetSelect')), h('span', { style: styles.assetBadge }, assetKindLabel(t, item.kind))),
                        h('div', { style: styles.assetPreview }, preview),
                        h('div', { style: styles.assetBody }, h('h3', { style: styles.assetTitle }, item.title || assetKindLabel(t, item.kind)), h('div', { style: styles.assetMeta }, h('span', { style: styles.hint }, `${t('assetOperation')}: ${operation(item)}`), item.createdAt ? h('time', { style: styles.hint, dateTime: item.createdAt }, `${t('assetCreated')}: ${new Date(item.createdAt).toLocaleString()}`) : null, text ? h('p', { style: styles.assetText }, text) : null, !url && (item.fileId || item.voiceId || item.taskId) ? h('span', { style: styles.hint }, t('assetNoPreview')) : null), id ? h('div', { style: styles.assetActions }, h('code', { style: styles.code }, id), h(Button, { style: styles.assetAction, onClick: () => copyValue(id, t, setMessage) }, t('copy')), url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', style: { ...styles.hint, color: theme.accent, padding: '6px 2px' } }, t('openResult')) : null, h(Button, { style: styles.assetAction, ariaLabel: `${t('assetDelete')}: ${item.title || id || item.kind}`, disabled: deleting, onClick: () => setConfirm(item) }, t('assetDelete'))) : null),
                        confirm?.id === item.id ? h('div', { style: styles.confirm }, h('p', { style: styles.hint }, t('assetDeletePrompt')), h('div', { style: styles.assetActions }, h(Button, { disabled: deleting, onClick: () => setConfirm(null) }, t('assetCancel')), h(Button, { primary: true, disabled: deleting, onClick: () => void remove(item) }, t('assetConfirm')))) : null
                    )
                })),
                h('div', { style: styles.assetPagination }, h('div', { style: styles.assetActions }, h(Button, { disabled: offset <= 0 || loading || deleting, onClick: () => load(Math.max(0, offset - limit)) }, t('assetPrev')), h(Button, { disabled: loading || deleting || offset + limit >= total, onClick: () => load(offset + limit) }, t('assetNext'))), h('span', { style: styles.hint }, t('assetLocalOnly')))
            )
        }
        function Workbench() {
            const t = useT(), stateOp = useOperation()
            const [state, setState] = React.useState(null), [tab, setTab] = React.useState('image'), [settings, setSettings] = React.useState(false)
            const [voices, setVoices] = React.useState([]), [voiceError, setVoiceError] = React.useState(''), [voiceLoading, setVoiceLoading] = React.useState(false)
            const voicePending = React.useRef(null)
            const refresh = async () => { const data = await call('/state'); currentModels = resolveModels(data.models); setState({ ...data, features: normalizeFeatures(data.features || data.value?.features) }) }
            const reloadVoices = () => {
                if (voicePending.current) return voicePending.current
                setVoiceLoading(true); setVoiceError('')
                voicePending.current = call('/voices').then((data) => { const payload = data.payload || data; setVoices(Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []) }).catch((error) => { setVoiceError(error.message) }).finally(() => { voicePending.current = null; setVoiceLoading(false) })
                return voicePending.current
            }
            React.useEffect(() => { void stateOp.run(refresh); const off = clientContext.on('connection/reset', () => { void stateOp.run(refresh) }); return () => { off?.() } }, [])
            React.useEffect(() => { if (state?.configured && state.features?.voices !== false) void reloadVoices() }, [state?.configured, state?.features?.voices])
            const availableIds = ['image', 'speech', 'transcribe', 'dialogue', 'clone', 'design', 'understand', 'task', 'voices', 'assets'].filter((id) => state?.features?.[id] !== false)
            React.useEffect(() => { if (availableIds.length && !availableIds.includes(tab)) setTab(availableIds[0]) }, [tab, availableIds.join('|')])
            const openSettings = () => { setSettings(true) }
            if (!state) return h('div', { style: styles.page }, h('div', { style: styles.content }, h(Button, { disabled: stateOp.busy, onClick: () => stateOp.run(refresh) }, t(stateOp.busy ? 'loading' : 'retry')), h(Status, { op: stateOp })))
            const features = state.features || FEATURE_DEFAULTS
            const rawDefaults = state.value || {}
            const defaults = { imageModel: currentModels.imageModel[0], speechModel: currentModels.speechModel[0], voiceModel: currentModels.voiceModel[0], vlModel: currentModels.vlModel[0], transcriptionModel: currentModels.transcriptionModel[0], dialogueModel: currentModels.dialogueModel[0], imageSize: '1024x1024', audioFormat: 'mp3', ...rawDefaults, transcriptionModel: rawDefaults.transcriptionModel || currentModels.transcriptionModel[0], dialogueModel: rawDefaults.dialogueModel || currentModels.dialogueModel[0] }
            const allTabs = [['image', 'image', ImageTab], ['speech', 'speech', SpeechTab], ['transcribe', 'transcribe', TranscribeTab], ['dialogue', 'dialogue', DialogueTab], ['clone', 'clone', CloneTab], ['design', 'design', DesignTab], ['understand', 'understand', UnderstandTab], ['task', 'task', TaskTab], ['voices', 'voices', VoicesTab], ['assets', 'assets', AssetsTab]]
            const tabs = allTabs.filter(([, feature]) => features[feature] !== false)
            const content = h(FeatureContext.Provider, { value: features }, h(React.Fragment, null,
                h('div', { hidden: settings, style: settings ? { display: 'none' } : styles.page }, h('div', { style: styles.content }, h(Header, { state, onSettings: openSettings }), tabs.length ? h(React.Fragment, null,
                    h('nav', { style: styles.nav, role: 'tablist', 'aria-label': t('workbench') }, tabs.map(([id]) => h('button', { type: 'button', key: id, role: 'tab', id: `moss-tab-${id}`, 'aria-selected': tab === id, 'aria-controls': `moss-panel-${id}`, onClick: () => setTab(id), style: { ...styles.tab, borderBottom: `2px solid ${tab === id ? theme.accent : 'transparent'}`, ...(tab === id ? styles.activeTab : {}) } }, t(id)))), tabs.map(([id, feature, Component]) => h('div', { key: id, role: 'tabpanel', id: `moss-panel-${id}`, 'aria-labelledby': `moss-tab-${id}`, hidden: tab !== id, style: { display: tab === id ? 'block' : 'none', minWidth: 0 } }, h('fieldset', { disabled: feature !== 'assets' && !state.configured, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } }, feature !== 'assets' && !state.configured ? h('p', { style: styles.hint }, t('notConfigured')) : null, h(Component, { defaults, voices, reload: reloadVoices, loading: voiceLoading, error: voiceError, onCreated: reloadVoices }))))) : h('p', { style: styles.hint }, t('noFeature')))), settings ? h(SettingsPage, { onBack: () => { setSettings(false); void stateOp.run(refresh) } }) : null))
            return content
        }
        function SidebarIcon() {
            return h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: 'M4 5.5h16v13H4z' }), h('path', { d: 'M8 9h8M8 13h5M8 17h8' }))
        }
        return {
            name: 'dsh-moss-multimodal-client',
            inject: ['slots', 'locale', 'layout', 'connection'],
            apply(ctx) {
                clientContext = ctx
                disposed = false
                ctx.effect(() => ctx.locale.register(NS, { en, zh }))
                ctx.effect(() => () => { disposed = true; for (const controller of activeRequests) controller.abort(); activeRequests.clear() })
                const t = ctx.locale.bind(NS)
                ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({ name: 'plugins.bundle.config', key: pkg, locale: NS }, ({ view } = {}) => view === 'summary' ? h('span', null, t('settings')) : h(Root, { component: SettingsPage })))
                ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'moss', locale: NS }, () => h(Root, { component: Workbench })))
                ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'moss', order: 44, locale: NS, label: () => t('workbench') }, SidebarIcon))
            },
        }
    },
})
