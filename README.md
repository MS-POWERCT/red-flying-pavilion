# 红飞阁木业 · 实木家具定制官网

纯静态网站，零构建依赖，内容由 `config.json` 驱动，可直接部署到 Cloudflare Pages。

## 本地预览

不要直接双击 HTML。用任意静态服务器打开：

```bash
python3 -m http.server 8080
```

浏览器访问 <http://localhost:8080>。

## 改内容

编辑根目录 `config.json` 即可更新全站文案、产品、木材、工厂图和联系方式。保存后刷新页面。

常见字段：

| 字段                                   | 说明                                     |
| -------------------------------------- | ---------------------------------------- |
| `site.name` / `site.subtitle`          | 品牌名与副标题                           |
| `about.masterName` / `about.story`     | 师傅称呼与故事                           |
| `products`                             | 产品列表（名称、图片、木材、尺寸、周期） |
| `woods`                                | 木材对比表                               |
| `gallery`                              | 工厂实拍                                 |
| `contact.phone` / `wechat` / `address` | 联系方式                                 |
| `contact.phoneHref`                    | 如 `tel:17779323886`，手机可直接拨号     |

## 换图片

占位图都在 `images/` 里，保持文件名或同步改 `config.json` 中的路径即可。

- 产品图建议 800×600
- 首页 Hero 建议 1920×800
- 微信二维码：替换 `images/contact/wechat-qr.svg`

联系页只展示电话、微信、地址，没有留言表单。

## 部署到 Cloudflare Pages

1. 把本仓库推送到 GitHub，或直接上传整个文件夹
2. Cloudflare Pages 构建命令留空，输出目录填 `/`
3. 如需自定义域名，在 Pages 项目里绑定即可

## 待你补充

- 品牌名是否改用师傅姓名或其他字号（当前暂用「红飞阁木业」）
- 产品与工厂实拍照片、Logo、微信二维码

方案原文见 `furniture-site-brief.md`。
