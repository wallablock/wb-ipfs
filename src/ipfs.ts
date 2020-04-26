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

    public async coverUrl(dirCid: string): Promise<string> {
        //Request to check that link doesn't respond with 404
        let response = await this.proxyFetch.get(`/wb/${dirCid}/cover`);
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
