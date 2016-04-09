module.exports = {
    entry: "./app.js",
    output: {
        path: "./examples",
        filename: "mainapp.js" // Template based on keys in entry above
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};
