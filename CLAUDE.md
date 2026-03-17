# Daily Assistant - Claude Code Project

## Overview
Google Workspace (Tasks, Calendar, Gmail) と連携した日常タスク管理アシスタント。
Claude Code の MCP サーバーと Agent Teams を活用した4エージェント体制。

## Architecture
- Phase 1: 単一セッション + Google Workspace MCP + カスタムスキル ✅
- Phase 2: Agent Teams（秘書・開発・調査・検証の4エージェント） ← 現在
- Phase 3: Hooks + 自動化

## MCP Server
- `google_workspace_mcp` (taylorwilsdon/google_workspace_mcp) を使用
- 対応サービス: Tasks, Calendar, Gmail, Drive, Docs

### マルチアカウント構成
| MCP サーバー名 | アカウント | 用途 |
|---|---|---|
| `googleworkspace` | ihana.osaka@oral.clinic | 個人アカウント（リストは適宜判断） |
| `googleworkspace2` | exective.share@oral.clinic | 役員共有アカウント |

### 役員共有アカウント（googleworkspace2）の運用ルール
- **デフォルトのタスクリスト**: 「大阪/岩崎」（ユーザー本人のリスト）
- タスクの読み書きは原則「大阪/岩崎」リストに対して行う
- 「マイタスク」や他メンバーのリスト（岐阜/松尾、熊本,コンサル/中島、総務/井口、三輪）も参照・移動操作可能
- 他リストのタスクを自分（大阪/岩崎）に引っ張る、または自分のタスクを他リストに移動する操作に対応する

### OAuth 認証メモ
- googleworkspace2 の初回認証は `scripts/manual_oauth_account2.py` で実施（MCP内蔵OAuthは uv run のプロセス分離により state 不一致が発生するため）
- トークンは `~/.google_workspace_mcp/credentials_account2/` に保存

## Agent Teams

### エージェント一覧
| エージェント | ファイル | 役割 | モデル |
|---|---|---|---|
| 秘書 | `.claude/agents/secretary.md` | Google Workspace連携・日常業務 | sonnet |
| 開発 | `.claude/agents/developer.md` | コーディング・技術タスク | sonnet |
| 調査 | `.claude/agents/researcher.md` | 情報収集・ソース付きレポート | sonnet |
| 検証 | `.claude/agents/verifier.md` | 調査結果の裏取り・批判的レビュー | sonnet |

### エージェント起動ルール
- **メインセッション**がオーケストレーターとして、タスクの性質に応じてエージェントを委譲する
- Google Workspace 操作 → 秘書エージェント
- コード作成・修正 → 開発エージェント
- 情報収集・調査 → 調査エージェント
- 調査結果の検証 → 検証エージェント（ユーザーが要求した場合、または重要な判断を伴う場合）
- 独立したタスクは並列実行で効率化する

### 調査 → 検証フロー
1. 調査エージェントが情報収集・ソース付きレポートを作成
2. 検証エージェントが独立したソースで裏取り（デフォルトは調査のみ、要求時に検証も実行）
3. メインセッションが両者の結果を統合して報告

## Skills (Slash Commands)
- `/morning` - 朝のルーティン: 今日のタスクとカレンダーを表示
- `/evening` - 夕方の振り返り: 進捗まとめ・翌日タスク整理
- `/tasks` - Google Tasks の確認・更新
- `/schedule` - Google Calendar の確認

## Conventions
- エージェント定義は `.claude/agents/` に配置
- スキルファイルは `.claude/skills/` に配置
- 設定ファイルは `.claude/` に配置
- 言語: 日本語でのやり取りを基本とする
