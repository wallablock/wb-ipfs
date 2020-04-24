import request from "request-promise";

interface OfferDirInfo {
    descLink: string | null,
    imagesLink: string[]
}

export class IpfsConnection {
    constructor(
        public proxyUrl: string) {}

    public coverUrl(dirCid: string): string {
        return `${this.proxyUrl}/wb/${dirCid}/cover`;
    }

    public async fetchDesc(dirCid: string): Promise<string | null> {
        return request(`${this.proxyUrl}/wb/${dirCid}/desc`);
        /* TODO: Error handling */
    }

    public async getAllImagesUrl(dirCid: string): Promise<string[]> {
        const dirInfo: OfferDirInfo = await request({
            url: `${this.proxyUrl}/wb/${dirCid}`,
            json: true
        });
        /* TODO: Error handling */
        return dirInfo.imagesLink.map(imgCid => `${this.proxyUrl}/${imgCid}`);
    }
}
