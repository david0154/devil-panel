import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Devil Panel - Next Generation Lightweight Hosting Control Panel" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
