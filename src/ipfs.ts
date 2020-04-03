import request from 'request-promise';
import fs from 'fs';
import path from 'path';
import ipfsClient from 'ipfs-http-client';

export async function IPFSread(IPFSip: string, IPFShash: string): Promise<string[]> {
    const prefix = `http://${IPFSip}:8080`;
    const body = await request(`${prefix}/api/v0/ls/${IPFShash}`);
    let responseJSON = JSON.parse(body);
    let links:string[] = [];
    if (responseJSON.Objects[0].Links.length == 0) {
        let link = `${prefix}/ipfs/${responseJSON.Objects[0].Hash}`;
        if (await checkImage(link)) links.push(link);
    }
    else {
        for (let i = 0; i < responseJSON.Objects[0].Links.length; ++i) {
            let link = `${prefix}/ipfs/${responseJSON.Objects[0].Links[i].Hash}`;
            if (await checkImage(link)) links.push(link);
        }
    }
    return links;
}

async function checkImage(link: string): Promise<boolean> {
    let head = await request.head(link);
    return (head["content-type"] == "image/jpeg" || head["content-type"] == "image/png");
}

//Only works if node is at localhost
export async function IPFSwrite(IPFSip: string, filePath: string) {
    let link = `http://${IPFSip}:5001`
    let files = getAllFiles(filePath);
    let ipfs = ipfsClient(link);
    let res = await ipfs.add(files,[],[]);
    return res;
}

type IPFSFile = {
    path: string;
    mtime
}

function getAllFiles(dirPath: string, originalPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []
  originalPath = originalPath || path.resolve(dirPath, "..")

  folder = path.relative(originalPath, path.join(dirPath, "/"))

  arrayOfFiles.push({
      path: folder.replace(/\\/g, "/"),
      mtime: fs.statSync(folder).mtime
  })

  files.forEach(function (file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
          arrayOfFiles = getAllFiles(dirPath + "/" + file, originalPath, arrayOfFiles)
      } else {
          file = path.join(dirPath, "/", file)

          arrayOfFiles.push({
              path: path.relative(originalPath, file).replace(/\\/g, "/"),
              content: fs.readFileSync(file),
              mtime: fs.statSync(file).mtime
          })
      }
  })
  return arrayOfFiles;
}
