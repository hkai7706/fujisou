# 写真の追加・差し替え

## フォルダー

- **原本・追加する写真**：`img/gallery/originals/地域_施工事例名/`
- **公開用画像**：`img/gallery/houses/wakon-yosai-residence/` のような施工事例ごとのフォルダー
- **対応表**：`gallery/project-folders.json`（家の特徴を表す英語名・施工事例名・原本フォルダー）
- **施工事例のデータ**：`gallery/projects.json`（通常は直接編集しません）

施工事例IDと公開ファイル名は、家の特徴が分かる英語名に統一しています。
例：`wakon-yosai-residence`、`takaoka-courtyard-hiraya`、`wood-stove-house`。
対応する記事は `gallery/wood-stove-house.shtml`、公開画像は
`img/gallery/houses/wood-stove-house/`、原本は `地域_日本語の施工事例名` のフォルダーです。
元の `post-1.shtml` などは旧リンクを維持するための転送専用ファイルです。
記事の実体・一覧・サイトマップには新しい名前を使います。旧名との対応は
`gallery/project-renames.json`、301転送は `.htaccess` で管理します。
GitHub Pagesでは転送専用HTMLから移動します（Apacheの301とは異なります）。

原本は変更・圧縮しません。公開用画像はコマンドで作成します。公開用の画像名に
付く短い英数字は、差し替え後に古い写真がブラウザーに残らないための識別子です。
`photo-01` は記事の1枚目、`cover` は一覧用の表紙です。

## 普段の作業

1. 該当する **originals の施工事例フォルダー**に写真を入れます。
2. フォルダー名・ファイル名・使いたい場所を伝えてください。こちらで更新できます。
3. 下記コマンドを使う場合は、プロジェクト直下で実行します。
4. ローカルで見た目を確認してから、Gitへのpushやサーバーへのアップロードを行います。

原本フォルダーを削除・移動したり、`houses` の生成画像を手作業で差し替えないでください。
写真の整理だけで公開はされません。GitHubの更新とLolipopへのアップロードは別の作業です。

## 既存写真の差し替え

例：`wakon-yosai-residence` の原本フォルダーに `living-new.jpg` を入れ、記事の1枚目を変更する場合。

```powershell
npm.cmd run gallery:update -- --project=wakon-yosai-residence --photo=1 --file="living-new.jpg" --caption="リビング・ダイニング"
```

写真番号は記事の表示順で **1から**始まります。実行前の確認には `--dry-run` を追加します。
一覧の表紙だけを変更する場合は `--photo=cover` を指定してください。
記事写真と表紙が同じ画像を参照していた場合は、両方を更新します。

## 写真を追加

```powershell
npm.cmd run gallery:update -- --project=wakon-yosai-residence --add --file="garden.jpg" --caption="庭につながる空間"
```

追加写真を表紙にも使う場合は `--make-cover` を追加します。
この操作では写真を削除しません。

## 新規施工事例

準備済みの2フォルダー：

- `img/gallery/originals/NEW-01_新規施工事例/`
- `img/gallery/originals/NEW-02_新規施工事例/`

写真を `01-exterior.jpg`、`02-living.jpg` のように並べると、その順に記事へ入ります。
最初の写真が表紙にも使われます。名前や所在地は実際の内容に置き換えてください。

```powershell
npm.cmd run gallery:update -- --new --project=new-house-slug --folder="NEW-01_新規施工事例" --title="実際の施工事例名" --area="実際の市町村" --dry-run
```

内容を確認してから `--dry-run` を外すと、一覧の先頭に新しい施工事例を追加します。
`--project` は半角英小文字・数字・ハイフンの重複しないIDです。
写真の説明・間取り・面積・完成年・紹介文は、確認できる資料を使って別途追加します。
数値や仕様は写真から推測して入力しません。

## コマンドが行うこと

- 原本を残したまま、向きを補正し、最大辺640・1280・2000pxの画像を作成
- 拡大せず、lossless WebPで保存（サイズ縮小された表示用画像。原本の画素数は維持）
- データ・一覧・記事・前後の記事リンク・画像拡大リンクを更新
- 現在のヘッダー・モバイルメニューを再適用し、サイトマップを更新
- `dist` があれば、ギャラリーのページと画像も更新
- 変更前のデータを `tmp/gallery-updates/日時/` に保存

原本と受付用フォルダーはGitとdistに含めません。古い公開画像は、別ページや
過去の記事が使っている可能性があるため、自動削除しません。整理前の参照対応表は
`gallery/image-paths.json` に残します。

ホームページなどに個別に配置した写真は独立した選択です。そこも差し替える場合は
対象を指定してください。記事写真の変更だけで無関係なページの写真は変えません。

## 確認・アップロード

```powershell
npm.cmd run check
npm.cmd run preview
```

表示確認後、Lolipop用は `npm.cmd run build:preview`、本番公開用は
`npm.cmd run build:production` でdistを作り直します。アップロードするのはdistの内容です。
HTML・画像を両方アップロードしてください。Gitにpushする場合は生成画像も含めます。

全ギャラリーをデータから再生成する場合は `npm.cmd run gallery:build`。
既存の公開画像をプロジェクト別フォルダーへ再整理する場合は
`npm.cmd run gallery:organize` を使います。処理は原本や旧画像を削除しません。

この仕組みは施工事例ギャラリー用です。動画写真は `videos/posts.json`、
ブログやイベントはそれぞれの投稿データで管理します。
