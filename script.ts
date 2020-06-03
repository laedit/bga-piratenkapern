// Piraten Kapern script
function onDieClicked(die_id: number) {
    // Cancel event propagation
    bga.stopEvent();

    checkAction("SelectDie");

    if (isSelected(die_id)) {
        deselect(die_id);
    }
    // cas phase GuardianUsage
    else if (Die.countSkulls() >= 3) {
        if (Die.is(die_id, DieFaces.Skull)) {
            if (getSelected().length > 0) {
                bga.cancel(_("You can only roll one skull die"));
            }
            else {
                select(die_id);
            }
        }
        else {
            bga.cancel(_("You can only roll one skull die"));
        }
    }
    else if (Die.is(die_id, DieFaces.Skull)) // if selected die is a skull
    {
        if (Card.isGuardianActiveAndNotUsed()) {
            //s'il y a déjà un dé crâne sélectionné : erreur
            if (getSelected().some(selectedDieId => Die.is(selectedDieId, DieFaces.Skull))) {
                bga.cancel(_("You can only roll one skull die"));
            }
            else {
                // sinon sélectionné
                select(die_id);
            }
        } else {
            bga.cancel(_("Skull die can't be rolled again"));
        }
    }
    else {
        select(die_id);
        // If current card is treasure
        if (Card.isCurrent(PirateCard.Treasure)) {
            highlightTreasureZone();
        }
    }
}

function onRollClicked() {
    checkAction("RollDice");

    // rerolling of skull die
    if (Card.isGuardianActiveAndNotUsed() && getSelected().some(selectedDieId => Die.is(selectedDieId, DieFaces.Skull))) {
        // Mark guardian as used for this turn
        setProperties(Card.getCurrent("id"), { "c_used": "true" });

        let wasGoingToSkullIsland = getSkullsCount() === 4;

        let selectedDice = getSelected();
        bga.moveTo(selectedDice, Zones.RolledDice);
        bga.roll(selectedDice);
        deselectAll();
        logDiceResult();
        moveSkullDiceToSkullZone();

        let skullDiceCount = getSkullsCount();
        // If there is 3+ skulls

        if (skullDiceCount === 4 && wasGoingToSkullIsland) {
            transitionToSkullIsland();
        }
        else if (skullDiceCount >= 3) {
            endPlayerTurnBecauseSkulls();
        }
    }
    else if (Zones.getChildrenFrom(Zones.RolledDice).length === 0) {
        firstRoll();
    }
    else if (getSkullsCount() >= 4) {
        skullIslandRoll();
    }
    else {
        normalRoll();
    }
}

function firstRoll() {
    bga.roll(Die.getAll());
    // Show dice
    bga.moveTo(Die.getAll(), Zones.RolledDice);
    logDiceResult();
    moveSkullDiceToSkullZone();

    let skullsCount = getSkullsCount();
    // If there is 3 skulls
    if (skullsCount === 3) {
        if (Card.isGuardianActiveAndNotUsed()) {
            transitionToGuardianUsage();
        }
        else {
            endPlayerTurnBecauseSkulls();
        }
    }
    // If there is 4+ skulls
    else if (skullsCount >= 4) {
        // the player goes to the island of skull
        if (skullsCount === 4 && Card.isGuardianActiveAndNotUsed()) {
            transitionToGuardianUsage();
        }
        else if (Card.isCurrent(PirateCard.PirateBoat)) {
            endPlayerTurnBecauseSkulls();
        }
        else {
            transitionToSkullIsland();
        }
    }
    else {
        transitionToNextRoll();
    }
}

function normalRoll() {
    let selectedDice = getSelected();

    if (selectedDice.length === 0) {
        selectedDice = Die.getAll(Zones.RolledDice);
    }
    
    if (selectedDice.length < 2) {
        bga.cancel(_("You must select at least two dice to roll"));
    }
    else {
        removeHighlightTreasureZone();

        bga.moveTo(selectedDice, Zones.RolledDice);

        bga.roll(selectedDice);

        deselectAll();
        logDiceResult();
        moveSkullDiceToSkullZone();

        let skullsCount = getSkullsCount();
        // If there is 3+ skulls
        if (skullsCount >= 3) {
            if (skullsCount === 3 && Card.isGuardianActiveAndNotUsed()) {
                transitionToGuardianUsage();
            }
            else {
                endPlayerTurnBecauseSkulls();
            }
        }
    }
}

function skullIslandRoll() {
    // Reroll all dice which are not skull
    let selectedDice = Die.getAllFaceNot(DieFaces.Skull);
    bga.roll(selectedDice);

    logDiceResult();
    moveSkullDiceToSkullZone();

    let skullDiceCount = selectedDice.map(dieId => bga.getElement({ id: dieId }, 'value')).filter(dieValue => dieValue === DieFaces.Skull.value).length;
    bga.trace('New skulls count :' + skullDiceCount);

    // As long as each roll got at least 1 skull
    // and there is at least two dice to roll, the player keep rolling
    if (skullDiceCount === 0 || Die.countSkulls() >= 7) {
        bga.log(_("${player_name} haven't roll new skull(s) and return from the <b>Island of Skull</b>"));
        // Else end player turn and remove 100 * skull for each player except current
        let scoreToSubstract = getSkullsCount() * 100;
        if (Card.isCurrent(PirateCard.Pirate)) {
            scoreToSubstract = scoreToSubstract * 2;
        }

        let currentPlayerColor = bga.getCurrentPlayerColor();

        var players = bga.getPlayers();
        for (var color in players) {
            let player = players[color];
            if (color !== currentPlayerColor) {
                let newScore = bga.getScore(color) - scoreToSubstract;
                bga.setScore(color, newScore);
                bga.log(_("${playerName} loose <b>${score}</b> points"), { playerName: player.name, score: scoreToSubstract });
            }
        }
        bga.pause(1000);
        endPlayerTurn();
    }
}

function onStopClicked() {
    checkAction("StopTurn");

    // Card: Guardian
    let skullsCount = getSkullsCount();
    if (Card.isGuardianActiveAndNotUsed() && skullsCount >= 3) {
        // The player choose to not use the Guardian
        if (skullsCount === 3) {
            endPlayerTurnBecauseSkulls();
        }
        else {
            transitionToSkullIsland();
        }
    }
    // Card: Pirate Boat
    else if (Card.isCurrent(PirateCard.PirateBoat)) {
        let [sabers, points] = Card.getPirateBoatSabersAndPoints();
        let sabersDiceCount = Die.getAllFace(DieFaces.Sabers).length;

        if (sabersDiceCount >= sabers) {
            bga.log(_("${player_name} successfully gets the ${sabers} <b>sabers</b> and win ${score} points"), { sabers: sabers, score: points });

            // Calculate points
            let playerScore = calculateScore() + points;

            DisplayAndIncScore(playerScore);
            bga.log(_("${player_name} stopped and win <b>${score}</b> points"), { score: playerScore });
        }
        else {
            DisplayAndIncScore(-points);
            bga.log(_("${player_name} failed to get the ${sabers} <b>sabers</b> and loose ${score} points"), { sabers: sabers, score: points });
        }

        endPlayerTurn();
    }
    else {
        // Card: Treasure Island
        removeHighlightTreasureZone();

        // Calculate points
        let playerScore = calculateScore();

        DisplayAndIncScore(playerScore);
        bga.log(_("${player_name} stopped and win <b>${score}</b> points"), { score: playerScore });

        endPlayerTurn();
    }
}

function calculateScore(zoneId?: number): number {
    // There are 3 ways to score points:

    // 1. Sets of identical objects:
    let coinsCount = Die.countFace(DieFaces.Coin, zoneId) + (Card.isCurrent(PirateCard.Coin) ? 1 : 0);
    let diamondsCount = Die.countFace(DieFaces.Diamond, zoneId) + (Card.isCurrent(PirateCard.Diamond) ? 1 : 0);

    let parrotsCount = Die.countFace(DieFaces.Parrot, zoneId);
    let monkeysCount = Die.countFace(DieFaces.Monkey, zoneId);
    if (Card.isCurrent(PirateCard.Animals)) {
        bga.trace("Animals card activated");
        monkeysCount += parrotsCount;
        parrotsCount = 0;
    }

    let sabersCount = Die.countFace(DieFaces.Sabers, zoneId);

    let setsScore = getSetScore(parrotsCount);
    setsScore += getSetScore(monkeysCount);
    setsScore += getSetScore(sabersCount);
    setsScore += getSetScore(coinsCount);
    setsScore += getSetScore(diamondsCount);

    bga.trace(`Sets score: ${setsScore}`);

    // 2.Diamonds and Gold: Each diamond and each gold - coin is worth 100 points even if it is not part of a set.
    // Therefore sets of diamonds and gold coins score twice: For their face value as well as for the sets they make.
    let coinsScore = coinsCount * 100;
    bga.trace(`Coins score: ${coinsScore}`);
    let diamondsScore = diamondsCount * 100;
    bga.trace(`Diamonds score: ${diamondsScore}`);

    let totalScore = setsScore + coinsScore + diamondsScore;

    // 3.Full Chest: A player who generates points with all eight dice receives a bonus of 500 points in addition to the score he made.
    // => if there is series of 2 or 1 dice which are not diamond or gold => not full chest
    // with exceptions from animals and pirate boat cards
    if (Die.countSkulls() === 0
        && (parrotsCount === 0 || parrotsCount > 2)
        && (monkeysCount === 0 || monkeysCount > 2)
        && (sabersCount === 0 || sabersCount > 2
            || (Card.isCurrent(PirateCard.PirateBoat) && sabersCount === Card.getPirateBoatSabersAndPoints()[0]))
    ) {
        totalScore += 500;
        bga.trace('Full chest!');
    }

    if (Card.isCurrent(PirateCard.Pirate)) {
        totalScore = totalScore * 2;
    }
    return totalScore;
}

/**
 * Each sets of at least 3 identical objects rewards points as per the following table:
 *   3 of a kind - 100 points
 *   4 of a kind - 200 points
 *   5 of a kind - 500 points
 *   6 of a kind - 1000 points
 *   7 of a kind - 2000 points
 *   8 of a kind - 4000 points
 * @param setCount count of dice in a specific set
 */
function getSetScore(setCount: number): number {
    switch (setCount) {
        case 0: return 0;
        case 1: return 0;
        case 2: return 0;
        case 3: return 100;
        case 4: return 200;
        case 5: return 500;
        case 6: return 1000;
        case 7: return 2000;
        case 8: return 4000;

        default: bga.error(`This set value isn't handled '${setCount}'`);
    }
}

function onTreasureClicked(treasureZoneId: number) {
    bga.stopEvent();
    if (bga.isOn(treasureZoneId, Zones.Deck)) {
        let selectedDice = getSelected();
        // if dice selected
        if (selectedDice.length > 0) {
            // allow to move dice on treasure
            bga.moveTo(selectedDice, treasureZoneId);
            deselectAll();
            removeHighlightTreasureZone();
        }
    }
}
