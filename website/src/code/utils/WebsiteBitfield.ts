export class WebsiteBitfield {
    private activeWebsites : number;

    constructor(activeWebsites: Array<number>) {
        this.activeWebsites = 0;
        this.updateActiveWebsites(activeWebsites);
    }


    public updateActiveWebsites(activeWebsites: Array<number>) : void {
        this.activeWebsites = 0;
        for(let websiteId of activeWebsites) {
            console.log(`adding: ${websiteId}`);
            this.activeWebsites |= 1 << (websiteId - 1);
        }
    }
    public setActiveWebsites(activeWebsites: number) : void {
        this.activeWebsites = activeWebsites;
    }


    public isActive(websiteId : number) : boolean {
        return (this.activeWebsites & (1 << websiteId - 1)) != 0;
    }

    public toNumber() : number {
        return this.activeWebsites;
    }


    static getAllWebsitesInteger() : number {
        let n = 0;
        for(let i = 0; i < 64; i++) {
            n |= 1 << i;
        }
        return n;
    }
}