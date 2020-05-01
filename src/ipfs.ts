import axios, { AxiosInstance, AxiosResponse } from "axios";

interface OfferDirInfo {
    descLink: string | null,
    imagesLink: string[]
}

export class IpfsConnection {
    private proxyFetch: AxiosInstance;
    constructor(
        public readonly proxyUrl: string)
    {
            this.proxyFetch = axios.create({
            baseURL: proxyUrl
        })
    }

    public coverUrl(dirCid: string): string {
        return `${this.proxyUrl}/wb/${dirCid}/cover`;
    }

    public async fetchDesc(dirCid: string): Promise<string | null> {
        let response = await this.proxyFetch.get(`/wb/${dirCid}/desc`);
        return response.data;
    }

    public async getAllImagesUrl(dirCid: string): Promise<string[]> {
        const dirInfoReq: AxiosResponse<OfferDirInfo> = await this.proxyFetch.get(`/wb/${dirCid}`);
        return dirInfoReq.data.imagesLink.map(imgCid => `${this.proxyUrl}/${imgCid}`);
    }
}
