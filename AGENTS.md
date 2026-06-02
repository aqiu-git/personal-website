# AGENTS.md

## Project Overview

个人内容展示网站

主要板块：

1. 生活分享
2. 猫咪萌照
3. 摄影作品
4. 技术文章

未来支持无限扩展。

---

## Tech Stack

### Frontend

- Next.js 15
- React
- TypeScript
- TailwindCSS
- shadcn/ui

### Backend

- NestJS

### Database

- PostgreSQL
- Prisma ORM

### Storage

- Cloudflare R2

### Deployment

- Docker

---

## Architecture Rules

所有内容统一抽象为 Post。

禁止为每个板块创建独立表。

### 正确

- Post
- Category
- Media

### 错误

- LifePost
- CatPost
- PhotoPost
- TechPost

---

## Coding Rules

必须使用：

- TypeScript Strict Mode
- ESLint
- Prettier

禁止：

- any
- console.log

---

## UI Rules

风格：

- 极简
- Apple 风格
- 摄影作品优先

支持：

- Dark Mode
- Responsive

---

## SEO Rules

所有文章必须包含：

- title
- slug
- description

自动生成：

- sitemap.xml
- robots.txt

---

## Database Rules

所有表必须包含：

- id
- createdAt
- updatedAt

支持软删除：

- deletedAt

---

## Security Rules

后台必须实现：

- JWT认证
- CSRF防护
- API限流
- 评论防刷

---

## Development Rules

每次新增功能：

1. 更新 Prisma Schema
2. 生成 Migration
3. 编写 API
4. 编写前端页面
5. 编写测试

禁止跳过步骤。

---

## Future Expansion

未来新增板块：

- 旅游
- 视频
- 项目展示
- 读书笔记
- 收藏夹

只能通过 Category 扩展。

禁止修改核心架构。

---

## Content Model

统一内容模型：

Post

支持：

- Text
- Image
- Gallery
- Video
- Article

通过：

- Category
- Tag

实现业务区分。

---

## Comment Rules

游客允许评论。

支持：

- 评论审核
- 回复评论
- 垃圾评论过滤

---

## Performance Rules

必须支持：

- SSR
- ISR
- 图片懒加载
- CDN缓存
- SEO优化

Google Lighthouse：

- Performance > 90
- SEO > 95

---

## Deployment Rules

生产环境：

- Docker
- Nginx
- PostgreSQL
- Cloudflare CDN
- Cloudflare R2

必须支持：

- 一键部署
- 自动备份
- HTTPS

---

## Final Goal

打造一个集：

- 个人博客
- 生活记录
- 猫咪相册
- 摄影作品集
- 技术知识库

于一体的长期运营个人网站。

未来新增内容类型时，仅通过分类扩展，不修改数据库核心结构。