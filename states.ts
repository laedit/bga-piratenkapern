type Transition = { name: string, id: number };

const Transitions = {
    NextPlayer: { name: "nextPlayer", id: 200 },
    SkullIsland: { name: "skullIsland", id: 201 },
    NextRoll: { name: "nextRoll", id: 202 },
    GuardianUsage: { name: "guardianUsage", id: 203 },
    CheckEndOfGame: { name: "checkEndOfGame", id: 204 }
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
            transitions: getTransitions(Transitions.CheckEndOfGame, Transitions.SkullIsland, Transitions.NextRoll, Transitions.GuardianUsage)
        },

        // skull island
        201: {
            description: _('${actplayer} is on the Island of Skull and must roll dice'),
            descriptionmyturn: _('${you} are on the Island of Skull and must roll dice'),
            possibleactions: ['RollDice'], // RollDice => if there is 4+ skulls
            transitions: getTransitions(Transitions.CheckEndOfGame)
        },

        // Normal roll
        202: {
            description: _('${actplayer} must roll dice or stop'),
            descriptionmyturn: _('${you} must roll dice or stop'),
            possibleactions: ['SelectDie', 'RollDice', 'StopTurn'],
            transitions: getTransitions(Transitions.CheckEndOfGame, Transitions.GuardianUsage)
        },

        // Offer Guardian usage
        203: {
            description: _('${actplayer} may reroll one skull die'),
            descriptionmyturn: _('${you} may reroll one skull die'),
            possibleactions: ['SelectDie', 'RollDice', 'StopTurn'], // => If there is 3+ skulls + guardian non used
            transitions: getTransitions(Transitions.CheckEndOfGame, Transitions.SkullIsland, Transitions.NextRoll)
        },

        // Check end of game
        204: {
            onState: 'checkEndOfGame',
            transitions: getTransitions(Transitions.NextPlayer)
        }
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

function transitionToGuardianUsage() {
    changeOrStopDisplay("block");

    transitionTo(Transitions.GuardianUsage);
}

function transitionToCheckEndOfGame() {
    transitionTo(Transitions.CheckEndOfGame);
}

function checkAction(action: Actions) {
    bga.checkAction(action);
}

function postSetup() {
    // If first card is treasure island => move TreasureIslandZone on top of the card
    if (Card.isCurrent(PirateCard.Treasure)) {
        bga.moveTo(Zones.TreasureIsland, Zones.Deck);
    }

    transitionToNextPlayer();
}

function checkEndOfGame() {
    /**
    Dès qu'un joueur a atteint 6000 points ou plus, tous les autres joueurs après lui partent en voyage de capture. Si son score est dépassé, il peut effectuer un dernier raid. Le joueur qui a le plus de points gagne.
    Attention : si aucun joueur n'a plus de 6000 points au tableau d'affichage en raison du dernier raid, le jeu continue jusqu'à ce qu'un joueur ait atteint à nouveau au moins 6000 points. Celui-ci gagne immédiatement.
    **/
    let players = Object.values(bga.getPlayers()).map(player => { return Object.assign(player, { score: bga.getScore(player.color) }) });
    let currentPlayerColor = bga.getCurrentPlayerColor();
    let currentPlayerScore = players.find(p => p.color === currentPlayerColor)!.score;
    let winningScore = getWinningScore();

    if (currentPlayerColor === getGlobalVariable("c_lastTurnPlayer")) {
        bga.trace(`Player ${currentPlayerColor} last turn`);
        if (players.every(p => p.score < winningScore)) {
            setGlobalVariable("c_immediateWin", "true");
            bga.trace("Immediate win started");
        }
        else {
            bga.trace("End game by last turn and player max score");
            bga.setGameProgression(100);
            bga.endGame();
        }
    }

    if (currentPlayerScore >= winningScore) {
        if (getGlobalVariable("c_immediateWin") === "true") {
            bga.trace("End game by immediate win");
            bga.setGameProgression(100);
            bga.endGame();
        }
        else {
            setGlobalVariable("c_lastTurnPlayer", currentPlayerColor);
            bga.trace(`last turn player activated for '${currentPlayerColor}'`);
        }
    }

    bga.nextPlayer();

    // nextPlayer is really activated once out of this code
    // so we will try to get the "next" player color
    let nextPlayerNo = Number(players.find(p => p.color === currentPlayerColor)!.no);
    if (nextPlayerNo === players.length) {
        nextPlayerNo = 1;
    }
    else {
        nextPlayerNo += 1;
    }
    currentPlayerColor = players.find(player => player.no === nextPlayerNo.toString())!.color;

    if (currentPlayerColor === getGlobalVariable("c_lastTurnPlayer")) {
        if (players.some(p => p.score >= winningScore)) {
            if (players.reduce((prev, current) => (prev.score > current.score) ? prev : current).color === currentPlayerColor) { // currentPlayer.Score is max scores
                bga.trace("End game by last turn and max score");
                bga.setGameProgression(100);
                bga.endGame();
            }
        }
        else {
            setGlobalVariable("c_immediateWin", "true");
            bga.trace("Immediate win started");
        }
    }

    transitionToNextPlayer();
}