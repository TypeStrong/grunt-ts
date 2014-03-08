/// <reference path="../../defs/tsd.d.ts"/>
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var os = require('os');

var utils = require('./utils');

var eol = os.EOL;
var grunt = utils.grunt;

/////////////////////////////////////////////////////////////////////
// index : used to make external modules access easier
////////////////////////////////////////////////////////////////////
var completeFileExportTemplate = _.template('import <%=filename%> = require(\'<%= pathToFile %>\');' + eol + 'export = <%=filename%>;');

var indexPartialFileExportTemplate = _.template('import <%=filename%>_file = require(\'<%= pathToFile %>\');' + eol + 'export var <%=filename%> = <%=filename%>_file;');

function indexDirectory(destFolder) {
    var indexDirectory = path.join(destFolder, 'index');

    // We index all files except those in the index directory
    var tsFilesGlob = [
        path.join(destFolder, '**', '*.ts'),
        path.join('!' + indexDirectory, '*.ts'),
        path.join('!' + destFolder, '*.ts')
    ];

    // create an index directory if not already there:
    if (!fs.existsSync(indexDirectory)) {
        fs.mkdir(indexDirectory);
    }

    // Create modules for folders
    var dirs = utils.getDirs(destFolder, function (dir) {
        var normDir = path.normalize(dir);

        // Exclude index and the root folder itself
        return normDir === path.normalize(indexDirectory) || normDir === path.normalize(destFolder);
    });

    _.forEach(dirs, function (dir) {
        var subFiles = grunt.file.expand([path.join(dir, '**', '*.ts')]);
        var foldername = path.basename(dir);

        // Create file content for all the files:
        var fileContent = [];
        _.forEach(subFiles, function (completePathToFile) {
            var filename = path.basename(completePathToFile, '.ts');
            var pathToFile = utils.makeRelativePath(indexDirectory, completePathToFile.replace('.ts', ''));
            fileContent.push(indexPartialFileExportTemplate({ filename: filename, pathToFile: pathToFile }));
        });

        var destinationFile = path.join(indexDirectory, foldername + '.ts');
        fs.writeFileSync(destinationFile, fileContent.join(eol));
    });

    // Create modules for files
    // For each *.ts of destFolder create a filename.ts
    var tsFiles = grunt.file.expand(tsFilesGlob);
    _.forEach(tsFiles, function (completePathToFile) {
        var filename = path.basename(completePathToFile, '.ts');

        if (filename === 'index') {
            // Note: since the logic for creating modules for folders is before this
            // we will automatically override the folder.ts with an import of the correct index.ts
            filename = path.basename(path.dirname(completePathToFile));
        }

        var pathToFile = utils.makeRelativePath(indexDirectory, completePathToFile.replace('.ts', ''));

        var fileContent = completeFileExportTemplate({ filename: filename, pathToFile: pathToFile });
        var destinationFile = path.join(indexDirectory, filename + '.ts');
        fs.writeFileSync(destinationFile, fileContent);
        // Debug logs
        // grunt.log.writeln(fileContent.green);
        // grunt.log.writeln(destinationFile);
        // grunt.log.writeln(filename, pathToFile);
        // grunt.log.writeln(completePathToFile + ''.green);
    });
}

function indexDirectories(destFolders) {
    _.forEach(destFolders, function (folder) {
        return indexDirectory(folder);
    });
}
exports.indexDirectories = indexDirectories;
//# sourceMappingURL=index.js.map
