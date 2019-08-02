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
import Accessor from "esri/core/Accessor";
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import PortalItem from "esri/portal/PortalItem";

import { SymbolGroupId } from "../SymbolGallery";
import SymbolItem from "./SymbolItem";

export const SymbolItemCollection = Collection.ofType<SymbolItem>(SymbolItem);

const VEHICLE_NAMES = [
  "Cell_Phone_Antenna",
  "Powerline_Pole",
  "Wind_Turbine",
  "Dumpster",
  "Fire_Hydrant",
  "Jersey_Barrier",
  "Traffic_Barrier_1",
  "Traffic_Barrier_2",
  "Traffic_Cone",
  "Ambulance",
  "Backhoe",
  "Bobcat",
  "Cargo_Box",
  "Crane",
  "Delivery_Truck",
  "Dumptruck",
  "Ford_Transit_Commercial_Van",
  "Semi_Trailer_Truck",
  "Tower_Crane",
  "Trailer",
  "Tractor",
];

@subclass("draw.symbolgallery.SymbolGroup")
export default class SymbolGroup extends declared(Accessor) {

  @property({
    readOnly: true,
    type: SymbolItemCollection,
  })
  public readonly items = new SymbolItemCollection();

  constructor(public category: SymbolGroupId, portalItems: IPromise<PortalItem[]>) {
    super();

    portalItems.then((items) => this.addSymbolItems(items));
  }

  private addSymbolItems(items: PortalItem[]) {
    items.forEach((item) => {
      const styleName = this.getStyleName(item);

      if (this.styleNameMatchesGroup(styleName)) {
        item.fetchData().then((data) => {
          this.items.addMany(
            data.items
              .filter((symbolItem: any) => this.includeSymbol(symbolItem))
              .map((symbolItem: any) => new SymbolItem(symbolItem, styleName)),
          );
        });
      }
    });
  }

  private includeSymbol(symbolItem: any) {
    if (this.category === SymbolGroupId.Vehicles) {
      return VEHICLE_NAMES.some((name) => symbolItem.name === name);
    }

    return true;
  }

  private getStyleName(item: PortalItem): string {
    for (const typeKeyword of item.typeKeywords) {
      if (/^Esri.*Style$/.test(typeKeyword) && typeKeyword !== "Esri Style") {
        return typeKeyword;
      }
    }
    return "";
  }

  private styleNameMatchesGroup(styleName: string): boolean {
    switch (this.category) {
      case SymbolGroupId.Icons:
        return styleName === "EsriIconsStyle";
      case SymbolGroupId.Trees:
        return styleName === "EsriRealisticTreesStyle";
      case SymbolGroupId.Vehicles:
        return styleName === "EsriRealisticTransportationStyle" || styleName === "EsriInfrastructureStyle"
          || styleName === "EsriRealisticStreetSceneStyle";
    }
    return false;
  }

}
