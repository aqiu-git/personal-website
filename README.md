# Personal Website MVP

一个基于统一 `Post + Category + Media + Comment` 内容模型的个人网站 MVP。

## Stack

- Next.js 15 App Router
- React + TypeScript strict
- Tailwind CSS + shadcn/ui 风格组件
- Prisma + PostgreSQL
- JWT Cookie 管理员认证

## Run

1. 安装依赖：

```bash
pnpm install
```

2. 准备环境变量：

```bash
cp .env.example .env
```

3. 初始化数据库：

```bash
pnpm prisma:migrate
pnpm prisma:seed
```

4. 启动开发服务：

```bash
pnpm dev
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

当前目录原本没有 Node/pnpm 可用环境；如果命令无法运行，需要先修复本机 Node.js、pnpm 和 PostgreSQL。
