type Transition = { name: string, id: number };

const Transitions = {
    NextPlayer: { name: "nextPlayer", id: 200 },
    SkullIsland: { name: "skullIsland", id: 201 },
    NextRoll: { name: "nextRoll", id: 202 }
};

type Actions = "RollDice" | "SelectDie" | "StopTurn";

function states(): States<Actions> {
    return {

        // Init game
        100: {
            onState: 'postSetup',
            transitions: getTransitions(Transitions.NextPlayer)
        },

        // Player's first roll on turn
        200: {
            description: _('${actplayer} must roll all dice'),
            descriptionmyturn: _('${you} must roll all dice'),
            possibleactions: ['RollDice'], // RollDice => If rolledDice is empty
            transitions: getTransitions(Transitions.NextPlayer, Transitions.SkullIsland, Transitions.NextRoll)
        },

        // skull island
        201: {
            description: _('${actplayer} is on the Island of Skull and must roll dice'),
            descriptionmyturn: _('${you} are on the Island of Skull and must roll dice'),
            possibleactions: ['RollDice'], // RollDice => if there is 4+ skulls
            transitions: getTransitions(Transitions.NextPlayer)
        },

        // Normal roll
        202: {
            description: _('${actplayer} must roll dice or stop'),
            descriptionmyturn: _('${you} must roll dice or stop'),
            possibleactions: ['SelectDie', 'RollDice', 'StopTurn'],
            transitions: getTransitions(Transitions.NextPlayer)
        },

        // last round?
        // Or Check if current player have 6000+ points => set custom properties HaveStartedLastRound
        // Check if current player have HaveStartedLastRound = true if yes check if anyone have 6000+ points
        // The player with the higher score win

    };
}

function getTransitions(...transitions: Transition[]): Transitions {
    return transitions.reduce((o: Transitions, transition) => {
        o[transition.name] = transition.id
        return o
    }, {})
}

function transitionTo(transition: Transition) {
    bga.nextState(transition.name);
}

function transitionToNextPlayer() {
    changeOrStopDisplay("none");

    bga.nextPlayer();

    showLabelsToNextPlayer();

    transitionTo(Transitions.NextPlayer);
}

function transitionToSkullIsland() {
    bga.log(_("${player_name} goes to the <b>Island of Skull</b>"));

    changeOrStopDisplay("none");

    transitionTo(Transitions.SkullIsland);
}

function transitionToNextRoll() {
    changeOrStopDisplay("block");

    transitionTo(Transitions.NextRoll);
}

function checkAction(action: Actions) {
    bga.checkAction(action);
}

function postSetup() {
    transitionToNextPlayer();
}