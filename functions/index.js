const fs = require("fs");
const path = require("path");

const removeFilesFromUploadsIfNotIncluded = (dirname, id, arrayOfFiles) => {
  const fullPath = path.join(dirname, `uploads/${id}`);

  let files;
  if(fs.existsSync(fullPath)) files = fs.readdirSync(fullPath);
  let filteredFiles;
  if(files && files.length > 0) {
    const argFileNames = arrayOfFiles.map(file => file.name);
    filteredFiles = files.filter((fileName) => argFileNames.indexOf(fileName) === -1);
    filteredFiles.forEach(file => fs.unlinkSync(path.join(dirname, `uploads/${id}/${file}`)));
  }

  return filteredFiles;
}

const removeEmptyFoldersFromUploads = (dirname) => {
  const folders = fs.readdirSync(path.join(dirname, "uploads"));
  folders.forEach((folder) => {
    const stats = fs.statSync(path.join(dirname, `uploads/${folder}`));
    if(stats.isDirectory()) {
      const files = fs.readdirSync(path.join(dirname, `uploads/${folder}`));
      if(files.length === 0) fs.rmSync(path.join(dirname, `uploads/${folder}`), {recursive: true, force: true});
    }
  });
}

module.exports = {removeFilesFromUploadsIfNotIncluded, removeEmptyFoldersFromUploads};