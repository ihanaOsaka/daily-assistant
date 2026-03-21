#!/bin/bash
# SessionStart hook: セッション開始時に今日のコンテキストを注入
# stdout の内容が Claude のコンテキストに追加される

TODAY=$(date '+%Y-%m-%d (%a)')

cat <<EOF
=== セッション開始: ${TODAY} ===

秘書エージェントを使って（MCP ツールにアクセスできない場合は直接 MCP ツールを呼び出して）以下を確認し、簡潔に一覧表示してください:
1. Google Calendar（googleworkspace）から今日の予定を取得
2. Google Tasks（googleworkspace2）の「大阪/岩崎」リストから未完了タスクを取得
3. Google Tasks（googleworkspace）から未完了タスクを取得

※ SessionStart hook による自動注入
EOF
