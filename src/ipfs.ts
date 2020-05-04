import axios, { AxiosInstance, AxiosResponse } from "axios";
import mime from "mime";
import FormData from "form-data";
//import fs from "fs";

interface OfferDirInfo {
  descLink: string | null;
  imagesLink: string[];
}

interface FileWB {
    name: string;
    //contents: fs.ReadStream;
    contents: ArrayBuffer;
}

export class IpfsConnection {
  private proxyFetch: AxiosInstance;
  constructor(public readonly proxyUrl: string) {
    this.proxyFetch = axios.create({
      baseURL: proxyUrl,
    });
  }

  public coverUrl(dirCid: string): string {
    return `${this.proxyUrl}/wb/${dirCid}/cover`;
  }

  public async fetchDesc(dirCid: string): Promise<string | null> {
    let response = await this.proxyFetch.get(`/wb/${dirCid}/desc`);
    return response.data;
  }

  public async getAllImagesUrl(dirCid: string): Promise<string[]> {
    const dirInfoReq: AxiosResponse<OfferDirInfo> = await this.proxyFetch.get(
      `/wb/${dirCid}`
    );
    return dirInfoReq.data.imagesLink.map(
      (imgCid) => `${this.proxyUrl}/${imgCid}`
    );
  }

  public async uploadFiles(files:FileWB[]): Promise<string> {
      let imgCount = 0;
      let form = new FormData();
      try {
          for (let fileWB of files) {
              let extensionIndex = fileWB.name.lastIndexOf(".");
              if (extensionIndex == -1) throw "No extension";
              let extension = fileWB.name.slice(
                extensionIndex,
                fileWB.name.length
              );
              let newName;
              let mimeType = mime.getType(extension);
              if (!mimeType) throw "Invalid MIME type";
              if (mimeType.startsWith('text/')) {
                  newName = 'desc.txt';
                  form.append(newName,fileWB.contents);
              }
              else if (mimeType.startsWith('image/')) {
                  if (imgCount < 10) newName = `img0${imgCount}${extension}`;
                  else newName = `img${imgCount}${extension}`;
                  form.append(newName,fileWB.contents);
                  imgCount++;
              }
              else throw "File with invalid extension";
          }
          let response = await this.proxyFetch.post('/wb/upload', form, {
              headers: form.getHeaders()
          });
          return response.data;
      }
      catch (err) {
          console.log(err);
      }
      return "Error";
  }
}

/*async function test() {
    let ipfs = new IpfsConnection("http://192.168.1.20:3000");
    let files:FileWB[] = [
        {name: "jajalol.jpg",contents: fs.createReadStream("/home/guillem/Desktop/Wallablock/tests/ofertaValida/img00.jpg")},
        {name: "uwu.txt",contents: fs.createReadStream("/home/guillem/Desktop/Wallablock/tests/ofertaValida/desc.txt")},
        {name: "ei.jpg",contents: fs.createReadStream("/home/guillem/Desktop/Wallablock/tests/ofertaValida/img01.jpg")},
    ]
    console.log(await ipfs.uploadFiles(files));
}
test();*/
