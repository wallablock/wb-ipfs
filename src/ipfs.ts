import request from 'request-promise';
/*
import fs from 'fs';
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
//Serà substituït per una crida al proxy, el proxy tindrà un codi similar a aquest
export async function IPFSwrite(IPFSip: string, filePath: string): Promise<string> {
    let link:string = `http://${IPFSip}:5001`
    let ipfs = ipfsClient(link);
    const { globSource } = ipfsClient;
    let file;
    for await (file of ipfs.add(globSource(filePath, { recursive: true }))) {}
    return file.cid;
}
*/
