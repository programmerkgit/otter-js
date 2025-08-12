# 使い方

## セットアップ

### Node.jsのインストール

Node.jsを入れるにはvoltaというツールがオススメです。 voltaを使ってnode.jsをインストールする手順を書いておきます。

#### Unix, Macの場合

```shell
curl https://get.volta.sh | bash
volta install node
```

#### Windowsの場合

```shell
curl https://get.volta.sh | bash
winget install Volta.Volta # windowsの場合
```

### 依存関係のインストール

実行する前に事前に依存関係をインストールする必要があります。

```shell
npm install
```

## テストの実行

```shell
npm run test
```

## main.tsの実行

```shell
npm run start
```

#  

# Webビューアーの利用

[Webビューアー](https://otterjscompiler.web.app/)上でOtterJSのコードをコンパイル・実行して内部の動きを確認できます。

