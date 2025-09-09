import { MapObject } from '../MapObject';

export class Connection extends MapObject {
    constructor(
        x: number,
        y: number,
        mapWidth: number,
        mapHeight: number,
        image: string,
        rotation: 0 | 90 | 180 | 270 = 0,
    ) {
        super(x, y, mapWidth, mapHeight, image, rotation);
    }
    
    get isPassable(): boolean {
        return true;
    }

    getDescription() {
        return 'Passage';
    }
}
