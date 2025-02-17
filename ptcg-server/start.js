require('./config');

const { App } = require('./output/backend/app');
const { BotManager } = require('./output/game/bots/bot-manager');
const { SimpleBot } = require('./output/simple-bot/simple-bot');
const { CardManager } = require('./output/game/cards/card-manager');
const { StateSerializer } = require('./output/game/serializer/state-serializer');
const { config } = require('./output/config');
const sets = require('./output/sets');
const process = require('process');

const cardManager = CardManager.getInstance();

/* Classic */
cardManager.defineSet(sets.wizardsBlackStarPromos);
cardManager.defineSet(sets.baseSet);
cardManager.defineSet(sets.fossil);
cardManager.defineSet(sets.jungle);
cardManager.defineSet(sets.teamRocket);

/* Gym */
cardManager.defineSet(sets.gymHeroes);
cardManager.defineSet(sets.gymChallenge);

/* Neo */
cardManager.defineSet(sets.neoGenesis);
cardManager.defineSet(sets.neoDiscovery);
cardManager.defineSet(sets.neoRevelation);
cardManager.defineSet(sets.neoDestiny);

/* E-Card */
cardManager.defineSet(sets.expedition);
cardManager.defineSet(sets.aquapolis);
cardManager.defineSet(sets.skyridge);

/* EX */
cardManager.defineSet(sets.rubyAndSapphire);
cardManager.defineSet(sets.sandstorm);
cardManager.defineSet(sets.dragon);
cardManager.defineSet(sets.teamMagmaVsTeamAqua);
cardManager.defineSet(sets.hiddenLegends);
cardManager.defineSet(sets.fireRedAndLeafGreen);
cardManager.defineSet(sets.popSeries1);
cardManager.defineSet(sets.teamRocketReturns);
cardManager.defineSet(sets.deoxys);
cardManager.defineSet(sets.emerald);
cardManager.defineSet(sets.popSeries2);
cardManager.defineSet(sets.unseenForces);
cardManager.defineSet(sets.deltaSpecies);
cardManager.defineSet(sets.legendMaker);
cardManager.defineSet(sets.popSeries3);
cardManager.defineSet(sets.holonPhantoms);
cardManager.defineSet(sets.popSeries4);
cardManager.defineSet(sets.crystalGuardians);
cardManager.defineSet(sets.dragonFrontiers);
cardManager.defineSet(sets.powerKeepers);
cardManager.defineSet(sets.popSeries5);

/* Diamond & Pearl */
cardManager.defineSet(sets.diamondAndPearlPromos);
cardManager.defineSet(sets.diamondAndPearl);
cardManager.defineSet(sets.mysteriousTreasures);
cardManager.defineSet(sets.popSeries6);
cardManager.defineSet(sets.secretWonders);
cardManager.defineSet(sets.greatEncounters);
cardManager.defineSet(sets.popSeries7);
cardManager.defineSet(sets.majesticDawn);
cardManager.defineSet(sets.legendsAwakened);
cardManager.defineSet(sets.popSeries8);
cardManager.defineSet(sets.stormfront);

/* Platinum */
cardManager.defineSet(sets.platinum);
cardManager.defineSet(sets.popSeries9);
cardManager.defineSet(sets.risingRivals);
cardManager.defineSet(sets.supremeVictors);
cardManager.defineSet(sets.arceus);
cardManager.defineSet(sets.rumble);

/* HeartGold & SoulSilver */
cardManager.defineSet(sets.heartGoldAndSoulSilverPromos);
cardManager.defineSet(sets.heartGoldAndSoulSilver);
cardManager.defineSet(sets.unleashed);
cardManager.defineSet(sets.undaunted);
cardManager.defineSet(sets.triumphant);
cardManager.defineSet(sets.callOfLegends);

/* Black & White */
cardManager.defineSet(sets.blackAndWhitePromos);
cardManager.defineSet(sets.blackAndWhite);
cardManager.defineSet(sets.mcDonaldsCollection2011);
cardManager.defineSet(sets.emergingPowers);
cardManager.defineSet(sets.nobleVictories);
cardManager.defineSet(sets.nextDestinies);
cardManager.defineSet(sets.darkExplorers);
cardManager.defineSet(sets.mcDonaldsCollection2012);
cardManager.defineSet(sets.dragonsExalted);
cardManager.defineSet(sets.dragonVault);
cardManager.defineSet(sets.boundariesCrossed);
cardManager.defineSet(sets.plasmaStorm);
cardManager.defineSet(sets.plasmaFreeze);
cardManager.defineSet(sets.plasmaBlast);
cardManager.defineSet(sets.legendaryTreasure);

/* XY */
cardManager.defineSet(sets.xyPromos);
cardManager.defineSet(sets.xy);
cardManager.defineSet(sets.flashfire);
cardManager.defineSet(sets.furiousFists);
cardManager.defineSet(sets.phantomForces);
cardManager.defineSet(sets.primalClash);
cardManager.defineSet(sets.doubleCrisis);
cardManager.defineSet(sets.roaringSkies);
cardManager.defineSet(sets.ancientOrigins);
cardManager.defineSet(sets.breakthrough);
cardManager.defineSet(sets.breakpoint);
cardManager.defineSet(sets.generations);
cardManager.defineSet(sets.fatesCollide);
cardManager.defineSet(sets.steamSiege);
cardManager.defineSet(sets.evolutions);

/* Sun & Moon */
cardManager.defineSet(sets.sunAndMoonPromos);
cardManager.defineSet(sets.sunAndMoonEnergy);
cardManager.defineSet(sets.sunAndMoon);
cardManager.defineSet(sets.guardiansRising);
cardManager.defineSet(sets.burningShadows);
cardManager.defineSet(sets.shiningLegends);
cardManager.defineSet(sets.crimsonInvasion);
cardManager.defineSet(sets.ultraPrism);
cardManager.defineSet(sets.forbiddenLight);
cardManager.defineSet(sets.celestialStorm);
cardManager.defineSet(sets.dragonMajesty);
cardManager.defineSet(sets.lostThunder);
cardManager.defineSet(sets.teamUpEnergy);
cardManager.defineSet(sets.teamUp);
cardManager.defineSet(sets.detectivePikachu);
cardManager.defineSet(sets.unbrokenBonds);
cardManager.defineSet(sets.unifiedMinds);
cardManager.defineSet(sets.hiddenFates);
cardManager.defineSet(sets.mcDonaldsCollection2019);
cardManager.defineSet(sets.cosmicEclipse);

/* Sword & Shield */
cardManager.defineSet(sets.swordAndShieldPromos);
cardManager.defineSet(sets.swordAndShieldEnergy);
cardManager.defineSet(sets.swordAndShield);
cardManager.defineSet(sets.rebelClash);
cardManager.defineSet(sets.darknessAblaze);
cardManager.defineSet(sets.championsPath);
cardManager.defineSet(sets.vividVoltage);
cardManager.defineSet(sets.shiningFates);
cardManager.defineSet(sets.battleStyles);
cardManager.defineSet(sets.chillingReign);
cardManager.defineSet(sets.celebrations);
cardManager.defineSet(sets.fusionStrike);
cardManager.defineSet(sets.brilliantStars);
cardManager.defineSet(sets.brilliantStarsEnergy);
cardManager.defineSet(sets.astralRadiance);
cardManager.defineSet(sets.pokemonGo);
cardManager.defineSet(sets.mcDonaldsCollection2022);
cardManager.defineSet(sets.lostOrigin);
cardManager.defineSet(sets.silverTempest);
cardManager.defineSet(sets.crownZenith);

/* Scarlet & Violet */
cardManager.defineSet(sets.scarletAndVioletPromos);
cardManager.defineSet(sets.scarletAndViolet);
cardManager.defineSet(sets.scarletAndVioletEnergy);
cardManager.defineSet(sets.paldeaEvolved);
cardManager.defineSet(sets.obsidianFlames);
cardManager.defineSet(sets.mcDonaldsMatchBattle2023);
cardManager.defineSet(sets.set151);
cardManager.defineSet(sets.paradoxRift);
cardManager.defineSet(sets.paldeanFates);
cardManager.defineSet(sets.temporalForces);
cardManager.defineSet(sets.twilightMasquerade);
cardManager.defineSet(sets.shroudedFable);
cardManager.defineSet(sets.stellarCrown);
cardManager.defineSet(sets.surgingSparks);
cardManager.defineSet(sets.prismaticEvolutions);

StateSerializer.setKnownCards(cardManager.getAllCards());

const botManager = BotManager.getInstance();
botManager.registerBot(new SimpleBot('bot'));
botManager.registerBot(new SimpleBot('basefossil'));
botManager.registerBot(new SimpleBot('baserocket'));
botManager.registerBot(new SimpleBot('basegym'));
botManager.registerBot(new SimpleBot('prop153'));
botManager.registerBot(new SimpleBot('baseneo'));
botManager.registerBot(new SimpleBot('generation1theme'));
botManager.registerBot(new SimpleBot('generation2theme'));
botManager.registerBot(new SimpleBot('generation3theme'));
botManager.registerBot(new SimpleBot('generation4theme'));
botManager.registerBot(new SimpleBot('generation5theme'));
botManager.registerBot(new SimpleBot('generation6theme'));
botManager.registerBot(new SimpleBot('generation7theme'));
botManager.registerBot(new SimpleBot('generation8theme'));
botManager.registerBot(new SimpleBot('generation9theme'));

const app = new App();

app.connectToDatabase()
  .catch(error => {
    console.log('Unable to connect to database.');
    console.error(error.message);
    process.exit(1);
  })
  .then(() => app.configureBotManager(botManager))
  .then(() => app.start())
  .then(() => {
    const address = config.backend.address;
    const port = config.backend.port;
    console.log('Application started on ' + address + ':' + port + '.');
  })
  .catch(error => {
    console.error(error.message);
    console.log('Application not started.');
    process.exit(1);
  });
