# おのじゅんの校務DXカフェ

現職小学校教員がつくる、校務のためのちいさな道具置き場。サイト本体のソースです。

## 構成

```
docs/
├── index.html          トップページ
├── tools.html          ツール一覧
└── assets/
    ├── site.css        サイトのスタイル
    ├── site.js         演出と絞り込み
    ├── classical.css   デザインシステム（Classical）
    └── coffee.png      ヒーローの水彩イラスト
```

ビルド不要の静的サイトです。ローカルで確認するには `docs/` を配信します。

```sh
cd docs && python3 -m http.server 8000
```

## 公開

GitHub Pages で配信します。Settings → Pages → Source で `main` ブランチの `/docs` フォルダを選びます。

## 未設定の項目

ダウンロード・スキャン結果・X へのリンクは URL 未定のため `href="#"` のままです。各所に `<!-- TODO -->` コメントを残しています。
