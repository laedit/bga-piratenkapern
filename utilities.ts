function getWinningScore() {
    switch (bga.getVariant(1)) {
        case 1: return 6000;
        case 2: return 3000;
        case 3: return 8000;
    }
    bga.error(`Variant option not defined`);
}

function updateGameProgression() {
    // Get player score max
    let maxScore = Math.max(...Object.keys(bga.getPlayers()).map(color => bga.getScore(color)));

    let winningScore = getWinningScore();
    // If score < winning score
    if (maxScore < winningScore) {
        bga.setGameProgression(Math.round(maxScore / winningScore * 100));
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

/**
 * Display and increase the score of the current player
 * @param score score to display and add to the score of the current player
 */
function DisplayAndIncScore(score: number) {
    // Display score
    let playerColor = bga.getCurrentPlayerColor();
    bga.displayScoring(Zones.RolledDice, playerColor, score);
    // Increase score
    bga.incScore(playerColor, score);
}

function endPlayerTurnBecauseSkulls() {
    bga.pause(2000); // pause during 2 seconds

    if (Card.isCurrent(PirateCard.PirateBoat)) {
        let [sabers, points] = Card.getPirateBoatSabersAndPoints();
        DisplayAndIncScore(-points);
        bga.log(_("${player_name} failed to get the ${sabers} <b>sabers</b> and loose ${score} points"), { sabers: sabers, score: points });
    }
    else {
        let playerScore = 0;
        if (bga.isOn(Zones.TreasureIsland, Zones.Deck)) {
            // Calculate points
            playerScore = calculateScore(Zones.TreasureIsland);
        }

        if (playerScore > 0) {
            DisplayAndIncScore(playerScore);
            bga.log(_("${player_name} got 3 <b>skulls</b> but manage to win ${score} points thanks to the treasure island"), { score: playerScore });
        }
        else {
            bga.log(_("${player_name} got 3 <b>skulls</b> and doesn't win any points"));
        }
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
    if (Zones.getChildrenFrom(Zones.Deck).length === 0) {
        bga.pause(1000);
        // Shuffle the discard pile
        bga.shuffle(Zones.Discard);
        bga.pause(1000);
        // And move the cards back to the deck
        bga.moveTo(Card.getAll(), Zones.Deck);
        bga.pause(1000);
    }

    // If first card is treasure island => move TreasureIslandZone on top of the card
    if (Card.isCurrent(PirateCard.Treasure)) {
        bga.pause(1000);
        bga.moveTo(Zones.TreasureIsland, Zones.Deck);
    }
    if (Card.isCurrent(PirateCard.Guardian)) {
        // Reset guardian
        setProperties(Card.getCurrent("id"), { "c_used": "false" });
    }

    // Update progression
    updateGameProgression();

    transitionToCheckEndOfGame();
}

/**
 * Count skulls on dice and current card
 */
function getSkullsCount() {
    let skullsCount = Die.countSkulls() + Card.getSkullValue();
    bga.trace(`Skulls count: ${skullsCount}`);
    return skullsCount;
}

function moveSkullDiceToSkullZone() {
    bga.moveTo([...Die.getAllFace(DieFaces.Skull, Zones.RolledDice), ...Die.getAllFace(DieFaces.Skull, Zones.TreasureIsland)], Zones.SkullDice);
}

function highlightTreasureZone() {
    // FIXME doesn't work
    bga.addStyle(Zones.TreasureIsland, PredefinedStyles.Clickable);
    setProperties(Zones.TreasureIsland, { inlineStyle: "cursor: pointer;" });
}

function removeHighlightTreasureZone() {
    bga.removeStyle(Zones.TreasureIsland, PredefinedStyles.Clickable);
    setProperties(Zones.TreasureIsland, { inlineStyle: "cursor: default;" });
}

type GlobalVariables = "c_lastTurnPlayer" | "c_immediateWin";

function getGlobalVariable(variableName: GlobalVariables) {
    return bga.getElement({ name: "ZonePark" }, variableName);
}

function setGlobalVariable(variableName: GlobalVariables, newValue: string) {
    setProperties(Zones.Park, { [variableName]: newValue });
}

/**
 * Check if pirate magic is invoked (same symbol >= 9)
 */
function checkPirateMagic(): boolean {
    let pirateMagicInvoked = false;
    if (getSkullsCount() >= 9) {
        pirateMagicInvoked = true
    }
    else if (Card.isCurrent(PirateCard.Coin)){
        pirateMagicInvoked = Die.countFace(DieFaces.Coin) === 8;
    }
    else if (Card.isCurrent(PirateCard.Diamond)){
        pirateMagicInvoked = Die.countFace(DieFaces.Diamond) === 8;
    }

    if (pirateMagicInvoked) {
        bga.log(_("${player_name} invoked <b>pirate magic</b>."));
        bga.setScore(bga.getCurrentPlayerColor(), getWinningScore());
        bga.setGameProgression(100);
        bga.endGame();
    }

    return pirateMagicInvoked;
}