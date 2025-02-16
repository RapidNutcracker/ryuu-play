import { Card } from "../../game/store/card/card";

import { DarknessEnergy } from "./darkness-energy";
import { FightingEnergy } from "./fighting-energy";
import { FireEnergy } from "./fire-energy";
import { GrassEnergy } from "./grass-energy";
import { LightningEnergy } from "./lightning-energy";
import { MetalEnergy } from "./metal-energy";
import { PsychicEnergy } from "./psychic-energy";
import { WaterEnergy } from "./water-energy";


export const scarletAndVioletEnergy: Card[] = [
  new GrassEnergy(),
  new FireEnergy(),
  new WaterEnergy(),
  new LightningEnergy(),
  new PsychicEnergy(),
  new FightingEnergy(),
  new DarknessEnergy(),
  new MetalEnergy(),
]