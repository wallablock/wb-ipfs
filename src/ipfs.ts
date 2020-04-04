import request from 'request-promise';
/*
import fs from 'fs';
import path from 'path';
import ipfsClient from 'ipfs-http-client';
*/

export class IpfsConnection {
    constructor(
        public ip: string,
        public port: number = 8080) {}

    private get prefix() {
        return `http://${this.ip}:${this.port}`
    }

    public async read(hash: string): Promise<string[]> {
        const response = JSON.parse(await request(`${this.prefix}/api/v0/ls/${hash}`));
        if (response.Objects[0].Links.length === 0) {
            let link = `${this.prefix}/ipfs/${response.Objects[0].Hash}`;
            if (await this.checkImage(link)) {
                return [link];
            } else {
                return [];
            }
        } else {
            let links = [];
            for (let l of response.Objects[0].Links) {
                const link = `${this.prefix}/ipfs/${l.Hash}`;
                if (await this.checkImage(link)) {
                    links.push(link);
                }
            }
            return links;
        }
    }

    private async checkImage(link: string): Promise<boolean> {
        const contType = (await request.head(link))["Content-Type"];
        return (contType === "image/jpeg" || contType === "image/png");
    }
}

// Unfinished code; not converting
/*
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
*/
