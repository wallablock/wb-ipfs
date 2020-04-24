import request from 'request-promise';
import ipfsClient from 'ipfs-http-client';
import { globSource } from 'ipfs-http-client';

export class IpfsConnection {
    constructor(
        public proxyUrl: string) {}

    private get prefix() {
        return `http://${this.ip}:${this.publicPort}`
    }

    private async checkImage(link: string): Promise<boolean> {
        const contType = (await request.head(link))["content-type"];
        return (contType === "image/jpeg" || contType === "image/png");
    }
}
