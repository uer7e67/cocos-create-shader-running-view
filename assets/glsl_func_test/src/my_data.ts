

import { Material } from 'cc';
import { CCString } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("my_data")
export class my_data {

    @property({ type: CCString, serializable: true })
    m_name: String = "";

    @property({ type: Material, serializable: true })
    m_material: Material = null;

}
