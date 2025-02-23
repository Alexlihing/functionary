const mongoose = require('mongoose');
const FunctionDefSchema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    params: {
        type: [String],
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
FunctionDefSchema.index({ filePath: 1, name: 1 }, { background: true, timeout: 20000 });

const FunctionDef = mongoose.model('FunctionDef', FunctionDefSchema);

const FunctionCallSchema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true,
    },
    parentFunc: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    args: {
        type: [String],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
FunctionCallSchema.index({ filePath: 1, parentFunc: 1, name: 1 }, { background: true, timeout: 20000 });

const FunctionCall = mongoose.model('FunctionCall', FunctionCallSchema);

const FileStringSchema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    functionDefs: {
        type: [FunctionDefSchema],
        required: true,
    },
    functionCalls: {
        type: [FunctionCallSchema],
        required: true,
    },
});
FileStringSchema.index({ filePath: 1 }, { background: true, timeout: 20000 });

const FileString = mongoose.model('FileString', FileStringSchema);

module.exports = {
    FunctionDef,
    FunctionCall,
    FileString,
};
