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

/**
 * Show Roll or Stop labels to next player
 */
function showLabelsToNextPlayer() {
    // FIXME not refreshed dynamically
    //bga.getElementsArray({ tag: 'LABEL' }).forEach(labelId => showOnlyToPlayer(labelId, bga.getActivePlayerColor()));
}

type Display = "none" | "block";

function changeOrStopDisplay(display: Display) {
    setProperties(bga.getElement({ name: 'or' }), { inlineStyle: `display: ${display};` });
    setProperties(bga.getElement({ name: 'Stop' }), { inlineStyle: `display: ${display};` });
}

function endPlayerTurnBecauseSkulls() {
    bga.pause(2000); // pause during 2 seconds
    bga.log(_("${player_name} got 3 <b>skulls</b> and doesn't win any points"));
    endPlayerTurn();
}

function endPlayerTurn() {
    // remove dice selection
    deselectAll();

    // Remove first card on deck and move to hidden zone
    bga.moveTo(getFirstCardOnDeck("id"), bga.getElement({ name: 'Discard' }));

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

    transitionToNextPlayer();
}

function getDice(dieFaceSearched: DieFace) {
    return bga.getElementsArray({ tag: 'DICE' }, ['id', 'value']).filter(die => die.value === dieFaceSearched.value).map(die => die.id)
}

function getDiceNot(dieFaceSearched: DieFace) {
    return bga.getElementsArray({ tag: 'DICE' }, ['id', 'value']).filter(die => die.value !== dieFaceSearched.value).map(die => die.id)
}

function getDiceCount(dieFaceSearched: DieFace) {
    return getDice(dieFaceSearched).length;
}

function getSkullDiceCount() {
    return getDiceCount(DieFaces.Skull);
}

function getSkullsCount() {
    let skullsCount = getSkullDiceCount();
    if (bga.hasTag(getFirstCardOnDeck("id"), 'SKULLS')) {
        skullsCount += Number(getFirstCardOnDeck('c_skulls'));
        bga.trace(`Total skulls: ${skullsCount}`);
    }
    return skullsCount;
}

function moveSkullDiceToSkullZone() {
    bga.moveTo(getDice(DieFaces.Skull), bga.getElement({ name: 'SkullDiceZone' }));
}

function getFirstCardOnDeck<T extends keyof ElementProperties>(property: T | string): ElementProperties[T] {
    return bga.getElementsArray({ parent: bga.getElement({ name: 'Deck' }) }, property).reverse()[0];
}

function logDiceResult() {
    bga.log(_("${player_name} rolled ${dice}"), {
        dice: bga.getElementsArray({ tag: 'DICE' }, 'value')
            .map(value => Object.values(DieFaces).find((dieFace: DieFace) => dieFace.value === value)?.name).join(", ")
    });
}

type DieName = "Parrot" | "Coin" | "Diamond" | "Skull" | "Monkey" | "Sabers";
type DieValue = "1" | "2" | "3" | "4" | "5" | "6";
type DieFace = { name: DieName, value: DieValue };

const DieFaces: { [P in DieName]: DieFace } = {
    Parrot: { name: "Parrot", value: "1" },
    Coin: { name: "Coin", value: "2" },
    Diamond: { name: "Diamond", value: "3" },
    Skull: { name: "Skull", value: "4" },
    Monkey: { name: "Monkey", value: "5" },
    Sabers: { name: "Sabers", value: "6" }
}
