const path = require("path");
const rspack = require("@rspack/core");

module.exports = {
  mode: "production",
  entry: {
    main: "./src/js/main.js",
  },
  output: {
    path: path.resolve(__dirname, "public/assets"),
    filename: "main.js",
    // Fonts (Bootstrap Icons) are emitted next to the CSS and referenced from here.
    publicPath: "/assets/",
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              // silence Bootstrap's deprecation noise from the build log
              sassOptions: { quietDeps: true },
            },
          },
        ],
        type: "javascript/auto",
      },
      {
        test: /\.css$/i,
        use: [rspack.CssExtractRspackPlugin.loader, "css-loader"],
        type: "javascript/auto",
      },
      {
        // Emit fonts flat next to main.css — the Go SSG copies regular files
        // from public/assets and errors on subdirectories.
        test: /\.(woff2?|ttf|eot|svg)$/i,
        type: "asset/resource",
        generator: { filename: "[name][ext]" },
      },
    ],
  },
  plugins: [
    new rspack.CssExtractRspackPlugin({
      filename: "main.css",
    }),
  ],
  optimization: {
    minimize: true,
  },
  // A single browser bundle; no code splitting needed for a static site.
  target: "web",
  devtool: false,
};
