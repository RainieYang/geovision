# 素材和个人信息替换指南

## 个人资料

复制 `.env.example` 为 `.env.local`，按需要填写：

| 配置 | 用途 |
| --- | --- |
| VITE_PROFILE_NAME | 英文公开显示名 |
| VITE_CONTACT_EMAIL | 联系页 mailto 与复制邮箱 |
| VITE_GITHUB_URL | 完整公开 GitHub HTTPS 地址 |
| VITE_LINKEDIN_URL | 完整 LinkedIn HTTPS 地址 |
| VITE_SITE_URL | 正式站点源地址，不加路径和末尾斜杠 |
| VITE_MAP_TILE_URL | 可选的 XYZ 底图模板，默认使用 OpenStreetMap |
| VITE_MAP_ATTRIBUTION | 自定义底图要求的署名 |
| VITE_MAP_TERRAIN_URL | 可选的 Cesium 兼容地形服务；空值使用 ellipsoid |

当前个人信息按你的要求保持未配置。GitHub/LinkedIn 缺失时不显示按钮。图片视频可以一直留空。

环境变量是构建期配置：修改后重启开发服务器，部署前重新 `pnpm build`。不能把私密 token 放进 VITE 环境变量。

## 图片和视频

1. 将文件放入 `public/media/`。
2. 在 `src/content/media.ts` 对应条目填写 `src: '/media/your-image.webp'`。
3. 填写英文 alt，根据裁切需要设置 `objectPosition: '60% 50%'`。
4. 检查桌面和手机显示，重新构建。

| id | 位置 | 建议材料 |
| --- | --- | --- |
| hero | 首页整幅背景，手机端独立裁切 | 当前使用提供的地形视觉图；后续替换建议 16:9 |
| geospatial-cover | 地图 Demo，16:9 | 1600×900 真实 SDK 截图 |
| spectrum-cover | 频谱 Demo，16:9 | 1600×900 真实截图 |
| map-project | 地图项目，16:9 | 可复用地图截图 |
| signal-project | 信号项目，16:9 | 可复用频谱截图 |
| about | About，4:5 | 个人照或可公开工作场景 |
| social-default | 社交分享图配置预留 | 1200×630 品牌图；填写后用于 Open Graph |

推荐 WebP/AVIF；首屏图片尽量控制在 400KB 内，卡片图片约 150KB 内。保留高清原稿，但不要直接把超大原稿放到页面中。

视频条目示例（无文件时不要填写该 src）：

```ts
hero: {
  type: 'video',
  src: '/media/geospatial-demo.mp4',
  poster: '/media/geospatial-poster.webp',
  alt: 'Simulated devices on a geospatial map',
  aspectRatio: '4 / 3',
  objectPosition: 'center',
}
```

视频使用浏览器播放控件，不自动播放，preload 为 none。建议 10～20 秒短片并提供封面，内容不依赖声音。首屏真实地图由访客主动启动，关闭后恢复媒体位。

无 src 时组件不输出 img/video；不会有空 URL 或破图。不要把参考效果图直接作为真实产品截图，也不需要先购买通用科技背景。

## 文案

`src/content/site.ts` 集中存放项目、能力与链接。页面长文案在 `src/pages/Marketing.tsx`；路由标题和描述在 `src/content/seo.ts`。没有已验证的客户、经历或性能成绩时，继续保留当前事实性 SDK 介绍。

后续提供的项目贡献和个人经历需与你的真实情况一致。公开上线前检查 `pnpm check:release` 并走完 `docs/QA_REPORT.md`。


首页主视觉已接入：public/media/geovision-hero-terrain.png。桌面端横跨首屏，手机端主体按右侧 78% 位置裁切。原始图片内容未修改，渐隐和文字均由网页叠加。点击 Explore a live scene 可启动真实地图，关闭后恢复图片。

地图截图已接入：public/media/geovision-map-terrain.png。geospatial-cover 与 map-project 共用同一张原始截图，以 16:9 容器和 center 58% 位置裁切展示；图片文件内容未修改。此图展示三维地形，后续可替换为带设备和轨迹的实际 SDK 截图。
地图截图轮播：src/content/media.ts 的 geospatialScreenshots 统一管理三维地形、浅色 2D 与深色 2D 三张原始图片。首页、Demos 列表和 Projects 地图项目共用此配置；支持左右按钮、圆点、键盘方向键、鼠标拖动和触屏滑动，不自动播放。项目图片区保持 16:9。
频谱截图已接入：public/media/geovision-spectrum-waterfall.png。spectrum-cover 与 signal-project 共用原图，通过 objectFit: contain 完整展示频谱、瀑布图和坐标；Demo 图片不叠加标签或箭头，点击图片或下方 Launch 进入实时 Demo。
