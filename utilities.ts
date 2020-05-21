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

    // Hide dice
    bga.moveTo(Die.getAll(), Zones.BagOfDice);

    // Remove first card on deck and move to hidden zone
    bga.moveTo(Card.getCurrent("id"), Zones.Discard);

    // If the deck is empty
    if (bga.getElementsArray({ parent: Zones.Deck }).length === 0) {
        bga.pause(1000);
        // Shuffle the discard pile
        bga.shuffle(Zones.Discard);
        bga.pause(1000);
        // And move the cards back to the deck
        bga.moveTo(Card.getAll(), Zones.Deck);
    }


    // Update progression
    updateGameProgression();

    transitionToNextPlayer();
}

/**
 * Count skulls on dice and current card
 */
function getSkullsCount() {
    let skullsCount = Die.countSkulls();
    if (Card.isCurrent(PirateCard.Skulls)) {
        skullsCount += Number(Card.getCurrent('c_skulls'));
        bga.trace(`Total skulls: ${skullsCount}`);
    }
    return skullsCount;
}

function moveSkullDiceToSkullZone() {
    bga.moveTo(Die.getAllFace(DieFaces.Skull), Zones.SkullDice);
}

function logDiceResult() {
    bga.log(_("${player_name} rolled ${dice}"), {
        dice: bga.getElementsArray({ tag: 'DICE' }, 'value')
            .map(value => Object.values(DieFaces).find((dieFace: DieFace) => dieFace.value === value)?.name).join(", ")
    });
}

}
