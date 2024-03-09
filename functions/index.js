const fs = require("fs");

const removeFilesFromUploadsIfNotIncluded = (id, arrayOfFiles) => {
  const fullPath = `uploads/${id}`;
  let files;
  if(fs.existsSync(fullPath)) files = fs.readdirSync(fullPath);
  let filteredFiles;
  if(files && files.length > 0) {
    const argFileNames = arrayOfFiles.map(file => file.name);
    filteredFiles = files.filter((fileName) => argFileNames.indexOf(fileName) === -1);
    filteredFiles.forEach(file => fs.unlinkSync(`uploads/${id}/${file}`));
  }

  return filteredFiles;
}

const removeEmptyFoldersFromUploads = () => {
  const folders = fs.readdirSync("uploads");
  folders.forEach((folder) => {
    const stats = fs.statSync(`uploads/${folder}`);
    if(stats.isDirectory()) {
      const files = fs.readdirSync(`uploads/${folder}`);
      if(files.length === 0) fs.rmSync(`uploads/${folder}`, {recursive: true, force: true});
    }
  });
}

module.exports = {removeFilesFromUploadsIfNotIncluded, removeEmptyFoldersFromUploads};