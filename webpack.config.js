import path from "path";

export default {
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
};
