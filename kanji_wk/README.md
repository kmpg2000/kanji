<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 漢字吸い込み大作戦 (Kanji Inhale Strategy)

AIがあなたのプリントを解析して、漢字クイズを作ってくれる学習ゲームです。

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally (ローカルで動かす)

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Production (公開する方法)

このアプリは **Vercel** などの静的ホスティングサービスで簡単に無料で公開できます。

### Vercelでの公開手順

1. **GitHubにプッシュ**: このコードをGitHubのリポジトリにアップロードします。
2. **Vercelでインポート**: [Vercel](https://vercel.com) にログインし、GitHubリポジトリをインポートします。
3. **環境変数の設定 (重要)**:
   デプロイ設定画面の `Environment Variables` に以下を追加してください。
   * **Key**: `GEMINI_API_KEY`
   * **Value**: (あなたのGoogle Gemini APIキー)
4. **Deploy**: デプロイボタンを押すと、数分で公開URLが発行されます。

### 注意点 (Security)
公開後は、APIキーの悪用を防ぐため、Google AI Studio (Google Cloud Console) のAPIキー設定で、**HTTPリファラー制限**（公開したURLからのみ許可する設定）を行うことを強く推奨します。
