const filesArrayToBufferArray = (req,res,next) => {
  const {files} = req.body;
  const bufferArray = [];
  if(files) {
    for(let file of files) {
      const buf = Buffer.from(file);
      console.log("File ", file);
      console.log("Buf ", buf);
      bufferArray.push(buf);
    }
  }
  console.log("Array ", bufferArray);

  req.filesInBuffer = bufferArray;
  next();
}

module.exports = filesArrayToBufferArray;