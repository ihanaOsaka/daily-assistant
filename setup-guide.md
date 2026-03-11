# Daily Assistant セットアップガイド

## Phase 1: Google Workspace MCP + カスタムスキル

### Step 1: Google Cloud プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（例: `daily-assistant`）
3. **APIs & Services → Library** から以下のAPIを有効化:
   - Google Tasks API
   - Google Calendar API
   - Gmail API
4. **APIs & Services → Credentials** へ移動
5. **Create Credentials → OAuth Client ID** を選択
6. アプリケーションタイプ: **Desktop Application**
7. Client ID と Client Secret をメモ

### Step 2: Google Workspace MCP サーバーのインストール

```bash
# Python 3.10+ と uv が必要
pip install uv

# リポジトリをクローン
git clone https://github.com/taylorwilsdon/google_workspace_mcp.git
cd google_workspace_mcp

# 依存関係インストール
uv sync
```

### Step 3: 環境変数の設定

```bash
# .env ファイルを作成（daily-assistant プロジェクトルート）
GOOGLE_OAUTH_CLIENT_ID="your-client-id-here"
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret-here"
```

### Step 4: Claude Code に MCP サーバーを登録

```bash
# daily-assistant ディレクトリで実行
claude mcp add --transport stdio --scope local \
  --env GOOGLE_OAUTH_CLIENT_ID=your-client-id \
  --env GOOGLE_OAUTH_CLIENT_SECRET=your-secret \
  google-workspace -- uv run --directory /path/to/google_workspace_mcp main.py
```

※ Windows の場合:
```bash
claude mcp add --transport stdio --scope local \
  --env GOOGLE_OAUTH_CLIENT_ID=your-client-id \
  --env GOOGLE_OAUTH_CLIENT_SECRET=your-secret \
  google-workspace -- cmd /c uv run --directory C:\path\to\google_workspace_mcp main.py
```

### Step 5: 認証と動作確認

```bash
# daily-assistant ディレクトリで Claude Code を起動
cd C:\Users\ihana\projects\daily-assistant
claude

# MCP サーバーの状態確認
> /mcp

# スキルの動作確認
> /morning
> /tasks
> /schedule
```

### トラブルシューティング

- **OAuth 認証エラー**: Google Cloud Console で正しいリダイレクトURIが設定されているか確認
- **MCP 接続エラー**: `claude mcp list` でサーバーが登録されているか確認
- **API エラー**: Google Cloud Console で該当APIが有効化されているか確認

## 次のステップ (Phase 2)

Phase 1 が安定稼働したら、Agent Teams を導入:
- 秘書エージェント: Google連携・タスク管理担当
- 開発エージェント: コーディングタスク担当
- CLAUDE.md でチーム運用ルールを定義
