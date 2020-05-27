enum PirateCard {
    Skulls = "SKULLS",
    Pirate = "PIRATE",
    Diamond = "DIAMOND",
    PirateBoat = "PIRATEBOAT",
    Treasure = "TREASURE",
    Animals = "ANIMALS",
    Coin = "Coin",
    Guardian = "GUARDIAN"
}

const CardTag = "CARD";

const Card = {
    getAll() {
        return bga.getElementsArray({ tag: CardTag });
    },
    getCurrent<T extends keyof ElementProperties>(property: T | string): ElementProperties[T] {
        return Zones.getChildrenFrom(Zones.Deck, property).reverse()[0];
    },
    isCurrent(card: PirateCard) {
        return bga.hasTag(Card.getCurrent("id"), card);
    },
    isGuardianActiveAndNotUsed() {
        return this.isCurrent(PirateCard.Guardian) && this.getCurrent("c_used") === "false";
    },
    getPirateBoatSabersAndPoints(): [number, number] {
        return [Number(this.getCurrent("c_sabers")), Number(this.getCurrent("c_points"))];
    }
}