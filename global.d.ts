// Type definitions for BoardGameArena Sandbox API
// Definitions by: Jérémie Bertrand https://laedit.net

type TranslatedString = string;

/**
 * Translation marker
 * @param message Message to translate
 */
declare function _(message: string): TranslatedString;

type Transitions = { [key: string]: number }

type State<TAction extends string = string> = {
    onState?: string,
    description?: TranslatedString,
    descriptionmyturn?: TranslatedString,
    possibleactions?: TAction[],
    transitions: Transitions
}

type States<TAction extends string = string> = {
    [id: number]: State<TAction>
}

type Style = "SELECTED" | "LIGHT" | "LIGHTBACKGROUND" | "REDSELECTED" | "CLICKABLE" | "ROUNDED" | "CLICKABLE_ROUNDED" | string;

type Visibility = 'everyone' | string; // FIXME add other and remove string and is there a way to check 'player'+color like 'player'+bga.getActivePlayerColor()?

type ZoneArrangement = 'stacked' | 'spreaded' | 'unique' | 'free';

type ElementSelector = {
    id?: number,
    tag?: string,
    name?: string,
    parent?: number,
    tags?: string[],
    howToArrange?: ZoneArrangement
}

type ElementsProperties = {
    [key: number]: ElementProperties
}

type ElementProperties = {
    name?: string,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    visible?: Visibility,
    howToArrange?: ZoneArrangement,
    inlineStyle?: string
}

type Player = {
    color: string,
    id: string,
    name: string,
    no: string
}

declare interface BoardGameArena {
    /**
     * Write something immediately in the BGA log (on the right of the screen).
     * @param message 
     */
    trace(message: string): void

    /**
     * Write something immediately in the BGA log (on the right of the screen).
     * @param dump 
     */
    trace(dump: object): void

    /**
     * Stop the script immediately, display the "txt" messages and cancel (ie : rollback) on every previous API call except bga.trace
     * @param txt message to display
     */
    exit(txt: string): never

    /**
     * Stop the script immediately, display the "txt" messages and cancel (ie : rollback) on every previous API call except bga.trace
     * @param dump dump to display
     */
    exit(dump: object): never

    /**
     * This is the function to use when a player is doing something against game rules.
     * @param message Message that will be displayed to this player as a "red message", so he/she can understand the rule.
     */
    cancel(message: TranslatedString): void

    /**
     * This is the function to use when some unexpected error happens in your script.
     * @param message Message that will be displayed to user, with mention "Unexpected error".
     * The player will be incited to fill a bug report. The purpose of the message is to help you to identify the bug.
     */
    error(message: string): never

    /**
     * Write something in the BGA log on the right.
     * @param message Message to log
     * @param parameters Message parameters
     */
    log(message: TranslatedString, parameters?: object): void

    /**
     * Display a "speech bubble", attached to the specified target, containing the specified text.
     * @param target if of the element to which attach the bubble
     * @param text text to display
     * @param args text parameters
     * @param delay milliseconds to wait before displaying the speech bubble (default : 0)
     * @param duration how long to show the speech bubble in milliseconds (default : 3000)
     * @param size size of the text in percent (default: 100)
     */
    speechBubble(target: number, text: TranslatedString, args?: object, delay?: number, duration?: number, size?: number): void

    /**
     * Display an animated temporary "score number", attached to the specified target.
     * @param targetId id of the element on top of which the score will be displayed
     * @param color color of the player who is scoring for that target
     * @param score 
     */
    displayScoring(targetId: number, color: string, score: number): void

    /**
     * Allow you to retrieve informations about one game element specified using "selector" argument.
     * Return null if no element is found.
     * @param select selector
     */
    getElement(select: ElementSelector): number,

    /**
     * Allow you to retrieve informations about one game element specified using "selector" argument.
     * Return null if no element is found.
     * @param select selector
     * @param property property to retrieve
     */
    getElement(select: ElementSelector, property: string): any

    /**
     * Allow you to retrieve informations about one game element specified using "selector" argument.
     * Return null if no element is found.
     * @param select selector
     * @param properties properties to retrieve
     */
    getElement<T extends string>(select: ElementSelector, properties: T[]): { [K in T]: any }

    /**
     * Returns an object holding the properties of the elements matching the selector.
     * @param selector selector
     */
    getElements(selector: ElementSelector): { [key: number]: number }

    /**
     * Returns an object holding the properties of the elements matching the selector.
     * @param selector selector
     * @param property to retrieve
     */
    getElements(selector: ElementSelector, property: string): { [key: number]: { [key: number]: any } }

    /**
     * Returns an array of all elements matching the selector, holding the required properties.
     * @param selector selector
     */
    getElementsArray(selector: ElementSelector): number[]

    /**
     * Returns an array of all elements matching the selector, holding the required properties.
     * @param selector selector
     * @param property property to retrieve
     */
    getElementsArray(selector: ElementSelector, property: string): any[]

    /**
     * Returns an array of all elements matching the selector, holding the required properties.
     * @param selector selector
     * @param property properties to retrieve
     */
    getElementsArray<T extends string>(selector: ElementSelector, properties: T[]): { [K in T]: any }[]

    /**
     * Return true if "element_id" is a descendant of "parent_id" (ie : if element_id game element has been placed on parent_id game element).
     * @param element_id element id
     * @param parent_id parent id
     * @example
     * if( bga.isOn( bga.getElementIfByName( 'Turn counter' ), bga.getElementIfByName( 'Turn 6' ) )
     * {
     *     // Trigger game end
     * }
     */
    isOn(element_id: number, parent_id: number): boolean

    /**
     * Move element to specified target id (eventually following path defined by an array of element ids to pass over on the way).
     * The exact destination of element depends on target's "howToArrange" property ("How elements are arranged on it?" : spreaded/deck/...).
     * @param elementId element id
     * @param targetId target id
     * @example
     * bga.moveTo( bga.getElementIdByName( 'Turn counter' ), bga.getElementIdByName( 'Turn 3' ) );
     */
    moveTo(elementId: number, targetId: number): void

    /**
     * Move elements to specified target id (eventually following path defined by an array of element ids to pass over on the way).
     * The exact destination of elements depends on target's "howToArrange" property ("How elements are arranged on it?" : spreaded/deck/...).
     * @param elementsIds elements ids
     * @param targetId target id
     * @example
     * bga.moveTo( bga.getElementIdByName( 'Turn counter' ), bga.getElementIdByName( 'Turn 3' ) );
     */
    moveTo(elementsIds: number[], targetId: number): void

    /**
     * Deletes all properties from this element and remove it from play.
     * Warning: it won't be recoverable!
     * If you may need it later, you should move it inside a zone with visibility set to "Everyone, but hide what's inside" instead of removing it.
     * @param elementId element id
     */
    removeElement(elementId: number): void

    /**
     * Flip target element (or array of elements) if the elements can be flipped (ex: cards).
     * @param targetId id of the element to flip
     */
    flip(targetId: number): void

    /**
     * Flip target element (or array of elements) if the elements can be flipped (ex: cards).
     * @param targetIds id of the element to flip
     */
    flip(targetIds: number[]): void

    /**
     * Shuffle elements contained inside the target element.
     * @param targetId id of the parent of the elements to shuffle
     */
    shuffle(targetId: number): void

    /**
     * Shuffle elements.
     * @param targetsIds ids of the elements to shuffle
     */
    shuffle(targetsIds: number[]): void

    /**
     * Roll the target element.
     * Target element must have the property "Can be rolled" set.
     * @param targetId id of the element to roll
     */
    roll(targetId: number): void

    /**
     * Roll the target elements.
     * Target elements must have the property "Can be rolled" set.
     * @param targetsIds ids of the elements to roll
     */
    roll(targetsIds: number[]): void

    /**
     * Set the target element with this value.
     * Target element must have the property "Can set value" set.
     * @param element_id id of the die
     * @param value value of the die
     */
    setDie(element_id: number, value: string): void

    /**
     * Set the elements with this value.
     * Target elements must have the property "Can set value" set.
     * @param element_ids ids of the dice
     * @param value value of the dice
     */
    setDie(element_ids: number[], value: string): void

    /**
     * Deal nbr_per_target cards from deck_id element to all elements having target_tag.
     * @param deck_id id of the deck containing the cards
     * @param target_tag tag selector for the targets
     * @param nbr_per_target number of cards to deal
     */
    deal(deck_id: number, target_tag: string, nbr_per_target: number): void

    /**
     * Increases the score for the player with the specified color, of the specified increment value.
     * @param playerColor 
     * @param value 
     */
    incScore(playerColor: string, value: number): void

    /**
     * Sets the score for the player with the specified color.
     * @param playerColor 
     * @param value 
     */
    setScore(playerColor: string, value: number): void

    /**
     * Gets the score of the player with the specified color.
     * @param playerColor 
     */
    getScore(playerColor: string): number

    /**
     * Check if action is valid regarding current game state and raise an error if it's not the case.
     * @param action action to check
     */
    checkAction(action: string): void | never

    /**
     * Check if action is valid regarding current game state and returns a boolean with the appropriate value.
     * @param action action to check
     */
    isActionPossible(action: string): boolean

    /**
     * Returns the color code of the currently active player
     */
    getActivePlayerColor(): string

    /**
     * Returns the name of the currently active player
     */
    getActivePlayerName(): string

    /**
     * Activates the next player in play order.
     */
    nextPlayer(): void

    /**
     * Activates all players (multiactive state).
     */
    activeAllPlayers(): void

    /**
     * Make the current player inactive and go to the next state matching the provided transition if all players are inactive (multiactive state)
     * @param transition name of the transition
     */
    endTurn(transition: string): void

    /**
     * Returns the colors code of the currently active players
     */
    getActivePlayerColors(): string[]

    /**
     * Returns the color code of the current player (the player who made the interface action being handled; may not be the active player).
     */
    getCurrentPlayerColor(): string

    /**
     * Moves to the next state matching the provided transition. 
     * @param state next state name
     */
    nextState(state: string): void

    /**
     * Jumps to specified state.
     * @param state_id id of the state
     */
    gotoState(state_id: number): void

    /**
     * Returns an array of players with the players information
     */
    getPlayers(): { [color: string]: Player }

    /**
     * Updates the game progression percentage (progression must be an integer between 0 and 100)
     * @param progression 
     */
    setGameProgression(progression: number): void

    /**
     * When the end game condition is met, you can use this function to end the game (after setting the appropriate scores!)
     */
    endGame(): void

    /**
     * Pause the client interface during a specified number of milliseconds.
     * If you do not use bga.pause, all Sandbox game actions are executed immediately and synchronously.
     * @param milliseconds number of milliseconds to wait
     * @example
     * bga.log( "1" );    // Will be displayed immediately on the log
     * bga.pause( 3000 ); // pause during 3 seconds
     * bga.log( "2" );    // Will be displayed after the 3 second on the log
     * bga.log( "3" );    // Will be displayed right after the previous one, without delay.
     */
    pause(milliseconds: number): void

    /**
     * Must be used to stop the event propagation if you have two clickable elements on top of one another and you want only the onclick function matching the one on top to be triggered.
     */
    stopEvent(): void

    /**
     * Returns true if the element with this id has this tag.
     * @param elementId if of the element
     * @param tag tag
     */
    hasTag(elementId: number, tag: string): boolean

    /**
     * Adds this tag to the element with this id. 
     * @param elementId id of the element
     * @param tag tag
     */
    addTag(elementId: number, tag: string): void

    /**
     * Removes this tag from the element with this id.
     * @param id id of the element
     * @param tag tag
     */
    removeTag(id: number, tag: string): void

    /**
     * Adds this style to the element with this id.
     * Predefined styles are: SELECTED / LIGHT / LIGHTBACKGROUND / REDSELECTED / CLICKABLE / ROUNDED / CLICKABLE_ROUNDED
     * @param elementId id of the element
     * @param style style
     */
    addStyle(elementId: number, style: Style): void

    /**
     * Removes this style from the element with this id.
     * @param elementId if of the element
     * @param style style
     */
    removeStyle(elementId: number, style: string): void

    /**
     * Removes this style from the element with this id. 
     * @param elementsIds ids of the elements
     * @param style style
     */
    removeStyle(elementsIds: { [key: number]: number }, style: string): void

    /**
     * This function allows to directly update properties of an object, and to manage custom properties if needed (custom properties must start with prefix "c_").
     */
    setProperties(properties: ElementsProperties): void

    /**
     * Returns the current game variant (0 for none, 1 for option #1, 2 for option #2 and 3 for option #3)
     * @param variantId id of the variant described in game infos (1 or 2)
     */
    getVariant(variantId: 1 | 2): number

    /**
     * Play a sound
     * @param soundName sound name
     */
    playSound(soundName: string): void
}

declare let bga: BoardGameArena;