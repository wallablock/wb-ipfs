import request from 'request-promise';

export async function IPFSread(IPFSip: string, IPFShash: string): Promise<string[]> {
    const prefix = 'http://' + IPFSip + ':8080';
    const body = await request(prefix + '/api/v0/ls/' + IPFShash);
    let responseJSON = JSON.parse(body);
    var links = [];
    if (responseJSON.Objects[0].Links.length == 0) {
        links.push(prefix + '/ipfs/' + responseJSON.Objects[0].Hash);
    }
    else {
        for (var i = 0; i < responseJSON.Objects[0].Links.length; ++i) {
            links.push(prefix + '/ipfs/' + responseJSON.Objects[0].Links[i].Hash);
        }
    }
    return links;
}
