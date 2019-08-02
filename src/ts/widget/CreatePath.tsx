/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import { LineSymbol3D } from "esri/symbols";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import EsriSymbol from "esri/symbols/Symbol";
import { renderable, tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";

interface PathMenu {
  label: string;
  color: string;
  width: number;
  height: number;
}

@subclass("app.draw.CreatePath")
export default class CreatePath extends declared(DrawWidget) {

  @renderable()
  @property()
  private activeMenu: PathMenu | null = null;

  private menus: PathMenu[] = [
    {
      label: "Street",
      color: "#cbcbcb",
      width: 20,
      height: 0,
    },
    {
      label: "Walking Path",
      color: "#b2b2b2",
      width: 3,
      height: 0,
    },
    {
      label: "Wall",
      color: "#b2b2b2",
      width: 0.2,
      height: 3,
    },
  ];

  public render() {
    const inactive = "btn btn-large";
    const active = inactive + " active";
    return (
      <div>
        <div class="menu">
          { this.menus.map((menu) => (
            <div class="menu-item">
              <button
                class={menu === this.activeMenu ? active : inactive}
                onclick={ this.startDrawing.bind(this, menu) }>Create {menu.label}</button>
            </div>
          )) }
        </div>
      </div>
    );
  }

  public updateGraphic(graphic: Graphic): IPromise<Graphic[]> {
    const color = graphic.symbol.color;
    return this.updatePolylineGraphic(graphic, color ? color.toHex() : "#b2b2b2");
  }

  private startDrawing(menu: PathMenu) {
    let symbol: EsriSymbol;
    if (menu.height) {
      symbol = new LineSymbol3D({
        symbolLayers: [{
          type: "path",
          profile: "quad",
          material: {
            color: menu.color,
          },
          width: menu.width,
          height: menu.height,
          anchor: "bottom",
        }],
      });
    } else {
      symbol = new SimpleLineSymbol({
        color: menu.color,
        width: menu.width,
      });
    }

    this.createPolylineGraphic(symbol, menu.color).always(() => {
      this.activeMenu = null;
    });
    this.activeMenu = menu;
  }

}
