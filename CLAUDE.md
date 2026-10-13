# Bash命令
- npm run build: 构建项目
- npm run typecheck: 运行类型检查器

# 代码风格
- 使用ES模块(import/export)语法，而不是CommonJS (require)
- 尽可能使用解构导入(例如 import { foo } from 'bar')
- 使用 4 个半角空格缩进，而不是 Tab
- 代码中添加中文注释

# 工作流程
- 在完成一系列代码更改后务必进行类型检查
- 为了性能考虑，优先运行单个测试，而不是整个测试套件
- 提交信息（commit message）使用中文

# 项目结构
- src/game/ 纯 TypeScript 棋理与引擎，零 Vue import，可在 node 环境下直接单测
- src/composables/ Vue 组合式函数，负责把引擎状态接进响应式系统
- src/tests/ vitest 用例，命名 *.spec.ts
- 单测示例：npx vitest run src/tests/rules.spec.ts
