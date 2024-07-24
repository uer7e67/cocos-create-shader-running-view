import { NodeEventType } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { gmap } from './gmap';
const { ccclass, property } = _decorator;


enum btype {
    sky,
    grass,
    dirt,
    stone,
    iron,
    diamond,
}


@ccclass('gmap_tile')
export class gmap_tile extends Component {

    start() {
        // console.log(" ======= tiled ======= ");
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        console.log(" ================ ")
        if(this.blockType == btype.sky) {
            return;
        }
        this.node.destroy();
    }

    protected onDestroy(): void {
        this.node.off(NodeEventType.TOUCH_END);
    }

    public blockType: btype ;

    public x: number = 0;

    public y: number = 0;

    public map: gmap;


    public getLeft() : gmap_tile {
        return this.map.getBlock(this.x, this.y)
    }

    update(deltaTime: number) {
        
    }
}


