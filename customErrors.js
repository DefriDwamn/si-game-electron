
class QuestionFileError extends Error {
    constructor(message) {
        super(`Invalid question file: ${message}`);
        this.name = "QuestionFileError";
    }
}
module.exports = {
    QuestionFileError
}