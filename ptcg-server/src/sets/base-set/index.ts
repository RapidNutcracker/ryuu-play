import { Card } from '../../game/store/card/card';

import { Abra } from './abra';
import { Alakazam } from './alakazam';
import { Arcanine } from './arcanine';
import { Beedrill } from './beedrill';
import { Blastoise } from './blastoise';
import { Bulbasaur } from './bulbasaur';
import { Caterpie } from './caterpie';
import { Chansey } from './chansey';
import { Charizard } from './charizard';
import { Charmander } from './charmander';
import { Charmeleon } from './charmeleon';
import { Clefairy } from './clefairy';
import { Dewgong } from './dewgong';
import { Diglett } from './diglett';
import { Doduo } from './doduo';
import { Dragonair } from './dragonair';
import { Dratini } from './dratini';
import { Drowzee } from './drowzee';
import { Dugtrio } from './dugtrio';
import { Electabuzz } from './electabuzz';
import { Electrode } from './electrode';
import { Farfetchd } from './farfetch\'d';
import { Gastly } from './gastly';
import { Growlithe } from './growlithe';
import { Gyarados } from './gyarados';
import { Haunter } from './haunter';
import { Hitmonchan } from './hitmonchan';
import { Ivysaur } from './ivysaur';
import { Jynx } from './jynx';
import { Kadabra } from './kadabra';
import { Kakuna } from './kakuna';
import { Koffing } from './koffing';
import { Machamp } from './machamp';
import { Machoke } from './machoke';
import { Machop } from './machop';
import { Magikarp } from './magikarp';
import { Magmar } from './magmar';
import { Magnemite } from './magnemite';
import { Magneton } from './magneton';
import { Metapod } from './metapod';
import { Mewtwo } from './mewtwo';
import { Nidoking } from './nidoking';
import { NidoranMale } from './nidoran-male';
import { Nidorino } from './nidorino';
import { Ninetales } from './ninetales';
import { Onix } from './onix';
import { Pidgeotto } from './pidgeotto';
import { Pidgey } from './pidgey';
import { Pikachu } from './pikachu';
import { Poliwag } from './poliwag';
import { Poliwhirl } from './poliwhirl';
import { Poliwrath } from './poliwrath';
import { Ponyta } from './ponyta';
import { Porygon } from './porygon';
import { Raichu } from './raichu';
import { Raticate } from './raticate';
import { Rattata } from './rattata';
import { Sandshrew } from './sandshrew';
import { Seel } from './seel';
import { Squirtle } from './squirtle';
import { Starmie } from './starmie';
import { Staryu } from './staryu';
import { Tangela } from './tangela';
import { Venusaur } from './venusaur';
import { Voltorb } from './voltorb';
import { Vulpix } from './vulpix';
import { Wartortle } from './wartortle';
import { Weedle } from './weedle';
import { Zapdos } from './zapdos';

import { Bill } from './bill';
import { ComputerSearch } from './computer-search';
import { EnergyRemoval } from './energy-removal';
import { EnergyRetrieval } from './energy-retrieval';
import { GustOfWind } from './gust-of-wind';
import { ItemFinder } from './item-finder';
import { Lass } from './lass';
import { Maintenance } from './maintenance';
import { PlusPower } from './pluspower';
import { PokemonBreeder } from './pokemon-breeder';
import { Potion } from './potion';
import { ProfessorOak } from './professor-oak';
import { ScoopUp } from './scoop-up';
import { SuperEnergyRemoval } from './super-energy-removal';
import { SuperPotion } from './super-potion';
import { Switch } from './switch';

import { FightingEnergy } from './fighting-energy';
import { FireEnergy } from './fire-energy';
import { GrassEnergy } from './grass-energy';
import { LightningEnergy } from './lightning-energy';
import { PsychicEnergy } from './psychic-energy';
import { WaterEnergy } from './water-energy';
import { Revive } from './revive';
import { Defender } from './defender';
import { ImpostorProfessorOak } from './impostor-professor-oak';
import { PokemonTrader } from './pokemon-trader';

export const baseSet: Card[] = [
  new Alakazam(),
  new Blastoise(),
  new Chansey(),
  new Charizard(),
  new Clefairy(),
  new Gyarados(),
  new Hitmonchan(),
  new Machamp(),
  new Magneton(),
  new Mewtwo(),
  new Nidoking(),
  new Ninetales(),
  new Poliwrath(),
  new Raichu(),
  new Venusaur(),
  new Zapdos(),
  new Beedrill(),
  new Dragonair(),
  new Dugtrio(),
  new Electabuzz(),
  new Electrode(),
  new Pidgeotto(),
  new Arcanine(),
  new Charmeleon(),
  new Dewgong(),
  new Dratini(),
  new Farfetchd(),
  new Growlithe(),
  new Haunter(),
  new Ivysaur(),
  new Jynx(),
  new Kadabra(),
  new Kakuna(),
  new Machoke(),
  new Magikarp(),
  new Magmar(),
  new Nidorino(),
  new Poliwhirl(),
  new Porygon(),
  new Raticate(),
  new Seel(),
  new Wartortle(),
  new Abra(),
  new Bulbasaur(),
  new Caterpie(),
  new Charmander(),
  new Diglett(),
  new Doduo(),
  new Drowzee(),
  new Gastly(),
  new Koffing(),
  new Machop(),
  new Magnemite(),
  new Metapod(),
  new NidoranMale(),
  new Onix(),
  new Pidgey(),
  new Pikachu(),
  new Poliwag(),
  new Ponyta(),
  new Rattata(),
  new Sandshrew(),
  new Squirtle(),
  new Starmie(),
  new Staryu(),
  new Tangela(),
  new Voltorb(),
  new Vulpix(),
  new Weedle(),

  new Bill(),
  new ComputerSearch(),
  new Defender(),
  new GustOfWind(),
  new EnergyRemoval(),
  new EnergyRetrieval(),
  new ImpostorProfessorOak(),
  new ItemFinder(),
  new Lass(),
  new Maintenance(),
  new PlusPower(),
  new PokemonBreeder(),
  new PokemonTrader(),
  new Potion(),
  new ProfessorOak(),
  new Revive(),
  new ScoopUp(),
  new SuperEnergyRemoval(),
  new SuperPotion(),
  new Switch(),

  new FightingEnergy(),
  new FireEnergy(),
  new GrassEnergy(),
  new LightningEnergy(),
  new PsychicEnergy(),
  new WaterEnergy(),
];