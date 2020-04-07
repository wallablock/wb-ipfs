import fs from 'fs';
import request from 'request-promise';
import ipfsClient from 'ipfs-http-client';

export async function IPFSread(IPFSip: string, IPFShash: string): Promise<string[]> {
    const prefix = `http://${IPFSip}:8080`;
    const body = await request(`${prefix}/api/v0/ls/${IPFShash}`);
    let responseJSON = JSON.parse(body);
    let links:string[] = [];
    if (responseJSON.Objects[0].Links.length == 0) {
        let link = `${prefix}/ipfs/${responseJSON.Objects[0].Hash}`;
        if (await checkImage(link)) links.push(link);
    }
    else {
        for (let i = 0; i < responseJSON.Objects[0].Links.length; ++i) {
            let link = `${prefix}/ipfs/${responseJSON.Objects[0].Links[i].Hash}`;
            if (await checkImage(link)) links.push(link);
        }
    }
    return links;
}

async function checkImage(link: string): Promise<boolean> {
    let head = await request.head(link);
    return (head["content-type"] == "image/jpeg" || head["content-type"] == "image/png");
}

//Serà substituït per una crida al proxy, el proxy tindrà un codi similar a aquest
export async function IPFSwrite(IPFSip: string, filePath: string): Promise<string> {
    let link:string = `http://${IPFSip}:5001`
    let ipfs = ipfsClient(link);
    const { globSource } = ipfsClient;
    let file;
    for await (file of ipfs.add(globSource(filePath, { recursive: true }))) {}
    return file.cid;
}
