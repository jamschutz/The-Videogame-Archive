export class Website {
    constructor(data: any) {
        this.id = data['id'];
        this.name = data['name'];
        this.founders = data['founders'];
        this.yearStarted = data['yearStarted'];
        this.yearEnded = 'yearEnded' in data? data['yearEnded'] : null;
        this.url = data['url'];
        this.country = data['country'];
        this.isActive = data['isActive'];
        this.type = data['type'];
    }

    public id: number;
    public name: string;
    public founders: Array<string>;
    public yearStarted: number;
    public yearEnded?: number;
    public url: string;
    public country: string;
    public isActive: boolean;
    public type: string;
}