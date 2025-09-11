import { Spell } from "./spell";

const BLESSINGS: { [key: string]: Spell } = {
    "heal": new Spell({
        name: "Heal"
    }),
};

export default BLESSINGS;