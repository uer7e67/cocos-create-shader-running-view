import { Mat4 } from 'cc';
import { Color, debug, dynamicAtlasManager, errorID, RenderData, Sprite, SpriteFrame, UIRenderer, Vec2 } from 'cc';
import { _decorator, IAssembler, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



"use strict";




class TestAssember implements IAssembler {

    private m = new Mat4();

    private QUAD_INDICES;

    private tempRenderData = [];

    constructor() {
        for (var i = 0; i < 4; i++) {
            this.tempRenderData.push({
                x: 0,
                y: 0,
                z: 0,
                u: 0,
                v: 0,
                color: new Color()
            });
        }
        console.log(" ========= TestAssember ======= ")
    }

    createData(sprite) {
        const renderData = sprite.requestRenderData();
        // 0-4 for local vertex
        renderData.dataLength = 16;
        renderData.resize(16, 54);
        this.QUAD_INDICES = new Uint16Array(54);
        this.createQuadIndices(4, 4);
        renderData.chunk.setIndexBuffer(this.QUAD_INDICES);
        return renderData;
    }


    createQuadIndices(vertexRow, vertexCol) {
        let offset = 0;
        for (let curRow = 0; curRow < vertexRow - 1; curRow++) {
            for (let curCol = 0; curCol < vertexCol - 1; curCol++) {
                // vid is the index of the left bottom vertex in each rect.
                const vid = curRow * vertexCol + curCol;

                // left bottom
                this.QUAD_INDICES[offset++] = vid;
                // right bottom
                this.QUAD_INDICES[offset++] = vid + 1;
                // left top
                this.QUAD_INDICES[offset++] = vid + vertexCol;

                // right bottom
                this.QUAD_INDICES[offset++] = vid + 1;
                // right top
                this.QUAD_INDICES[offset++] = vid + 1 + vertexCol;
                // left top
                this.QUAD_INDICES[offset++] = vid + vertexCol;
            }
        }
    }



    updateRenderData(sprite) {
        const frame = sprite.spriteFrame;

        // TODO: Material API design and export from editor could affect the material activation process
        // need to update the logic here
        // if (frame) {
        //     if (!frame._original && dynamicAtlasManager) {
        //         dynamicAtlasManager.insertSpriteFrame(frame);
        //     }
        //     if (sprite._material._texture !== frame._texture) {
        //         sprite._activateMaterial();
        //     }
        // }
        dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
        // TODO update material and uv
        this.updateUVs(sprite); // dirty need
        //this.updateColor(sprite); // dirty need

        const renderData = sprite.renderData;
        if (renderData && frame) {
            const vertDirty = renderData.vertDirty;
            if (vertDirty) {
                this.updateVertexData(sprite);
            }
            renderData.updateRenderData(sprite, frame);
        }
    }

    updateVertexData(sprite) {
        const renderData = sprite.renderData;
        const dataList = renderData.data;
        const uiTrans = sprite.node._uiProps.uiTransformComp;
        const width = uiTrans.width;
        const height = uiTrans.height;
        const appX = uiTrans.anchorX * width;
        const appY = uiTrans.anchorY * height;
        const frame = sprite.spriteFrame;
        const leftWidth = frame.insetLeft;
        const rightWidth = frame.insetRight;
        const topHeight = frame.insetTop;
        const bottomHeight = frame.insetBottom;
        let sizableWidth = width - leftWidth - rightWidth;
        let sizableHeight = height - topHeight - bottomHeight;
        let xScale = width / (leftWidth + rightWidth);
        let yScale = height / (topHeight + bottomHeight);
        xScale = Number.isNaN(xScale) || xScale > 1 ? 1 : xScale;
        yScale = Number.isNaN(yScale) || yScale > 1 ? 1 : yScale;
        sizableWidth = sizableWidth < 0 ? 0 : sizableWidth;
        sizableHeight = sizableHeight < 0 ? 0 : sizableHeight;
        var tempRenderData = this.tempRenderData;
        tempRenderData[0].x = -appX;
        tempRenderData[0].y = -appY;
        tempRenderData[1].x = leftWidth * xScale - appX;
        tempRenderData[1].y = bottomHeight * yScale - appY;
        tempRenderData[2].x = tempRenderData[1].x + sizableWidth;
        tempRenderData[2].y = tempRenderData[1].y + sizableHeight;
        tempRenderData[3].x = width - appX;
        tempRenderData[3].y = height - appY;
        for (let curRow = 0; curRow < 4; curRow++) {
            for (let curCol = 0; curCol < 4; curCol++) {
                const curIndex = curRow * 4 + curCol;
                if (curIndex < renderData.dataLength && curRow < tempRenderData.length && curCol < tempRenderData.length) {
                    dataList[curIndex].x = tempRenderData[curCol].x;
                    dataList[curIndex].y = tempRenderData[curRow].y;
                }
            }
        }
    }


    fillBuffers(sprite, renderer) {
        const renderData = sprite.renderData;
        const chunk = renderData.chunk;
        if (sprite._flagChangedVersion !== sprite.node.flagChangedVersion || renderData.vertDirty) {
            this.updateWorldVertexData(sprite, chunk);
            renderData.vertDirty = false;
            sprite._flagChangedVersion = sprite.node.flagChangedVersion;
        }
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;
        for (let r = 0; r < 3; ++r) {
            for (let c = 0; c < 3; ++c) {
                const start = vid + r * 4 + c;
                ib[indexOffset++] = start;
                ib[indexOffset++] = start + 1;
                ib[indexOffset++] = start + 4;
                ib[indexOffset++] = start + 1;
                ib[indexOffset++] = start + 5;
                ib[indexOffset++] = start + 4;
            }
        }
        meshBuffer.indexOffset = indexOffset;
    }

    updateWorldVertexData(sprite, chunk) {
        const node = sprite.node;
        node.getWorldMatrix(m);
        const renderData = sprite.renderData;
        const stride = renderData.floatStride;
        const dataList = renderData.data;
        const vData = chunk.vb;
        let offset = 0;
        var m = this.m;
        for (let row = 0; row < 4; ++row) {
            const rowD = dataList[row * 4];
            for (let col = 0; col < 4; ++col) {
                const colD = dataList[col];
                const x = colD.x;
                const y = rowD.y;
                let rhw = m.m03 * x + m.m07 * y + m.m15;
                rhw = rhw ? 1 / rhw : 1;
                offset = (row * 4 + col) * stride;
                vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
                vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
                vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
            }
        }
    }

    updateUVs(sprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData;
        const vData = renderData.chunk.vb;
        const stride = renderData.floatStride;
        const uv = sprite.spriteFrame.uvSliced;
        let uvOffset = 3;
        for (let i = 0; i < 16; i++) {
            vData[uvOffset] = uv[i].u;
            vData[uvOffset + 1] = uv[i].v;
            uvOffset += stride;
        }
    }

    updateColor(sprite) {
        const renderData = sprite.renderData;
        const vData = renderData.chunk.vb;
        const stride = renderData.floatStride;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = sprite.node._uiProps.opacity;
        for (let i = 0; i < 16; i++) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
            colorOffset += stride;
        }
    }
}



@ccclass('MySprite')
export class MySprite extends Sprite {

    onLoad(): void {
        var sf = this.spriteFrame;
        console.log("insetTop1:", sf.insetTop);
        console.log("insetTop2:", sf.insetBottom);
        console.log("insetTop3:", sf.insetLeft);
        console.log("insetTop4:", sf.insetRight);

        if (this.type == Sprite.Type.FILLED) {
            // console.log(" =========================== 1111 ")
            // if (this.fillType === Sprite.FillType.HORIZONTAL) {
            //     console.log(" =========================== 1111 ")
            //     this._assembler = new TestAssember();
            // }
            // console.log(" =========================== 1111 ")
            // this._renderData.vertDirty = true;
            console.log(this._renderData.data);
        }
        else if (this.type == Sprite.Type.SLICED) {
            console.log(this._renderData.data);
            // this._assembler = new TestAssember();
        }
    }






}



