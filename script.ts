// Piraten Kapern script
function onDieClicked(die_id: number) {
    // Cancel event propagation
    bga.stopEvent();

    checkAction("SelectDie");

    if (bga.getElement({ id: die_id }, 'value') === DieFaces.Skull.value) // if selected die is a skull
    { // TODO add exception for 1 die with Guardian card
        bga.cancel(_("Skull die can't be rolled again"));
    }
    else if (isSelected(die_id)) {
        deselect(die_id);
    }
    else if (getSelected().length === 7) {
        bga.cancel(_("You can't roll all dice"));
    }
    else {
        select(die_id);
    }
}

function onRollClicked() {
    checkAction("RollDice");

    if (bga.getElementsArray({ parent: bga.getElement({ name: 'RolledDiceZone' }) }).length === 0) {
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
    bga.roll(bga.getElementsArray({ tag: 'DICE' }));
    // Show dice
    bga.moveTo(bga.getElementsArray({ tag: 'DICE' }), bga.getElement({ name: 'RolledDiceZone' }));
    logDiceResult();

    let skullDiceCount = getSkullsCount();
    // If there is 3 skulls
    if (skullDiceCount === 3) {
        endPlayerTurnBecauseSkulls();
    }
    // If there is 4+ skulls
    else if (skullDiceCount >= 4) {
        // the player goes to the island of skull
        transitionToSkullIsland();
    }
    else {
        transitionToNextRoll();
    }
}

function normalRoll() {
    let selectedDice = getSelected();

    if (selectedDice.length < 2) {
        bga.cancel(_("You must select at least two dice to roll"));
    }
    else if (selectedDice.length === 8) {
        bga.cancel(_("You can't roll all dice"));
    }
    else {
        bga.roll(selectedDice);

        deselectAll();
        logDiceResult();

        let skullDiceCount = getSkullsCount();
        // If there is 3+ skulls
        bga.trace({ 'skulls count': skullDiceCount });
        if (skullDiceCount >= 3) {
            endPlayerTurnBecauseSkulls();
        }
    }
}

function skullIslandRoll() {
    // Reroll all dice which are not skull
    let selectedDice = bga.getElementsArray({ tag: 'DICE' }, ['id', 'value']).filter(die => die.value !== DieFaces.Skull.value).map(die => die.id);
    bga.roll(selectedDice);

    logDiceResult();

    // As long as each roll got at least 1 skull, the player keep rolling
    let skullDiceCount = selectedDice.map(dieId => bga.getElement({ id: dieId }, 'value')).filter((dieValue: string) => dieValue === DieFaces.Skull.value).length;
    bga.trace({ 'skulls count': skullDiceCount });

    if (skullDiceCount === 0) {
        // Else end player turn and remove 100 * skull for each player except current
        let scoreToSubstract = getSkullsCount() * 100;

        let currentPlayerColor = bga.getCurrentPlayerColor();

        var players = bga.getPlayers();
        for (var color in players) {
            let player = players[color];
            if (color !== currentPlayerColor) {
                let newScore = bga.getScore(color) - scoreToSubstract;
                bga.setScore(color, newScore);
                bga.log(_(`${player.name} loose <b>${scoreToSubstract}</b> points`));
            }
        }

        //FIXME use a transitionFromSkullIsland function?
        setProperties(bga.getElement({ name: 'or' }), { inlineStyle: 'display: block;' });
        setProperties(bga.getElement({ name: 'Stop' }), { inlineStyle: 'display: block;' });
        endPlayerTurn();
    }
}

function onStopClicked() {
    checkAction("StopTurn");

    // Calculate points
    let playerScore = calculateScore();

    let playerColor = bga.getCurrentPlayerColor();
    // Display score
    bga.displayScoring(bga.getElement({ name: 'RolledDiceZone' }), playerColor, playerScore);
    // Increase score
    bga.incScore(playerColor, playerScore);
    bga.log(_("${player_name} stopped and win <b>" + playerScore + "</b> points"));

    endPlayerTurn();
}

function calculateScore(): number {
    // There are 3 ways to score points:

    // 1. Sets of identical objects:
    let coinsCount = getDiceCount(DieFaces.Coin);
    let diamondsCount = getDiceCount(DieFaces.Diamond);
    let parrotsCount = getDiceCount(DieFaces.Parrot);
    let monkeysCount = getDiceCount(DieFaces.Monkey);
    let sabersCount = getDiceCount(DieFaces.Sabers);

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
    if (getSkullDiceCount() === 0
        && (parrotsCount === 0 || parrotsCount > 2)
        && (monkeysCount === 0 || monkeysCount > 2)
        && (sabersCount === 0 || sabersCount > 2)
    ) {
        totalScore += 500;
        bga.trace('Full chest!');
    }

    // FIXME apply fortune card effect if necessary
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
