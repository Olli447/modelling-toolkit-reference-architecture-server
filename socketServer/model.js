class Model {
    modelID;
    languageID;
    content;

    constructor(modelID, languageID, content) {
        this.modelID = modelID;
        this.languageID = languageID;
        this.content = content;
    }

    updateContent(content) {
        this.content = content;
    }
}
module.exports = Model;
