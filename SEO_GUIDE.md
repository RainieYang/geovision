# GeoVision 基础 SEO 与 Git 部署

## 已完成

- 7 个路由分别生成静态 HTML，页面标题、英文描述和 H1 可直接读取。
- 统一 canonical（规范网址），目录页使用尾部 `/`，站点地图和分享网址保持一致。
- Open Graph 与 Twitter Card 分享信息；暂用现有首页视觉图，后续可在 `src/content/media.ts` 的 `social-default` 配置 1200×630 专用分享图。
- WebSite、WebPage 和 BreadcrumbList JSON-LD。没有填写虚构作者、公司、评价或客户数据。
- 两个 Demo 页面有真实可见的功能介绍，手机端和静态 HTML 也可读取。重型地图和图表继续按需加载。
- 自动生成 `sitemap.xml`、`robots.txt` 和带 `noindex` 的真正 404 页面。
- 单页应用内跳转同步更新元信息，未知路由移除过期 canonical 和结构化数据。
- 每次 `pnpm build` 自动检查 7 个页面的 SEO 产物；也可以单独运行 `pnpm check:seo`。

## Git 仓库连接 Vercel / Netlify

项目是 React + Vite 的静态网站，不需要运行地图服务的 Node 后端来生成官网页面。

1. 将项目推到你准备使用的 Git 仓库，保留 `vendor/` 中的 SDK 包及 `pnpm-lock.yaml`。
2. 在 Vercel 或 Netlify 中导入该仓库，选择项目根目录。
3. 安装命令：`pnpm install --frozen-lockfile`；构建命令：`pnpm build`；发布目录：`dist`。使用支持项目 pnpm 版本的 Node.js，例如 22.12+。
4. 配置下面的环境变量，再触发部署。

仓库根目录已经提供 `vercel.json` 和 `netlify.toml`。Vercel 按静态站处理；Netlify 的兜底规则返回 404。不要额外添加将所有路径重写为 `/index.html` 且返回 200 的 SPA 规则，否则会覆盖独立页面和真实 404 行为。

| 环境变量 | 正式环境 | 预览 / 分支环境 |
| --- | --- | --- |
| `VITE_SITE_URL` | 网站最终主域名，例如 `https://your-domain.example`（示例，必须替换） | 同一个正式主域名 |
| `VITE_SEO_INDEXABLE` | `true` | `false` |

`VITE_SITE_URL` 必须是完整域名，不能带子目录、查询参数或片段。未购买域名时，也可以先填写实际的 Vercel / Netlify 站点地址。后续换域名需要重新构建，更新旧域名的重定向并重新提交 sitemap。

CI 构建若没有显式设置 `VITE_SITE_URL` 会报错，防止把当前 chatgpt.site 预览域名带到新网站。预渲染与前端构建都使用 production 环境配置。

Netlify 配置已为 deploy-preview、branch-deploy 设置 `VITE_SEO_INDEXABLE=false`；Vercel 请在环境变量面板分别设置 Production 为 true、Preview 为 false。不要用 robots.txt 的 Disallow 代替 noindex：爬虫需要能够读取页面的 noindex 标签。

## 上线后检查

1. 检查首页、`/demos/`、`/projects/`、`/about/`、`/contact/` 和两个 Demo 深链接，直接打开或刷新都应返回页面。
2. 打开 `/sitemap.xml`，确认所有链接都是实际主域名；检查 `/robots.txt` 指向同一份 sitemap。
3. 打开随机不存在的地址，确认平台返回 HTTP 404，页面包含 noindex，且没有指向首页的 canonical。
4. 在 Google Search Console 验证域名并提交 `https://你的域名/sitemap.xml`；检查首页和主要页面的索引情况。
5. 按需使用 Google 富媒体搜索结果测试工具检查结构化数据。基础 WebSite / WebPage 标记本身不保证出现特殊搜索展示。
6. 补充真实的个人介绍、联系方式与案例内容。SEO 配置帮助搜索引擎理解网站，收录与排名仍取决于公开访问、内容质量和实际抓取。

## 本地地图与网站部署

`pnpm dev:local-map` 使用本地 SDK 源码和 8080 数据服务，仅用于本地联调。
`pnpm build` 不会把这个开发配置发布到外网。正式接入你的地图服务时，需要先部署外网 HTTPS 服务，再配置正式 SDK 和服务地址。图像封面及 Demo 的静态介绍不依赖本地服务。

本次没有推送到新的 Git 仓库、创建 Vercel / Netlify 项目，也没有修改线上站点。

## 参考

- [Google：结构化数据的作用](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Netlify：静态路由与重定向](https://docs.netlify.com/manage/routing/redirects/overview/)
- [Netlify：自定义 404 处理](https://docs.netlify.com/manage/routing/redirects/redirect-options/)
