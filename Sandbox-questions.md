# Questions asked about the Sandbox

Post on the forum: https://boardgamearena.com/forum/viewtopic.php?f=12&t=15254

Solved
------
- Change a sandbox game to a "normal" one:  not possible, it is two distinct systems

- Do not remove elements (cards, tokens, dice) that you may have to use again, instead move them to a zone with visibility to "Everyone, but hide what's inside"

- Get top element in a deck zone :
``` js
function getTopCardOnDeck() {
    return bga.getElementsArray({ parent: bga.getElement({ name: 'Deck' }) }).reverse()[0];
}
```

- If `MoveTo` only works for the first move: check that the zone have "How to arrange elements on it" property set to "Stack/Deck".