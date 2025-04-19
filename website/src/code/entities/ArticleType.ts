export class ArticleType {
    constructor(data: any) {
        this.id = data['id'];
        this.name = data['name'];
    }

    public id: number;
    public name: string;
}