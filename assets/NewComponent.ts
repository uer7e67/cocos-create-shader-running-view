import { _decorator, Component, debug, director, Node, Noise } from 'cc';
import { aaa } from './lib/foo';
import { Graphics } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {


    @property(Graphics)
    gggg : Graphics = null;
    
    start() {
        // 
        // setTimeout(() => {
        //     var n =  new Noise();
        //     n.test(); 

        // }, 100);

        // this.gggg.impl


    }

    update(deltaTime: number) {
        // console.log(" ======== director.getTotalFrames(); ===" + director.getTotalFrames());
    }
}


