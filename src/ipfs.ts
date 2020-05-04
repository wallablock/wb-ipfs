import axios, { AxiosInstance, AxiosResponse } from "axios";
import mime from "mime";
import FormData from "form-data";

interface OfferDirInfo {
  descLink: string | null;
  imagesLink: string[];
}

interface FileWB {
    name: string;
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
      let response:AxiosResponse = await this.proxyFetch.post('/wb/upload', form, {
          headers: {
              'Content-Type': 'multipart/form-data',
          }
      });
      return response.data;
  }
}
