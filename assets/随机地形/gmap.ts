import { debug } from 'cc';
import { Layout } from 'cc';
import { director } from 'cc';
import { _decorator, Component, Node, SpriteFrame, Label, math, Prefab, instantiate, Vec2, Vec3, Sprite, Color } from 'cc';
import { gmap_tile } from './gmap_tile';
const { ccclass, property } = _decorator;


// import * as tools from 'foo';


let frequence = 0.002;
let amplitude = 0.05;

let perlin;
const PERLIN_SIZE = 4095;

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;

let perlin_octaves = 4; // default to medium smooth
let perlin_amp_falloff = 0.5; // 50% reduction/octave
const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));

enum btype {
    sky,
    grass,
    dirt,
    stone,
    iron,
    diamond,
}


@ccclass('gmap')
export class gmap extends Component {

    @property(SpriteFrame)
    public mapblock: SpriteFrame = null;

    @property(Label)
    public mname: Label ;

    @property(Node)
    public mapNode : Node;

    @property(Prefab)
    public block: Prefab;

    public width: number = 60;

    public height: number = 30;

    start() {
        this.t = this.test();
        // this.noiseSeed(888888);      

    }

    StartFunc(name: string) {
        if(typeof(this[name]) == 'function') 
        {
            this[name]();
        }
    }

    private t;

    private tiles : Node[] = [];

    public * test() {
        // for(var i = 0; i < 10; i ++) {
        //     console.log("frame" + director.getTotalFrames())
        //     console.log("i ====" +i);
        //     yield;
        // }

        let index = 0;
        for(let y = 0; y < this.height ; y ++) {
            for(let x = 0; x < this.width; x ++) {

                let noiseValue = this.noise(x * amplitude, y * amplitude, frequence);

                let data = {
                    x, y, noiseValue, type: btype.sky,
                }

                index ++;
                var b = instantiate(this.block); 
                this.mapNode.addChild(b);
                b.setPosition(new Vec3(x * 12, y * 12));

                this.paintTiles(b, data, 0);
                this.drawStone(b, data, 0);

                yield;
            }
        }
    }

    public getBlock(x: number, y: number) {
        
        // 0, 0
        return this.block[x+y];
        // 1, 0
        


    }

    public paintTiles(b, data, index) 
    {
        let {x, y, noiseValue} = data;
        let noiseAmount = noiseValue * x;
        let yLevel = this.height - y;
        let type = btype.sky;
        if(noiseAmount < yLevel * 0.4) {
            b.getComponent(Sprite).color = Color.GRAY;
            type = btype.stone;
        }
        else if(noiseAmount < yLevel * 0.5) {
            b.getComponent(Sprite).color = new Color("#964C12");
            type = btype.diamond;
        }
        else {
            b.getComponent(Sprite).color = Color.WHITE;
            type = btype.sky;
        }

        b.getComponent(gmap_tile).blockType = type;
        b.getComponent(gmap_tile).x = data?.x;
        b.getComponent(gmap_tile).y = data?.y;
        b.getComponent(gmap_tile).map = this;
    }

    public drawStone(b, data, index = 0) {
        let {x, y, noiseValue} = data;
        let noiseAmount = noiseValue * x;
        let yLevel = this.height - y;

        if(noiseAmount < yLevel * 0.1 && math.random() < 0.05) {
            b.getComponent(Sprite).color = Color.BLUE;
        }
    }

    update(deltaTime: number) {
        this.t.next();    
    }
   
    public noiseSeed(seed) {
        const lcg = (() => {
            const m = 4294967296;
            const a = 1664525;
            const c = 1013904223;
            let seed, z;
            return {
                setSeed(val) {
                    z = seed = (val == null ? Math.random() * m : val) >>> 0;
                },
                getSeed() {
                    return seed;
                },
                rand() {
                    z = (a * z + c) % m;
                    return z / m;
                }
            };
        })();
        lcg.setSeed(seed);
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = lcg.rand();
        }
    }
    
    public noise(x: number, y: number, z: number = 1) {
        if (perlin == null) {
            perlin = new Array(PERLIN_SIZE + 1);
            for (let i = 0; i < PERLIN_SIZE + 1; i++) {
                perlin[i] = Math.random();
            }
        }
        if (x < 0) {
            x = -x;
        }
        if (y < 0) {
            y = -y;
        }
        if (z < 0) {
            z = -z;
        }

        let xi = Math.floor(x),
            yi = Math.floor(y),
            zi = Math.floor(z);
        let xf = x - xi;
        let yf = y - yi;
        let zf = z - zi;
        let rxf, ryf;

        let r = 0;
        let ampl = 0.5;

        let n1, n2, n3;

        for (let o = 0; o < perlin_octaves; o++) {
            let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

            rxf = scaled_cosine(xf);
            ryf = scaled_cosine(yf);

            n1 = perlin[of & PERLIN_SIZE];
            n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
            n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
            n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
            n1 += ryf * (n2 - n1);

            of += PERLIN_ZWRAP;
            n2 = perlin[of & PERLIN_SIZE];
            n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
            n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
            n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
            n2 += ryf * (n3 - n2);

            n1 += scaled_cosine(zf) * (n2 - n1);

            r += n1 * ampl;
            ampl *= perlin_amp_falloff;
            xi <<= 1;
            xf *= 2;
            yi <<= 1;
            yf *= 2;
            zi <<= 1;
            zf *= 2;

            if (xf >= 1.0) {
                xi++;
                xf--;
            }
            if (yf >= 1.0) {
                yi++;
                yf--;
            }
            if (zf >= 1.0) {
                zi++;
                zf--;
            }
        }
        return r;
    }

}