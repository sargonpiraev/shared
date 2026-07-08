import { createMDX } from 'fumadocs-mdx/next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.DOCS_BASE_PATH ?? ''
const reactProduction = path.resolve(__dirname, '../../node_modules/react/cjs/react.production.js')
const reactDevelopment = path.resolve(__dirname, '../../node_modules/react/cjs/react.development.js')
const reactDomProduction = path.resolve(
  __dirname,
  '../../node_modules/react-dom/cjs/react-dom.production.js',
)
const reactDomDevelopment = path.resolve(
  __dirname,
  '../../node_modules/react-dom/cjs/react-dom.development.js',
)

/** @type {import('next').NextConfig} */
const config = {
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@sargonpiraev/seodit'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  webpack: (webpackConfig, { dev }) => {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      react: dev ? reactDevelopment : reactProduction,
      'react-dom': dev ? reactDomDevelopment : reactDomProduction,
    }
    return webpackConfig
  },
}

const withMDX = createMDX()

export default withMDX(config)
