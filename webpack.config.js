import path from "path";

const dflt = {
  mode: "production",
  entry: "./dist/jgdtrans.js",
  output: {
    path: path.resolve("dist"),
    filename: "jgdtrans.nomodule.js",
    library: "jgdtrans",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /\.test\.ts$/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    minimize: false,
  },
};

const noMin = {
  ...dflt,
  output: {
    filename: "jgdtrans.nomodule.min.js",
  },
  optimization: {
    minimize: true,
  },
};

export default [dflt, noMin];
