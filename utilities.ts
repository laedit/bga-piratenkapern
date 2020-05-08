const WinningScore = 6000;

function updateGameProgression() {
    // Get player score max
    let maxScore = Math.max(...Object.keys(bga.getPlayers()).map(color => bga.getScore(color)));

    // If score < winning score
    if (maxScore < WinningScore) {
        bga.setGameProgression(Math.round(maxScore / WinningScore * 100));
    }
    // Else we are (probably?) on the last turn
    else {
        bga.setGameProgression(99);
    }
}

function showLabelsToNextPlayer() {
    // FIXME not refreshed dynamically
    //bga.getElementsArray({ tag: 'LABEL' }).forEach(labelId => setProperties(labelId, { visible: 'player' + bga.getActivePlayerColor() }));
}

function endPlayerTurnBecauseSkulls() {
    bga.pause(2000); // pause during 2 seconds
    bga.log(_("${player_name} got 3 <b>skulls</b> and doesn't win any points"));
    endPlayerTurn();
}

function endPlayerTurn() {
    // remove dice selection
    bga.removeStyle(bga.getElements({ tag: 'sbstyle_selected' }), 'selected');

    // Remove first card on deck and move to hidden zone
    bga.moveTo(getFirstCardOnDeck(), bga.getElement({ name: 'Discard' }));

    // If the deck is empty
    if (bga.getElementsArray({ parent: bga.getElement({ name: 'Deck' }) }).length === 0) {
        bga.pause(1000);
        // Shuffle the discard pile
        bga.shuffle(bga.getElement({ name: 'Discard' }));
        bga.pause(1000);
        // And move the cards back to the deck
        bga.moveTo(bga.getElementsArray({ tag: 'CARD' }), bga.getElement({ name: 'Deck' }));
    }

    // Hide dice
    bga.moveTo(bga.getElementsArray({ tag: 'DICE' }), bga.getElement({ name: 'BagOfDice' }));

    // Update progression
    updateGameProgression();

    bga.nextPlayer();

    // Show Roll or Stop labels to next player
    showLabelsToNextPlayer();

    bga.nextState('nextPlayer');
}

function getSkullDiceCount() {
    return getDiceCount(DieValues.Skull);
}

function getSkullsCount() {
    let skullsCount = getSkullDiceCount();
    if (bga.hasTag(getFirstCardOnDeck(), 'SKULLS')) {
        skullsCount += Number(getFirstCardOnDeck('c_skulls'));
        bga.trace(`Total skulls: ${skullsCount}`);
    }
    return skullsCount;
}

function getDiceCount(dieValueSearched: string) {
    return bga.getElementsArray({ tag: 'DICE' }, 'value').filter(dieValue => dieValue === dieValueSearched).length;
}

function getFirstCardOnDeck(property?: string) {
    if (property === undefined) {
        property = 'id';
    }
    return bga.getElementsArray({ parent: bga.getElement({ name: 'Deck' }) }, property).reverse()[0];
}

function setProperties(elementId: number, properties: ElementProperties) {
    var props: ElementsProperties = [];
    props[elementId] = properties;
    bga.setProperties(props);
}

function logDiceResult() {
    bga.log(_("${player_name} rolled ${dice}"), { dice: bga.getElementsArray({ tag: 'DICE' }, 'value').map(dieValueToText).join(", ") });
}

function dieValueToText(dieValue: string): string {
    switch (dieValue) {
        case DieValues.Parrot: return _("Parrot");
        case DieValues.Coin: return _("Coin");
        case DieValues.Diamond: return _("Diamond");
        case DieValues.Skull: return _("Skull");
        case DieValues.Monkey: return _("Monkey");
        case DieValues.Sabers: return _("Sabers");
        default: bga.error(`Die value unknown: '${dieValue}'`);
    }
}

const DieValues = {
    Parrot: "1",
    Coin: "2",
    Diamond: "3",
    Skull: "4",
    Monkey: "5",
    Sabers: "6"
}