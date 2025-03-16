module.exports = {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: ["@babel/plugin-transform-runtime"],
    transform: {
        "^.+\.tsx?$": "ts-jest",
        "^.+\.tsx?$": "babel-jest",
    },
    moduleFileExtensions: ["js", "jsx", "ts","tsx", "json"]



};