type Zone = "SkullDiceZone" | "ZonePark" | "TreasureIslandZone" | "Deck" | "BagOfDice" | "RolledDiceZone" | "Discard";

class Zones {
    private static get(zone: Zone) {
        return bga.getElement({ name: zone })
    }

    static get SkullDice() { return this.get("SkullDiceZone") }
    static get Park() { return this.get("ZonePark") }
    static get TreasureIsland() { return this.get("TreasureIslandZone") }
    static get Deck() { return this.get("Deck") }
    static get BagOfDice() { return this.get("BagOfDice") }
    static get RolledDice() { return this.get("RolledDiceZone") }
    static get Discard() { return this.get("Discard") }

    static getChildrenFrom<T extends keyof ElementProperties>(zoneId: number, property?: T | string): ElementProperties[T][] {
        return bga.getElementsArray({ parent: zoneId }, property ?? "id");
    }
}
