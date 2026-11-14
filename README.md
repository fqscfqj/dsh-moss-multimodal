# DSH MOSS 多模态插件

为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 提供 MOSS 多模态工作台、设置页和 Agent 工具。支持图像生成、语音生成、多人配音、音色克隆与设计、音频转写、图像/视频理解以及媒体上传。

[English](#dsh-moss-multimodal-plugin)

## 功能

| 能力 | 工作台 | Agent 工具 |
| --- | --- | --- |
| 文生图 / 布局提示词 | 图像生成 | `moss_image_generate` |
| 单人语音 | 语音生成 | `moss_speech_generate` |
| 多人语音 | 多人语音 | `moss_dialogue_generate` |
| 音色克隆 | 音色克隆 | `moss_voice_clone` |
| 描述生成音色与试听 | 音色设计 | `moss_voice_generate` |
| 音色列表 | 音色列表 | `moss_voices_list` |
| 音频转写 / 说话人分离 | 语音转写 | `moss_transcribe` |
| 图片 / 视频理解 | 视觉理解 | `moss_understand` |
| 音频 / 图片 / 视频上传 | 媒体输入 | `moss_file_upload` |
| 异步任务查询 | 任务查询 | `moss_task_get` |
| 默认参数 / 连通测试 | MOSS 设置 | `moss_settings` |
| 本地资产索引与批量清理 | 资产浏览（搜索、筛选、多选、批量删除） | `moss_assets_list`, `moss_assets_remove` |

默认使用官方 `https://api.mosi.cn`，接口契约依据 [MOSS API 文档](https://platform.moss.cn/docs)。图片、语音、转写和视觉模型使用 MOSS 文档公开的固定快照模型。

## 安装

### DSH 命令行：从 GitHub 安装（推荐）

需要已安装并登录 DSH。执行：

```bash
dsh plugin --profile desktop add github:fqscfqj/dsh-moss-multimodal
```

该仓库根目录包含 DSH bundle manifest（`package.json` 中的 `dsh.bundle`）。桌面版 CLI 安装依赖后，还需在 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 数组中加入 `"dsh-moss-multimodal"`，然后启动 DSH，在侧栏打开 **MOSS 多模态**。GUI 安装会自动完成 bundle 注册。

也可以在 DSH 的 **Plugins → Add plugin** 中粘贴：

```text
github:fqscfqj/dsh-moss-multimodal
```

### npm 包

发布后可以直接使用 npm 包安装当前插件：

```bash
dsh plugin --profile desktop add dsh-moss-multimodal@latest
```

维护者发布新版本前执行：

```bash
npm login
npm publish --access public
```

### 本地开发目录

```bash
pnpm install --ignore-scripts
pnpm run check
pnpm test
pnpm pack
dsh plugin --profile desktop add ./dsh-moss-multimodal-1.0.5.tgz
```

### 安装打包文件

```bash
pnpm pack
dsh plugin --profile desktop add ./dsh-moss-multimodal-1.0.5.tgz
```

在 Windows 上通过命令行安装前，先完全退出 DSH。请安装 `pnpm pack` 生成的 `.tgz`，避免将带有 `node_modules` 的开发目录复制到插件目录。非桌面版请将 `--profile desktop` 换成对应的 profile 名称。

安装后：

1. 刷新 DSH GUI，侧栏选择 **MOSS 多模态**。
2. 打开设置，在 **替换 API Key** 中保存 MOSS API Key。
3. 点击 **测试连接**，然后使用工作台或 Agent 工具。
4. 语音合成前，从音色列表选择 `voice_id`，或先克隆 / 设计音色。

本插件是 DSH 动态模块，不需要、也不应该另起 Web 服务。

## 1.0.1 更新

- 工作台页面升级为更清晰的分段导航、状态头部和卡片式区块布局。
- 资产浏览支持关键词搜索、类型筛选、当前页多选、全选、清除选择和批量删除。
- 批量删除只清理本地资产索引，并保留删除确认与分页刷新反馈。

## 兼容性

- DSH：`>=0.2.2-rc.2 <0.3.0-0`
- Node.js：`>=22.19.0`
- 运行时：Web client + DSH Host

## 密钥与数据

- API Key 通过 DSH 凭据服务保存，不进入浏览器 local storage、源码或发布归档。
- 未配置插件记录时，可回退读取 `MOSS_API_KEY` credential reference 或进程环境来源。
- 输入文字、参考音频和上传媒体会发送至配置的 MOSS 服务。
- 资产浏览只保存插件自己的本地索引；删除索引不会删除 MOSS 云文件或音色。

## 当前边界

这是生成与批量理解工作台，不覆盖 MOSS 的所有实时能力。当前不提供 MOSS-Live 双向实时视频会话、原始 PCM / SSE 低延迟播放、Nex 文本聊天 Provider 或独立文件管理器。

## 开发与验证

```bash
pnpm run check
pnpm test
pnpm pack
```

测试覆盖参数校验、边界、互斥字段、模型、媒体数量、Base64、工具 schema、bundle 内容清单和 live client slot。测试不会触发付费生成或创建音色。

## 许可证

[MIT](LICENSE)

---

# DSH MOSS Multimodal Plugin

A MOSS multimodal workbench, settings page, and Agent tools for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). It supports image generation, speech generation, multi-speaker dialogue, voice cloning and design, transcription, image/video understanding, and media uploads.

[返回中文](#dsh-moss-多模态插件)

## Features

| Capability | Workbench | Agent tools |
| --- | --- | --- |
| Text-to-image / layout prompts | Image generation | `moss_image_generate` |
| Single-speaker speech | Speech generation | `moss_speech_generate` |
| Multi-speaker dialogue | Dialogue | `moss_dialogue_generate` |
| Voice cloning | Voice cloning | `moss_voice_clone` |
| Voice design and preview | Voice design | `moss_voice_generate` |
| Voice catalog | Voice list | `moss_voices_list` |
| Transcription / diarization | Transcription | `moss_transcribe` |
| Image / video understanding | Vision | `moss_understand` |
| Audio / image / video upload | Media input | `moss_file_upload` |
| Async task polling | Task query | `moss_task_get` |
| Defaults / connectivity probe | MOSS settings | `moss_settings` |
| Local asset index and bulk cleanup | Asset browser (search, filter, multi-select, bulk delete) | `moss_assets_list`, `moss_assets_remove` |

The default API endpoint is `https://api.mosi.cn`; API behavior follows the [MOSS API documentation](https://platform.moss.cn/docs). Image, speech, transcription, and vision features use the documented fixed-snapshot models.

## Installation

### DSH CLI: install from GitHub (recommended)

With DSH installed and authenticated, run:

```bash
dsh plugin --profile desktop add github:fqscfqj/dsh-moss-multimodal
```

The repository root contains a DSH bundle manifest (`dsh.bundle` in `package.json`). After installing dependencies through the Desktop CLI, also add `"dsh-moss-multimodal"` to `dsh.profile.bundles` in `~/.dsh/profiles/desktop/package.json`. Start DSH and open **MOSS Multimodal** from the sidebar. GUI installation registers the bundle automatically.

You can also paste this spec into **Plugins → Add plugin**:

```text
github:fqscfqj/dsh-moss-multimodal
```

### npm package

After publication, install the plugin from npm with:

```bash
dsh plugin --profile desktop add dsh-moss-multimodal@latest
```

Before publishing a new release, run:

```bash
npm login
npm publish --access public
```

### Local development checkout

```bash
pnpm install --ignore-scripts
pnpm run check
pnpm test
pnpm pack
dsh plugin --profile desktop add ./dsh-moss-multimodal-1.0.5.tgz
```

### Install a packed archive

```bash
pnpm pack
dsh plugin --profile desktop add ./dsh-moss-multimodal-1.0.5.tgz
```

On Windows, fully quit DSH before installing through the CLI. Install the `.tgz` produced by `pnpm pack` instead of copying a development directory containing `node_modules`. For other surfaces, replace `--profile desktop` with the appropriate profile name.

After installation:

1. Reload the DSH GUI and select **MOSS Multimodal** from the sidebar.
2. Open Settings and save the MOSS API key under **Replace API key**.
3. Select **Test connection**, then use the workbench or Agent tools.
4. Select a `voice_id` from the voice catalog before speech generation, or clone/design a voice first.

This is a DSH dynamic module. It does not require a separate web server.

## 1.0.1 changes

- Refined the workbench with clearer segmented navigation, status header, and card-based sections.
- Added asset search, type filtering, current-page multi-select, select all, clear selection, and bulk delete.
- Bulk cleanup only removes local asset indexes and keeps confirmation and pagination feedback.

## Compatibility

- DSH: `>=0.2.2-rc.2 <0.3.0-0`
- Node.js: `>=22.19.0`
- Runtime: Web client + DSH Host

## Keys and data

- API keys are stored through DSH credentials and are not placed in browser local storage, source code, or release archives.
- When no plugin record is configured, the plugin can fall back to the `MOSS_API_KEY` credential reference or process environment source.
- Text inputs, reference audio, and uploaded media are sent to the configured MOSS service.
- The asset browser stores only this plugin's local index; deleting an index entry does not delete a MOSS cloud file or voice.

## Current scope

This is a generation and batch-understanding workbench, not a wrapper for every MOSS realtime capability. MOSS-Live bidirectional video sessions, low-latency raw PCM / SSE playback, a Nex text-chat provider, and a standalone file manager are currently out of scope.

## Development and verification

```bash
pnpm run check
pnpm test
pnpm pack
```

Tests cover validation, boundaries, mutually exclusive fields, models, media counts, Base64, tool schemas, bundle contents, and the live client slot. Tests do not trigger paid generation or voice creation.

## License

[MIT](LICENSE)
