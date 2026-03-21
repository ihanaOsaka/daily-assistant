# Daily Assistant - Claude Code Project

## Overview
Google Workspace (Tasks, Calendar, Gmail) と連携した日常タスク管理アシスタント。
Claude Code の MCP サーバーと Agent Teams を活用した4エージェント体制。

## Architecture
- Phase 1: 単一セッション + Google Workspace MCP + カスタムスキル ✅
- Phase 2: Agent Teams（秘書・開発・調査・検証の4エージェント） ✅
- Phase 3a: Hooks + 自動化 ✅
- Phase 3b: Web UI + タスクキュー（スマホからのリモート操作） ← 現在

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

## Hooks（Phase 3a）
- 設定: `.claude/settings.json` の `hooks` セクション
- スクリプト: `.claude/hooks/` に配置

### 有効な Hooks
| Hook | イベント | 内容 |
|---|---|---|
| `session-start.sh` | SessionStart | セッション開始時に今日のタスク・予定の自動確認を指示 |

## Web UI + タスクキュー（Phase 3b）

### 構成（Vercel + Turso）
```
[スマホ] → [Vercel (Next.js + API)] ←→ [Turso DB (SQLite互換)]
                                          ↑ ポーリング
                                    [PC (poller.py → claude -p)]
```

- Web UI + API: Vercel にデプロイ（スマホからどこでもアクセス可能）
- DB: Turso（SQLite互換、Vercel Edge対応）
- PC側: poller.py が Vercel API をポーリング → claude -p でタスク実行 → 結果をPOST

### ディレクトリ
- `web/` - Next.js アプリ（Vercel デプロイ対象）
  - `app/` - App Router（ページ + API Routes）
  - `app/api/` - REST API エンドポイント
  - `app/components/` - 共通UIコンポーネント
  - `lib/db/` - Drizzle ORM + Turso 接続
  - `middleware.ts` - 認証ミドルウェア
- `server/poller.py` - PC側ポーラー（Vercel APIをポーリング → Claude CLI実行）

### ローカル版（server/）
- `server/` - FastAPI + SQLite + htmx 版（LAN内利用向け、Phase 3b初期実装）
- Vercel版と同じAPIインターフェース

### 起動方法
```bash
# Vercel版（開発）
cd web && npm run dev    # localhost:3000

# PC側ポーラー
API_BASE=https://your-app.vercel.app POLLER_API_KEY=your-key python server/poller.py
```

### 環境変数（Vercel）
| 変数 | 用途 |
|---|---|
| `TURSO_DATABASE_URL` | Turso DB URL |
| `TURSO_AUTH_TOKEN` | Turso 認証トークン |
| `AUTH_PASSWORD_HASH` | パスワード認証（SHA-256、未設定で認証スキップ） |
| `POLLER_API_KEY` | PC側ポーラーの認証キー |

### API エンドポイント
| メソッド | パス | 用途 |
|---|---|---|
| GET | `/api/tasks` | タスク一覧 |
| POST | `/api/tasks` | タスク投入 |
| GET | `/api/tasks/poll` | ポーラー用（pending→processing） |
| PATCH | `/api/tasks/{id}/result` | 実行結果報告 |
| DELETE | `/api/tasks/{id}` | pending タスクのキャンセル |
| GET | `/api/status` | サーバー稼働状況 |
| POST | `/api/auth` | ログイン |
| DELETE | `/api/auth` | ログアウト |

## Conventions
- エージェント定義は `.claude/agents/` に配置
- スキルファイルは `.claude/skills/` に配置
- 設定ファイルは `.claude/` に配置
- 言語: 日本語でのやり取りを基本とする
