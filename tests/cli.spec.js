const expect = require("chai").expect;
const cmd = require("./cli");
const AppUtil = require("../lib/apputil.js");

describe("minify-all-cli", () => {
    it("minify-all-cli with default options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed",
                "--logLevel=info"
            ]
        );

        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });

    it("minify-all-cli with skip js, css and html compression options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed", 
                "--skipJS=true", "--skipCSS=true", "--skipHTML=true",
                "--logLevel=info"
            ]
        );
        
        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });
    
    it("minify-all-cli with skip mp3, mp4 extensions options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed", 
                "--skipFileExtensions=.mp3", "--skipFileExtensions=.mp4", 
                "--logLevel=info"
            ]
        );

        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });

    it("minify-all-cli with gzip false options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed", 
                "--doGzip=false", 
                "--logLevel=info"
            ]
        );
        
        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });

    it("minify-all-cli with process count options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed",
                "--processCount=1",
                "--logLevel=info"
            ]
        );

        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });

    it("minify-all-cli with optimum options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed",
                "--skipJS=true", "--skipCSS=true", "--skipHTML=true", 
                "--doGzip=true", 
                "--skipFileExtensions=.mp3", "--skipFileExtensions=.mp4", 
                "--processCount=10",
                "--logLevel=info"
            ]
        );

        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });
});