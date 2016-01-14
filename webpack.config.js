module.exports = {
    entry: "./app.js",
    output: {
        path: __dirname + "/static",
        filename: "app.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    devtool: "#inline-source-map"
};
