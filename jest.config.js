module.exports = {
    transform: {
        "^.+\\.(js|jsx)$": "<rootDir>/jest-transform.js"
    },
    transformIgnorePatterns: [
        "/node_modules/(?!axios/)"
    ],
    testEnvironment: "jsdom",
    moduleFileExtensions: ["js", "jsx"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
};