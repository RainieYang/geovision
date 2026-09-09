# 固定 SDK 包

网站正常安装仅依赖本目录 tgz，不依赖上游绝对路径。版本号保持原包版本，网站修订通过归档路径、此记录与 SHA-256 识别；这些修订包没有上传 npm。

| 包 | 来源 | 网站最小修订 |
| --- | --- | --- |
| map-engine-3d 0.0.24 | D:/yangyi/map-engine 的当前源码，经 pnpm pack | 暂存包中清空 DEFAULT_TIANDITU_TK，默认 watermark 改为 GeoVision；网站另传 watermark 空值并显式配置底图 |
| @signal-visualization/core 1.2.0 | 原 SDK outputs 下标准 tgz | 仅已编译 JS 内工具提示的“频率”“功率”改为 Frequency/Power；不更改功能逻辑 |
| @signal-visualization/react 1.2.0 | 原 SDK outputs 下标准 tgz | 无修改 |

制作脚本：scripts/prepare-vendor.mjs。源仓库没有被修改，未使用未找到的 sample-tooltip 同名变体。归档保留上游 LICENSE；SDK 其他资源按上游许可使用。

校验命令（PowerShell）：

```powershell
Get-ChildItem vendor -Recurse -Filter *.tgz | Get-FileHash -Algorithm SHA256
```

实际散列见 SHA256SUMS.txt。重新制作 SDK 包必须重新安装以更新锁文件完整性校验，并复测网站。
