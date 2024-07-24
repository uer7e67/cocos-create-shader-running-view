import { EventKeyboard } from 'cc';
import { Color } from 'cc';
import { Label, Event } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



export class MyEvent extends Event {
    constructor(name: string, bubbles?: boolean, detail?: any) {
        super(name, bubbles);
        this.detail = detail;
    }
    public detail: any = null;  // 自定义的属性
}


@ccclass('glsl_list_item')
export class glsl_list_item extends Component {

    @property(Label)
    public text: Label = null; 

    public tid: number = 0;

    start() {   
        this.node.on(Node.EventType.TOUCH_END, () => {
            console.log(" ================== touch end ====================")

            var e = new MyEvent("click_item", true, this.tid);
            e.detail = this.tid;

            this.node.dispatchEvent(e)
        }, this)
    }   

    protected onLoad(): void {
        // this.text = this.getComponentInChildren(Label);
    }

    update(deltaTime: number) {
        
    }

    public onRefresh(t : number): void {
        if(t == this.tid) {
            this.text.color = Color.RED;
        } else {
            this.text.color = Color.WHITE;
        }
    }


}


