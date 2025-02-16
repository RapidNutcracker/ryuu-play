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

/* Gym */


/* Neo */


/* E-Card */


/* EX */


/* Diamond & Pearl */
cardManager.defineSet(sets.setDiamondAndPearl);

/* Platinum */
cardManager.defineSet(sets.setOp9);

/* HeartGold & SoulSilver */
cardManager.defineSet(sets.setHgss);

/* Black & White */
cardManager.defineSet(sets.setBlackAndWhite);
cardManager.defineSet(sets.setBlackAndWhite2);
cardManager.defineSet(sets.setBlackAndWhite3);
cardManager.defineSet(sets.setBlackAndWhite4);

/* XY */


/* Sun & Moon */


/* Sword & Shield */
cardManager.defineSet(sets.setSwordAndShield);
cardManager.defineSet(sets.brilliantStars);
cardManager.defineSet(sets.astralRadiance);
cardManager.defineSet(sets.lostOrigin);
cardManager.defineSet(sets.silverTempest);


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
