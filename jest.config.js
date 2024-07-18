module.exports = {
    transform: {
        "^.+\\.(js|jsx)$": "babel-jest"
    },
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
    testEnvironment: "jsdom"
};
