import request from 'request-promise';
import ipfsClient from 'ipfs-http-client';
import { globSource } from 'ipfs-http-client';

export class IpfsConnection {
    constructor(
        public ip: string,
        public publicPort: number = 8080,
        public privatePort: number = 5001) {}

    private get prefix() {
        return `http://${this.ip}:${this.publicPort}`
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

    public async write(filePath: string): Promise<string> {
        const link = `http://${this.ip}:${this.privatePort}`;
        let ipfs = ipfsClient(link);
        let file;
        for await (file of ipfs.add(globSource(filePath, { recursive: true}))) {}
        return file.cid;
    }

    private async checkImage(link: string): Promise<boolean> {
        const contType = (await request.head(link))["Content-Type"];
        return (contType === "image/jpeg" || contType === "image/png");
    }
}
