export class UrlParamBitfield {
    private MAX_BITS_PER_NUM = 64;
    private activeWebsites : Array<number>;

    constructor(activeWebsites: Array<number>) {
        this.activeWebsites = [];
        this.updateActiveWebsites(activeWebsites);
    }


    public updateActiveWebsites(activeWebsites: Array<number>) : void {
        for(let websiteId of activeWebsites) {
            let index = this.getIndex(websiteId);
            this.activeWebsites[index] |= this.getBitMask(index, websiteId);
        }
    }
    public setActiveWebsites(activeWebsites: Array<number>) : void {
        this.activeWebsites = activeWebsites;
    }


    public isActive(websiteId : number) : boolean {
        if(this.activeWebsites.length == 0)
            return true;

        let index = this.getIndex(websiteId);
        return (this.activeWebsites[index] & this.getBitMask(index, websiteId)) != 0;
    }

    public toUrlParam() : string {
        if(this.activeWebsites.length === 0)
            return '';

        return this.activeWebsites.toString();
    }

    private getBitMask(index: number, websiteId: number) : number {
        let bitShiftOffset = index * this.MAX_BITS_PER_NUM;
        return 1 << (websiteId - bitShiftOffset) - 1;
    }

    private getIndex(websiteId: number) : number {
        let index = Math.floor(websiteId / this.MAX_BITS_PER_NUM);
        
        // make sure index exists...
        while(this.activeWebsites.length <= index) {
            this.activeWebsites.push(0);
        }

        return index;
    }

    static getAllMask() : Array<number> {
        return [];
    }
}