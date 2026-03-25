import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

const SEED_DATA = [
  // マーケティング
  {
    title: 'HPリニューアル（SEO記事作成）',
    category: 'marketing',
    status: 'urgent',
    next_action: '調査レポートベースで記事を継続作成',
    repo_path: 'homepage_renewal',
    sort_order: 10,
  },
  {
    title: 'ブログ記事作成（WIXサイト用）',
    category: 'marketing',
    status: 'active',
    next_action: 'Article_Workbench_APPと連携、WIXサイトに投稿',
    repo_path: 'Article_Workbench_APP',
    sort_order: 20,
  },
  {
    title: '広告分析ダッシュボード統合',
    category: 'marketing',
    status: 'active',
    next_action: 'ad-analysis → apotool_dashboard に統合',
    repo_path: 'ad-analysis',
    sort_order: 30,
  },
  {
    title: '名刺サイズ医院案内',
    category: 'marketing',
    status: 'active',
    next_action: 'デザイン確定→印刷',
    sort_order: 40,
  },
  {
    title: 'SNS動画撮影（mediative社）',
    category: 'marketing',
    status: 'waiting',
    next_action: 'mediative社に当日フロー再検討の進捗確認',
    sort_order: 50,
  },
  {
    title: 'ノムラクリーニング タグ広告',
    category: 'marketing',
    status: 'waiting',
    next_action: 'クリーニング店からの効果報告を確認',
    sort_order: 60,
  },
  {
    title: 'ポジティブエイジフェス',
    category: 'marketing',
    status: 'talking',
    next_action: '藤堂里砂さんとGmailで継続連絡',
    sort_order: 70,
  },
  {
    title: 'モンハンAI相棒 YouTubeサブチャンネル',
    category: 'marketing',
    status: 'active',
    next_action: 'アイルの成長を継続',
    repo_path: 'mh-ai-companion',
    sort_order: 80,
  },
  {
    title: 'Google/Instagram広告 打ち合わせ',
    category: 'marketing',
    status: 'active',
    next_action: '対応可否の切り分け',
    sort_order: 90,
  },
  // 生産マネジメント
  {
    title: '院内在庫管理システム',
    category: 'production',
    status: 'active',
    next_action: 'MVP拡充（画像AI/OCR）',
    repo_path: 'stock-management-app',
    sort_order: 10,
  },
  {
    title: 'Syn-iアプリ開発',
    category: 'production',
    status: 'active',
    next_action: '毎週ミーティングあり',
    repo_path: 'testSyn-i',
    sort_order: 20,
  },
  // 医院運営
  {
    title: 'daily-assistant Web UI改善',
    category: 'operation',
    status: 'active',
    next_action: 'Phase 3b プロジェクトダッシュボード追加',
    repo_path: 'daily-assistant',
    sort_order: 10,
  },
]

export async function POST() {
  try {
    // テーブルが存在しない場合はCREATE TABLEを実行（フォールバック）
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          next_action TEXT,
          notes TEXT,
          repo_path TEXT,
          google_task_id TEXT,
          sort_order INTEGER DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT (current_timestamp),
          created_at TEXT NOT NULL DEFAULT (current_timestamp)
        )
      `)
    } catch (tableError) {
      console.error('CREATE TABLE error (may already exist):', tableError)
    }

    // データが既にある場合はスキップ
    const existing = await db.select().from(projects).limit(1)
    if (existing.length > 0) {
      return Response.json({ ok: true, message: 'Data already exists, skipped.' })
    }

    // シードデータ投入
    await db.insert(projects).values(SEED_DATA)

    return Response.json({ ok: true, message: `Seeded ${SEED_DATA.length} projects.` })
  } catch (error) {
    console.error('POST /api/projects/seed error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
