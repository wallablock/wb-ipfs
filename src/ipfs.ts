import request from 'request-promise';

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
