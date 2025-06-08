module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: false,
          fs: false,
        },
      },
      module: {
        rules: [
          {
            test: /\.wasm$/,
            type: "webassembly/async",
          },
        ],
      },
      experiments: {
        asyncWebAssembly: true,
      },
    },
  },
  devServer: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
}; 