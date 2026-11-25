# trace-todo-app 架构与流程

> 一个带用户认证、云端持久化和 WebDAV 同步的 Todo 应用。
> 技术基线：Next.js 14（App Router）+ React 18 + TypeScript + Prisma 7 + PostgreSQL（Neon）+ NextAuth v4。

---

## 1. 项目概览

| 项 | 内容 |
| --- | --- |
| 仓库 | `trace-todo-app`（包名 `todo-app`） |
| 类型 | 全栈单仓库，前端页面与服务端 API 同工程 |
| 核心能力 | 用户注册/登录、任务增删改查与筛选排序、WebDAV 云端同步、管理员用户管理 |
| 数据来源 | 云端 PostgreSQL（Neon），通过 Prisma driver adapter 访问 |
| 会话 | NextAuth Credentials + JWT，角色 `USER` / `ADMIN` |

---

## 2. 技术栈

- **框架**：Next.js 14.2.5 App Router，React 18.3.1，TypeScript 5.5.3（strict）
- **样式**：Tailwind CSS 3.4.4 + PostCSS + autoprefixer；自定义色板定义在 `tailwind.config.js`
- **数据层**：Prisma 7.1.0 + `@prisma/adapter-pg` + `pg`；schema 在 `prisma/schema.prisma`，迁移在 `prisma/migrations/`
- **认证**：next-auth 4.24.13，Credentials Provider，JWT session，bcryptjs 哈希密码
- **验证码**：svg-captcha 1.4.0（注册用）；`next.config.js` 通过 `serverComponentsExternalPackages` 外置以保留字体路径
- **同步**：webdav 5.3.0，把任务导出为 `tasks.json`
- **校验/工具**：dotenv、jsonwebtoken（依赖中声明）

---

## 3. 目录结构

```
src/
├── app/                          # App Router 页面与 API
│   ├── page.tsx                  # 首页（任务工作台）
│   ├── login/page.tsx            # 登录
│   ├── register/page.tsx         # 注册（含验证码）
│   ├── settings/page.tsx         # WebDAV 设置
│   ├── user/profile/page.tsx     # 账户管理
│   ├── admin/users/page.tsx      # 管理员用户管理
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth 统一入口
│   │   ├── auth/register/        # 注册
│   │   ├── auth/captcha/         # 注册验证码（svg-captcha）
│   │   ├── auth/update-profile/  # 改资料/密码
│   │   ├── auth/delete-account/  # 销户
│   │   ├── captcha/              # 验证码（另一实现）
│   │   ├── tasks/                # 任务 CRUD
│   │   ├── admin/users/          # 管理员操作
│   │   └── webdav-config/        # WebDAV 配置读写
│   ├── layout.tsx                # 根布局，注入 Inter 字体与 Providers
│   ├── providers.tsx             # SessionProvider + TaskProvider
│   └── globals.css               # Tailwind 入口与主题变量
├── components/                   # TaskForm / TaskList / TaskItem /
│                                 # CategoryFilter / SyncStatus /
│                                 # WebDavConfig / Logo
├── contexts/TaskContext.tsx      # 全局任务状态与所有数据操作
├── utils/
│   ├── authOptions.ts            # NextAuth 配置（从 route 抽出）
│   ├── prismaClient.ts           # Prisma 单例 + pg Pool adapter
│   ├── webDavClient.ts           # WebDAV 文件读写
│   └── syncManager.ts            # 同步封装 + 冲突解决
├── types/                        # 领域类型 + next-auth/bcrypt/pg 类型扩展
└── middleware.ts                 # /admin 路由鉴权
prisma/
├── schema.prisma                 # 4 模型 + 2 枚举
└── migrations/                   # 初始建表 SQL
prisma.config.ts                  # Prisma CLI 配置（Prisma 7 格式）
.env                              # DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL
```

---

## 4. 分层架构

```
┌──────────────────────────────────────────────────────────┐
│ 表现层  pages: / , /login , /register , /settings ,      │
│         /user/profile , /admin/users                    │
│         components: TaskForm / TaskList / CategoryFilter │
├──────────────────────────────────────────────────────────┤
│ 状态层  TaskProvider(useReducer) + SessionProvider       │
│         所有写操作：先请求 API，成功后 dispatch 更新 UI  │
├──────────────────────────────────────────────────────────┤
│ 接口层  Route Handlers：tasks / auth / admin /           │
│         webdav-config / captcha                         │
│         统一用 getServerSession(authOptions) 取会话      │
├──────────────────────────────────────────────────────────┤
│ 数据层  Prisma Client + PrismaPg adapter → Neon PG       │
│         侧向分支：WebDAV 远端 tasks.json                 │
└──────────────────────────────────────────────────────────┘
```

关键约定：
- `src/utils/prismaClient.ts` 用 `globalThis.prisma` 单例，避免开发环境热重载产生多连接。
- Prisma 7 不再接受 `datasourceUrl` 构造参数，必须通过 driver adapter（`Pool` → `PrismaPg` → `PrismaClient`）。
- 所有 API 路由显式声明 `export const dynamic = 'force-dynamic'`，避免构建期静态预渲染读取 cookies/headers 报错。

---

## 5. 数据模型

物理表名统一加 `TD_` 前缀。

```
User (TD_User) 1 ──── N Task (TD_Task)
  │                      主键 id(cuid)
  │ 主键 id(cuid)         title / description / completed
  │ email @unique         priority: low|medium|high
  │ password(bcrypt)      category / tags(String[])
  │ name?                  dueDate?
  │ role: USER|ADMIN       createdAt / updatedAt
  │ isActive               userId → User.id
  │ createdAt / updatedAt
  │
  └──── 1 ──── 1 WebDavConfig (TD_WebDavConfig)
                serverUrl / username / password
                enabled / autoSync / syncInterval(分钟)
                userId @unique → User.id

Settings (TD_Settings)：allowRegistration 全局注册开关（id='default'）
```

- 外键均为 `ON DELETE RESTRICT`：删除用户前必须先删其任务与 WebDAV 配置。
- `Task.tags` 使用 PostgreSQL 原生 `String[]`。
- 迁移 SQL：`prisma/migrations/20251211055852_init/migration.sql`。

---

## 6. 核心流程

### 6.1 认证与授权

**注册**
1. `/register` 挂载，从 `/api/captcha` 取 SVG 验证码，服务端把答案小写写入 httpOnly cookie（2 分钟）。
2. 提交 `email/password/name/captcha` → `POST /api/auth/register`。
3. 服务端依次校验：必填项 → 验证码与 cookie 一致 → `Settings.allowRegistration` → 邮箱未注册。
4. 用 bcryptjs（12 rounds）哈希密码，创建 `User`，并 upsert `Settings(id='default')`。
5. 前端收到 201 后延迟 1.5 秒调用 `signIn('credentials', {callbackUrl:'/'})` 自动登录。

**登录**
1. `/login` 调用 `signIn('credentials', {redirect:false})`。
2. NextAuth `authorize`（`src/utils/authOptions.ts`）：查用户 → 检查 `isActive` → bcrypt 比对密码 → 返回 `{id, email, name, role}`。
3. `jwt` callback 把 `id`、`role` 写入 token；`session` callback 暴露到 `session.user`。
4. session 策略为 JWT，cookie 由 `NEXTAUTH_SECRET` 签名。

**路由保护（两层）**
- 服务端：`middleware.ts` 只匹配 `/admin/:path*`，用 `getToken` 读取角色，非 `ADMIN` 重定向 `/login`。
- 客户端：首页、设置页、账户页、管理员页在 `useEffect` 中判断 `status === 'unauthenticated'` 后跳转；加载中返回 `null` 避免渲染期副作用。

### 6.2 任务管理

- **加载**：首页认证通过后调用 `loadTasks()` 与 `loadWebDavConfig()`。`GET /api/tasks` 用 `getServerSession` 取 `user.id`，按 `userId` 过滤、`createdAt desc` 排序，返回后 dispatch `SYNC_TASKS`。
- **新增**：`TaskForm` → `addTask()` → `POST /api/tasks` → `prisma.task.create` → dispatch `ADD_TASK`。reducer 直接使用 API 返回的真实 `id` 与时间戳（历史 Bug：曾覆盖为 `Date.now()`，导致后续改删失败）。
- **编辑/完成**：`TaskItem` → `updateTask`/`toggleTask` → `PUT /api/tasks`（body 带 id）→ `prisma.task.update({where:{id, userId}})` → dispatch `UPDATE_TASK`。
- **删除**：`DELETE /api/tasks?id=...` → `prisma.task.delete({where:{id, userId}})` → dispatch `DELETE_TASK`。
- **筛选与排序**：完全在前端 `TaskList` 完成，支持 category / tag / completed / priority 四维过滤，排序优先级为「未完成 → 优先级 → 截止日期 → 创建时间」。

### 6.3 WebDAV 同步

- **配置持久化**：`/settings` 的 `WebDavConfig` 组件保存时调用 `setWebDavConfig()`，先 dispatch 再 `PUT /api/webdav-config`；服务端按 `session.user.id` upsert 到 `TD_WebDavConfig`。首页加载时 `GET /api/webdav-config` 回填表单。
- **手动同步**：`SyncStatus`（仅 `enabled` 时显示）点 Sync Now → `Promise.all([loadTasks, syncTasks])` → `syncTasksWithWebDav` → `webDavClient.configure` → `putFileContents('tasks.json')`（覆盖式）。
- **自动同步**：`enabled && autoSync` 时，`TaskProvider` 用 `setInterval` 按 `syncInterval`（分钟）调用 `syncTasks`。
- **连接测试**：`testWebDavConnection` → `getDirectoryContents('/')`。
- **冲突解决**：`syncManager.resolveConflicts` 实现了按 `updatedAt` 的 last-write-wins，但**目前未被调用**；`loadTasksFromWebDav` 同样未接线——当前是本地向远端的单向覆盖。

### 6.4 前端状态管理

`TaskContext` 用 `useReducer` 维护 `{tasks, categories, tags, filter, webDavConfig, syncStatus}`，暴露 10 类 action 与 `addTask/updateTask/deleteTask/toggleTask/setFilter/addCategory/addTag/setWebDavConfig/loadWebDavConfig/syncTasks/loadTasks`。所有数据操作在 Context 内完成「请求 → 成功 → dispatch」，组件只调用方法，不直接碰 fetch 细节。

---

## 7. API 接口清单

| 路由 | 方法 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| `/api/auth/[...nextauth]` | GET/POST | 公开 | NextAuth 全部认证端点 |
| `/api/auth/register` | POST | 公开（验证码） | 注册用户 |
| `/api/auth/captcha` | GET | 公开 | svg-captcha 验证码 |
| `/api/captcha` | GET | 公开 | 另一套验证码实现 |
| `/api/auth/update-profile` | PUT | 弱 | 按 email 改姓名/密码（校验当前密码） |
| `/api/auth/delete-account` | DELETE | 弱 | 按 email 销户，级联删任务 |
| `/api/tasks` | GET/POST/PUT/DELETE | 会话 | 任务 CRUD，按 userId 隔离 |
| `/api/webdav-config` | GET/PUT | 会话 | WebDAV 配置读写，按 userId 隔离 |
| `/api/admin/users` | GET/PUT/DELETE | 会话 + ADMIN | 用户列表、重置密码、删除用户 |

---

## 8. 页面清单

| 路径 | 说明 | 权限 |
| --- | --- | --- |
| `/` | 任务工作台：统计卡片、表单、列表、筛选、同步状态 | 登录 |
| `/login` | 邮箱密码登录 | 公开 |
| `/register` | 注册（验证码 + 自动登录） | 公开 |
| `/settings` | WebDAV 配置与连接测试 | 登录 |
| `/user/profile` | 改资料/密码、销户 | 登录 |
| `/admin/users` | 用户列表、重置密码、删除 | ADMIN |

---

## 9. 配置与运行

```bash
npm install
# .env 中提供 DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL
npx prisma migrate deploy      # 应用迁移
npm run dev                    # 开发：http://localhost:3000
npm run build && npm run start # 生产
npx tsc --noEmit               # 类型检查
node --experimental-default-type=module test-prisma.js  # DB 连通性测试
```

环境变量：
- `DATABASE_URL`：Neon PostgreSQL 连接串（含 sslmode=require）
- `NEXTAUTH_SECRET`：JWT 签名密钥（已替换为随机值）
- `NEXTAUTH_URL`：站点基址，本地为 `http://localhost:3000`

---

## 10. 设计权衡与已知限制

1. **单向同步**：目前只把本地任务推到 WebDAV，没有回读远端；`resolveConflicts` / `loadTasksFromWebDav` 已实现但未接线。
2. **重复验证码端点**：`/api/captcha` 与 `/api/auth/captcha` 两套实现并存，注册页用的是前者。
3. **弱鉴权接口**：`/api/auth/update-profile`、`/api/auth/delete-account` 以请求体中的 email 定位用户，没有和 session.user.id 核对，存在越权风险；建议改为会话内取 id。
4. **固定重置密码**：管理员重置密码固定为 `12345678`，应改为随机强密码并强制首次修改。
5. **筛选/分类不持久化**：categories、tags、filter 只存在内存，刷新后回到默认值（`Personal/Work/Study/Other`）。
6. **外链资源**：已把过期签名的外链 logo 替换为内联 SVG；首页字体仍走 `next/font/google`（构建期需网络）。
7. **数据库凭据**：`.env` 含真实 Neon 连接串，文件被 gitignore；若曾外泄需轮换密码。
