import request from 'request-promise';

export async function IPFSread(IPFSip: string, IPFShash: string): Promise<string[]> {
    const prefix = `http://${IPFSip}:8080`;
    const body = await request(`${prefix}/api/v0/ls/${IPFShash}`);
    let responseJSON = JSON.parse(body);
    if (responseJSON.Objects[0].Links.length == 0) {
        return [`${prefix}/ipfs/${responseJSON.Objects[0].Hash}`];
    } else {
        return responseJSON.Objects[0].Links.map((link: any) => `${prefix}/ipfs/${link.Hash}`);
    }
}
