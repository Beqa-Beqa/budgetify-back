const filesArrayToBufferArray = (req,res,next) => {
  const {files} = req.body;
  const bufferArray = [];
  if(files) {
    for(let file of files) {
      const buf = Buffer.from(file);
      bufferArray.push(buf);
    }
  }

  req.filesInBuffer = bufferArray;
  next();
}

module.exports = filesArrayToBufferArray;