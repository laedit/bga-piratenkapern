function states(): States {
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
            possibleactions: ['firstRoll'], // RollDice => If rolledDice is empty
            transitions: { skullIsland: 201, nextRoll: 202, nextPlayer: 200 }
        },

        // skull island
        201: {
            description: _('${actplayer} is on the Island of Skull and must roll dice'),
            descriptionmyturn: _('${you} are on the Island of Skull and must roll dice'),
            possibleactions: ['rollSkullIslandDice'], // RollDice => if there is 4+ skulls
            transitions: { nextPlayer: 200 }
        },

        // Normal roll
        202: {
            description: _('${actplayer} must roll dice or stop'),
            descriptionmyturn: _('${you} must roll dice or stop'),
            possibleactions: ['rollDice'], // SelectDice, RollDice, StopTurn
            transitions: { nextPlayer: 200 }
        },

        // last round?
        // Or Check if current player have 6000+ points => set custom properties HaveStartedLastRound
        // Check if current player have HaveStartedLastRound = true if yes check if anyone have 6000+ points
        // The player with the higher score win

    };
}

function transitionToState() {

}

function postSetup() {
    showLabelsToNextPlayer();

    bga.nextState('done');
}
