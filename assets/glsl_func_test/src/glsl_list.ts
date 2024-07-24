import { Prefab } from 'cc';
import { CCString, Event } from 'cc';
import { Sprite } from 'cc';
import { Material } from 'cc';
import { ScrollView } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { my_data } from './my_data';
import { instantiate } from 'cc';
import { MyEvent, glsl_list_item } from './glsl_list_item';
import { Slider } from 'cc';
import { Label } from 'cc';
import { VerticalTextAlignment } from 'cc';
import { Layers } from 'cc';
const { ccclass, property, executeInEditMode, string, type } = _decorator;

import { AssetManager } from "cc";
import { resources } from 'cc';
import { Vec3 } from 'cc';
import { EventHandle } from 'cc';
import { EventHandler } from 'cc';
const { BuiltinBundleName } = AssetManager;

@ccclass('glsl_list')
export class glsl_list extends Component {

    @property(ScrollView)
    view: ScrollView = null;

    @property([my_data])
    material_data: my_data[] = [];    // 

    @property(Material)
    test_material: Material = null;

    @property(Sprite)
    target_image: Sprite = null;

    @property(Prefab)
    view_item: Prefab = null;


    @property(Prefab)
    label_: Prefab = null;


    // //声明数组属性
    // @property([Node])
    // shuzu_node: Node[] = [];


    @property(Node)
    properties: Node = null;

    private _current_material: Material = null;    /// 当前选中的材质 

    private _items: glsl_list_item[] = [];

    private m_properties: { [key: string]: any } = {};



    start() {

        {

            var labelNode = new Node();
            var textLabel = labelNode.addComponent(Label);

            this.node.addChild(labelNode);

            textLabel.verticalAlign = VerticalTextAlignment.TOP;
            textLabel.enableWrapText = true;
            labelNode.layer = Layers.Enum.UI_2D;
        }


        if (this.test_material) {
            var properties = this.test_material.effectAsset.techniques[0].passes[0].properties;
            console.log("  ========= properties ============", properties);

        }

        if (this.material_data.length > 0) {
            for (var i = 0, len = this.material_data.length; i < len; i++) {
                var mtl = this.material_data[i];
                if (!!mtl) {

                    // 创建一个item
                    let pitem = instantiate(this.view_item);
                    let item = pitem.getComponent(glsl_list_item);

                    item.text.string = mtl.m_name.toString();
                    item.tid = i;

                    this.view.content.addChild(pitem);
                    this._items.push(item);

                }
            }
        }

        this.node.on("click_item", this.onClickItem, this);

    }

    async onClickItem(e: MyEvent) {
        let self = this;

        console.log(e);
        e.propagationImmediateStopped = true;
        this._items.forEach(i => {
            i.onRefresh(e.detail);
        });

        var index = e.detail;
        console.log(" =========== index ===========", index);
        var mtl = self.material_data[index];

        var properties = mtl.m_material.effectAsset.techniques[0].passes[0].properties;

        var values = Object.values(properties);
        var keys = Object.keys(properties);

        self.target_image.customMaterial = mtl.m_material;

        this.properties.destroyAllChildren();


        for (let index = 0; index < values.length; index++) {
            const element = values[index];
            console.log(element)
            var editor = element['editor'];
            var key = keys[index];

            if (editor && editor.slide == true) {

                var name = new Node("name")
                name.addComponent(Label).string = editor.tooltip;
                this.properties.addChild(name);
                name.layer = Layers.Enum.UI_2D;


                var spfb: Prefab = await new Promise((resolve) => {
                    resources.load("Slider", (err, res: Prefab) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        return resolve(res);
                    })
                })

                var slider = instantiate(spfb);
                slider.layer = Layers.Enum.UI_2D;
                this.properties.addChild(slider);

                slider.position = new Vec3(0, -100, 0)

                var sc = slider.getComponent(Slider);
                var eh = new EventHandler();

                eh.target = self.node;
                eh.component = "glsl_list";
                eh.customEventData = key;
                eh.handler = "onSlider"

                sc.slideEvents.push(eh);

                self.m_properties[key] = editor.range;

            }

        }


    }



    onSlider(e: any, d) {
        console.log("  ======== on slider  ===============", e.progress, "dddd", d);
        console.log(" ======== ", this.m_properties);

        var range = this.m_properties[d];
        console.log(range);
        this.target_image.material.setProperty(d, e.progress * range[1])

    }

}





// 加载引擎预制资源
// AssetManager.instance.loadBundle(BuiltinBundleName.INTERNAL, (err, bundle) => {
//     if(err) {
//         console.log(err);
//         return;
//     }
//     console.log(" ===== builde ===== ", bundle)
//     bundle.load<Prefab>("/default_prefab/ui/Slider.prefab", (err2, pfb) => {
//         if(err2) {
//             console.log(err2);
//             return;
//         }
//         var slider = instantiate(pfb);
//         slider.layer = Layers.Enum.UI_2D;
//         slider.parent = node;
//     });
// })

