const log = require("./log")
const parser = require("./parser");

fmts = {
    "json": {
        fileSuffix: '.json',
        fileHead: "",
        keyWrap: { left: "\"", right: "\"" },
        arrayBrace: { left: "[", right: "]" },
        objectBrace: { left: "{", equal: ": ", right: "}" },
    },
    "lua": {
        fileSuffix: '.lua',
        fileHead: "return ",
        keyWrap: { left: "", right: "" },
        arrayBrace: { left: "{", right: "}" },
        objectBrace: { left: "{", equal: " = ", right: "}" },
    },
};

function isEmpty(field) {
    var t = typeof (field)
    if (t === 'undefined') {
        return true;
    } else if (t == "string") {
        return !field.trim() || field.trim().length === 0
    } else {
        return false;
    }
}

function generate(sheet, type) {
    var fmt = fmts[type]
    var descs = sheet.data[0];
    var names = sheet.data[1];
    var types = sheet.data[2];
    var fields = parseFields(types, names);

    const buffer = []
    buffer.push(fmt.fileHead + fmt.arrayBrace.left + "\n");
    writeColumns(buffer, fmt, fields, descs)
    writeColumns(buffer, fmt, fields, names)

    for (var i = 4; i < sheet.data.length; i++) {
        var columns = sheet.data[i];
        var columnLen = getColumLength(fields)

        if (isEmpty(columns[0])) {
            continue;
        }

        buffer.push("\t" + fmt.arrayBrace.left);
        for (var j = 0; j < columnLen; j++) {
            var field = fields[j];

            if (parser.isSkipType(field.type)) {
                continue;
            }

            var columnValue = preprocessData(fields, columns, j)
            buffer.push(parser.parseValue(fmt, field, columnValue))
            if (j + 1 < columnLen) {
                buffer.push(", ");
            }
        }
        buffer.push(fmt.arrayBrace.right);
        if (i + 1 < sheet.data.length) {
            buffer.push(",\n");
        }
    }
    buffer.push("\n" + fmt.arrayBrace.right);

    return {
        fileName: sheet.name + fmt.fileSuffix,
        fileContent: buffer.join(''),
    };
}

function getColumLength(types) {
    var length = 0;
    for (var i = 0; i < types.length; i++) {
        if (!parser.isSkipType(types[i].type)) {
            length = i + 1;
        }
    }
    return length;
}

function preprocessData(types, columns, idx) {
    var type = types[idx].type;

    if (type == parser.FIELD_TYPES.MULTI_LINE_ARRAY) {
        var values = [];
        var separator = parser.getTypeSeparator(types[idx].subType)

        values.push(columns[idx]);
        values.push(separator);

        for (var i = idx + 1; i < columns.length; i++) {
            var columnType = types[i].type
            if (parser.isSkipType(columnType)) {
                values.push(columns[i]);
                values.push(separator);
            }
        }

        if (values.length > 0) {
            values.pop();
        }

        return values.join('');
    } else {
        return columns[idx];
    }
}

function parseFields(types, names) {
    var fields = [];
    for (var i = 0; i < types.length; i++) {
        var field = parser.parseType(types[i]);

        if (field.type == parser.FIELD_TYPES.ERROR) {
            log.error("Field type error, name: " + names[i])
        }

        fields.push(field);
    }
    return fields
}

function writeColumns(buffer, fmt, fields, columns) {
    buffer.push("\t" + fmt.arrayBrace.left);
    for (var i = 0; i < columns.length; i++) {
        var field = fields[i];
        if (parser.isSkipType(field.type)) {
            continue;
        }
        buffer.push("\"" + columns[i] + "\"")
        if (i + 1 < columns.length) {
            buffer.push(", ");
        }
    }
    buffer.push(fmt.arrayBrace.right + ",\n");
}

function generateConsts(sheet, type) {
    var fmt = fmts[type]
    const buffer = []

    buffer.push(fmt.fileHead + fmt.objectBrace.left + "\n");
    for (var i = 1; i < sheet.data.length; i++) {
        var data = sheet.data[i];

        var name = data[0];
        if (isEmpty(name)) {
            continue;
        }

        if (data.length < 4) {
            log.error("The number of columns must not be less than 4.")
            break;
        }

        var types = parser.parseType(data[1]);
        var value = parser.parseValue(fmt, types, data[2]);
        var desc = data[3];

        if (parser.isSkipType(types.type)) {
            log.error(`Data type error, skip current row[${name}] data`)
            continue;
        }

        buffer.push("\t" + fmt.keyWrap.left + name.toUpperCase() + fmt.keyWrap.right)
        buffer.push(fmt.objectBrace.equal + value);
        buffer.push(",\n");
    }

    if (buffer.length > 1) {
        buffer.pop();
    }
    buffer.push("\n" + fmt.objectBrace.right);

    return {
        fileName: sheet.name + fmt.fileSuffix,
        fileContent: buffer.join(''),
    };
}

module.exports = {
    generate: generate,
    generateConsts: generateConsts,
}