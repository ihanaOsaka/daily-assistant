# Daily Assistant - Claude Code Project

## Overview
Google Workspace (Tasks, Calendar, Gmail) と連携した日常タスク管理アシスタント。
Claude Code の MCP サーバー機能を活用し、Phase 2 以降で Agent Teams に拡張予定。

## Architecture
- Phase 1: 単一セッション + Google Workspace MCP + カスタムスキル
- Phase 2: Agent Teams（秘書 + 開発の2エージェント）
- Phase 3: Hooks + 自動化

## MCP Server
- `google_workspace_mcp` (taylorwilsdon/google_workspace_mcp) を使用
- 対応サービス: Tasks, Calendar, Gmail, Drive, Docs

## Skills (Slash Commands)
- `/morning` - 朝のルーティン: 今日のタスクとカレンダーを表示
- `/evening` - 夕方の振り返り: 進捗まとめ・翌日タスク整理
- `/tasks` - Google Tasks の確認・更新
- `/schedule` - Google Calendar の確認

## Conventions
- スキルファイルは `.claude/skills/` に配置
- 設定ファイルは `.claude/` に配置
- 言語: 日本語でのやり取りを基本とする
