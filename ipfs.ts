import axios, { AxiosInstance, AxiosResponse } from "axios";
import mime from "mime";

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

  public async uploadFiles(files:File[], desc:File): Promise<string> {
      let imgCount = 0;
      let form = new FormData();
      
      if (files.length === 0 && desc === null) {
        return "";
      }

      if (desc != null) {
        form.append("desc.txt", desc);
      }
     
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
          if (mimeType.startsWith('image/')) {
              if (imgCount < 10) newName = `img0${imgCount}${extension}`;
              else newName = `img${imgCount}${extension}`;
              form.append(newName,fileWB);
              imgCount++;
          }
          else throw "File with invalid extension";
      }
      let response = await this.proxyFetch.post('/wb/upload', form, {
          headers: {
            'content-type': 'multipart/form-data'
        }
      });
      return response.data;
  }
}

