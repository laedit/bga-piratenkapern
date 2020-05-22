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
    let playerScore = 0;
    if (bga.isOn(Zones.TreasureIsland, Zones.Deck)) {
        // Calculate points
        playerScore = calculateScore(Zones.TreasureIsland);
    }

    if (playerScore > 0) {
        // Display score
        let playerColor = bga.getCurrentPlayerColor();
        bga.displayScoring(Zones.RolledDice, playerColor, playerScore);
        // Increase score
        bga.incScore(playerColor, playerScore);
        bga.log(_("${player_name} got 3 <b>skulls</b> but manage to win ${score} points thanks to the treasure island"), { score: playerScore });
    }
    else {
        bga.log(_("${player_name} got 3 <b>skulls</b> and doesn't win any points"));
    }
    endPlayerTurn();
}

function endPlayerTurn() {
    // remove dice selection
    deselectAll();

    // Hide dice
    bga.moveTo(Die.getAll(), Zones.BagOfDice);

    // Move back the treasure zone
    bga.moveTo(Zones.TreasureIsland, Zones.Park);

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

    // If first card is treasure island => move TreasureIslandZone on top of the card
    if (Card.isCurrent(PirateCard.Treasure)) {
        bga.moveTo(Zones.TreasureIsland, Zones.Deck);
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

function highlightTreasureZone() {
    // FIXME doesn't work
    bga.addStyle(Zones.TreasureIsland, PredefinedStyles.Light);
    setProperties(Zones.TreasureIsland, { inlineStyle: "cursor: pointer;" });
}

function removeHighlightTreasureZone() {
    bga.removeStyle(Zones.TreasureIsland, PredefinedStyles.Light);
    setProperties(Zones.TreasureIsland, { inlineStyle: "cursor: default;" });
}
