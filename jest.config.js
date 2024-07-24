module.exports = {
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest"
    },
    moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
    transformIgnorePatterns: ["/node_modules/(?!axios)"]
};