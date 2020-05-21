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
        return bga.getElementsArray({ parent: Zones.Deck }, property).reverse()[0];
    },
    isCurrent(card: PirateCard) {
        return bga.hasTag(Card.getCurrent("id"), card);
    }
}