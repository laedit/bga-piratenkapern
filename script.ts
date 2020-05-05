// Piraten Kapern script
function states() {
    return {

        // Init game
        100: {
            onState: 'postSetup',
            transitions: { done: 200 }
        },

        // Player's first roll on turn
        200: {
            description: _('${actplayer} must roll all dice'),
            descriptionmyturn: _('${you} must roll all dice'),
            possibleactions: ['firstRoll'],
            transitions: { skullIsland: 201, nextRoll: 202, nextPlayer: 200 }
        },

        // skull island
        201: {
            description: _('${actplayer} is on the Island of Skull and must roll dice'),
            descriptionmyturn: _('${you} are on the Island of Skull and must roll dice'),
            possibleactions: ['rollSkullIslandDice'],
            transitions: { nextPlayer: 200 }
        },

        // Normal roll
        202: {
            description: _('${actplayer} must roll dice or stop'),
            descriptionmyturn: _('${you} must roll dice or stop'),
            possibleactions: ['rollDice'],
            transitions: { nextPlayer: 200 }
        },

        // last round?
        // Or Check if current player have 6000+ points => set custom properties HaveStartedLastRound
        // Check if current player have HaveStartedLastRound = true if yes check if anyone have 6000+ points
        // The player with the higher score win

    };
}

function postSetup() {
    // FIXME useless?

    showLabelsToNextPlayer();

    bga.nextState('done');
}

function onDieClicked(die_id: number) {
    // Cancel event propagation
    bga.stopEvent();

    if (bga.isActionPossible('rollDice')) {
        if (bga.getElement({ id: die_id }, 'value') === DieValues.Skull) // if selected die is a skull
        { // TODO add exception for 1 die with Guardian card
            bga.cancel(_("Skull die can't be rolled again"));
        }
        else if (bga.hasTag(die_id, 'sbstyle_selected')) {
            bga.removeStyle(die_id, 'selected');
        }
        else if (bga.getElementsArray({ tag: 'sbstyle_selected' }).length === 7) {
            bga.cancel(_("You can't roll all dice"));
        }
        else {
            bga.addStyle(die_id, 'SELECTED');
        }
    }
    else if (bga.isActionPossible('rollSkullIslandDice')) {
        bga.cancel('You must roll all dice which are not a Skull');
    }
}

function onRollClicked() {
    if (bga.isActionPossible('firstRoll')) {
        firstRoll();
    }
    else if (bga.isActionPossible('rollDice')) {
        normalRoll();
    }
    else if (bga.isActionPossible('rollSkullIslandDice')) {
        skullIslandRoll();
    }
}

function firstRoll() {
    bga.roll(bga.getElementsArray({ tag: 'DICE' }));
    // Show dice
    bga.moveTo(bga.getElementsArray({ tag: 'DICE' }), bga.getElement({ name: 'RolledDicesZone' }));
    logDiceResult();

    let skullDiceCount = getSkullsCount();
    // If there is 3 skulls
    if (skullDiceCount === 3) {
        endPlayerTurnBecauseSkulls();
    }
    // If there is 4+ skulls
    else if (skullDiceCount >= 4) {
        // the player goes to the island of skull
        bga.log(_("${player_name} goes to the <b>Island of Skull</b>"));
        bga.nextState('skullIsland');
    }
    else {
        bga.nextState('nextRoll');
    }
}

function normalRoll() {
    let selectedDice = bga.getElementsArray({ tag: 'sbstyle_selected' });

    if (selectedDice.length < 2) {
        bga.cancel(_("You must select at least two dice to roll"));
    }
    else if (selectedDice.length === 8) {
        bga.cancel(_("You can't roll all dice"));
    }
    else {
        bga.roll(selectedDice);

        bga.removeStyle(bga.getElements({ tag: 'sbstyle_selected' }), 'selected');
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
    let selectedDice = bga.getElementsArray({ tag: 'DICE' }, ['id', 'value']).filter(die => die.value !== DieValues.Skull).map(die => die.id);
    bga.roll(selectedDice);

    logDiceResult();

    // As long as each roll got at least 1 skull, the player keep rolling
    let skullDiceCount = selectedDice.map(dieId => bga.getElement({ id: dieId }, 'value')).filter((dieValue: string) => dieValue === DieValues.Skull).length;
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

                // if score < 0 => score = 0
                if (newScore < 0) {
                    newScore = 0;
                }
                bga.setScore(color, newScore);
                bga.log(_(`${player.name} stopped and loose <b>${scoreToSubstract}</b> points`));
            }
        }

        endPlayerTurn();
    }
}

function onStopClicked() {
    if (bga.isActionPossible('firstRoll')) {
        bga.cancel(_("You cannot stop until you have rolled the dice at least once"));
    }
    else if (bga.isActionPossible('rollDice')) {
        // Calculate points
        let playerScore = calculateScore();

        let playerColor = bga.getCurrentPlayerColor();
        // Display score
        bga.displayScoring(bga.getElement({ name: 'RolledDicesZone' }), playerColor, playerScore);
        // Increase score
        bga.incScore(playerColor, playerScore);
        bga.log(_("${player_name} stopped and win <b>" + playerScore + "</b> points"));

        endPlayerTurn();
    }
    else if (bga.isActionPossible('rollSkullIslandDice')) {
        bga.cancel(_("You cannot stop when you are on the Island of Skull..."));
    }
    else {
        bga.error('No actions possible...');
    }
}

function calculateScore(): number {
    // There are 3 ways to score points:

    // 1. Sets of identical objects:
    let coinsCount = getDiceCount(DieValues.Coin);
    let diamondsCount = getDiceCount(DieValues.Diamond);
    let parrotsCount = getDiceCount(DieValues.Parrot);
    let monkeysCount = getDiceCount(DieValues.Monkey);
    let sabersCount = getDiceCount(DieValues.Sabers);

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

/*** Utility functions ***/
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
    var props: ElementsProperties = [];
    bga.getElementsArray({ tag: 'LABEL' }).forEach(labelId => props[labelId] = { visible: 'player' + bga.getActivePlayerColor() });
    //bga.setProperties(props);
    // FIXME not refreshed dynamically
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
