import { readFileSync } from 'fs-extra';
import { join } from 'path';

declare const cce: any;

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        conbtn: "#con",
        anim: "#anim",
        

    },
    methods: {
        hello() {
            if (this.$.app) {
                this.$.app.innerHTML = 'hello';
                console.log('hello');
            }
        },

        onConfirm() {
            console.log(" ============= click ====================");
        },
    },
    ready() {
        if (this.$.app) {
            this.$.app.innerHTML = 'Hello Cocos.';
        }
        var self = this;

        this.$.anim?.addEventListener("change", async (event: any) =>  {
            var info = await Editor.Message.request('scene', 'query-component', event.target.value);
            // @ts-ignore
            console.log(" ======== info =========", info.value?.clips);
        });

    },
    beforeClose() { },
    close() { },


});
