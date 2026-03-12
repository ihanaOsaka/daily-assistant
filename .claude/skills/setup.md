---
name: setup
description: 初回セットアップ - MCP接続確認とGoogle OAuth認証
user_invocable: true
---

Daily Assistant の初回セットアップを実行してください。以下の手順で進めてください:

## Step 1: MCP サーバー接続確認
Google Workspace MCP サーバーが接続されているか確認してください。
接続されていない場合は、ユーザーにトラブルシューティング手順を案内してください。

## Step 2: Google OAuth 認証テスト
Google Tasks のタスクリスト一覧を取得してみてください。
- 成功した場合 → Step 3 へ
- OAuth 認証が必要な場合 → ブラウザが開くので、ユーザーに認証を完了するよう案内してください
  - 「このアプリはGoogleで確認されていません」と表示されたら「詳細」→「daily-assistant（安全ではないページ）に移動」で進める
  - テストユーザーに登録済みの Google アカウントでログインする

## Step 3: 各サービスの動作確認
以下を順番にテストし、結果を報告してください:

1. **Google Tasks**: タスクリスト一覧を取得
2. **Google Calendar**: 今日の予定を取得
3. **Gmail**: 最新の未読メール数を取得

## Step 4: 結果レポート
テスト結果を以下のフォーマットで表示してください:

```
## Daily Assistant セットアップ完了！

### 接続テスト結果
| サービス | ステータス | 備考 |
|---------|----------|------|
| Google Tasks    | OK / NG | [詳細] |
| Google Calendar | OK / NG | [詳細] |
| Gmail           | OK / NG | [詳細] |

### 利用可能なコマンド
- /morning  - 朝のルーティン（今日のタスク・予定・メール確認）
- /evening  - 夕方の振り返り（進捗まとめ・翌日準備）
- /tasks    - Google Tasks の確認・追加・更新
- /schedule - Google Calendar の確認・追加

### 次のステップ
明日の朝、/morning を実行してみてください！
```
