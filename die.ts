type DieName = "Parrot" | "Coin" | "Diamond" | "Skull" | "Monkey" | "Sabers";
type DieValue = "1" | "2" | "3" | "4" | "5" | "6";
type DieFace = { name: DieName, value: DieValue };

const DieFaces: { [P in DieName]: DieFace } = {
    Parrot: { name: "Parrot", value: "1" },
    Coin: { name: "Coin", value: "2" },
    Diamond: { name: "Diamond", value: "3" },
    Skull: { name: "Skull", value: "4" },
    Monkey: { name: "Monkey", value: "5" },
    Sabers: { name: "Sabers", value: "6" }
}

const DiceTag = "DICE";

const Die = {
    getAll() {
        return bga.getElementsArray({ tag: DiceTag });
    },
    getAllValues() {
        return bga.getElementsArray({ tag: DiceTag }, 'value');
    },
    is(dieId: number, dieFace: DieFace) {
        return bga.getElement({ id: dieId }, 'value') === dieFace.value
    },
    getAllFace(dieSearched: DieFace, zoneId?: number) {
        if (zoneId) {
            return bga.getElementsArray({ tag: DiceTag, parent: zoneId }, ['id', 'value']).filter(die => die.value === dieSearched.value).map(die => die.id)
        }
        return bga.getElementsArray({ tag: DiceTag }, ['id', 'value']).filter(die => die.value === dieSearched.value).map(die => die.id)
    },
    getAllFaceNot(dieSearched: DieFace) {
        return bga.getElementsArray({ tag: DiceTag }, ['id', 'value']).filter(die => die.value !== dieSearched.value).map(die => die.id)
    },
    countFace(dieSearched: DieFace, zoneId?: number) {
        return Die.getAllFace(dieSearched, zoneId).length;
    },
    countSkulls() {
        return Die.countFace(DieFaces.Skull);
    }
}

function logDiceResult() {
    bga.log(_("${player_name} rolled ${dice}"), {
        dice: Die.getAllValues().map(value => Object.values(DieFaces).find(dieFace => dieFace.value === value)?.name).join(", ")
    });
}
