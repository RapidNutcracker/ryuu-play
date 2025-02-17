import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition, EnergyType } from '../../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, CoinFlipPrompt, PokemonCardList, SelectPrompt, ChoosePokemonPrompt, PlayerType, SlotType, CardTarget, StateUtils, ChoosePrizePrompt, GameLog } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { DealDamageEffect, DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';


function* useBuzzap(next: Function, store: StoreLike, state: State, self: Electrode, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const electrodeSlot = StateUtils.findCardList(state, self) as PokemonCardList;
  const pokemonCard = electrodeSlot.getPokemonCard();

  const blocked: CardTarget[] = [];
  let hasOtherPokemon: boolean = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.cards.length > 0) {
      if (cardList.getPokemonCard() === self) {
        blocked.push(target);
      } else {
        hasOtherPokemon = true;
      }
    }
  });

  if (pokemonCard !== self) {
    throw new GameError(GameMessage.ILLEGAL_ACTION);
  }

  const electrodeDisabled = [
    SpecialCondition.ASLEEP,
    SpecialCondition.CONFUSED,
    SpecialCondition.PARALYZED
  ].some(sc => electrodeSlot.specialConditions.includes(sc));

  if (electrodeDisabled && !hasOtherPokemon) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const options: { message: string, value: CardType }[] = [
    { message: 'LABEL_COLORLESS', value: CardType.COLORLESS },
    { message: 'LABEL_GRASS', value: CardType.GRASS },
    { message: 'LABEL_FIGHTING', value: CardType.FIGHTING },
    { message: 'LABEL_FIRE', value: CardType.FIRE },
    { message: 'LABEL_LIGHTNING', value: CardType.LIGHTNING },
    { message: 'LABEL_PSYCHIC', value: CardType.PSYCHIC },
    { message: 'LABEL_WATER', value: CardType.WATER },
    { message: 'LABEL_DARKNESS', value: CardType.DARKNESS },
    { message: 'LABEL_METAL', value: CardType.METAL },
    { message: 'LABEL_DRAGON', value: CardType.DRAGON },
    { message: 'LABEL_FAIRY', value: CardType.FAIRY },
  ];

  yield store.prompt(state, new SelectPrompt(
    player.id,
    GameMessage.CHOOSE_SPECIAL_CONDITION,
    options.map(c => c.message),
    { allowCancel: false }
  ), choice => {
    const selected = options[choice];
    self.provides = new Array(2).fill(selected.value);
    next();
  });

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: false, blocked }
  ), selected => {

    store.log(state, GameLog.LOG_POKEMON_KO, {
      name: pokemonCard.name
    });

    electrodeSlot.moveCardTo(pokemonCard, selected[0]);
    selected[0].energy = pokemonCard;

    next();
  });

  electrodeSlot.moveTo(player.discard);

  yield store.prompt(state, new ChoosePrizePrompt(
    opponent.id,
    GameMessage.CHOOSE_PRIZE_CARD,
    { count: 1, allowCancel: false }
  ), prizes => {
    if (prizes && prizes.length > 0) {
      prizes[0].moveTo(opponent.hand);
    }

    next();
  });

  return state;
}

export class Electrode extends PokemonCard {

  public id: number = 21;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Voltorb';

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 80;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [{
    name: 'Buzzap',
    useWhenInPlay: true,
    powerType: PowerType.POKEMON_POWER,
    text:
      'At any time during your turn (before your attack), ' +
      'you may Knock Out Electrode and attach it to 1 of your other Pokémon. ' +
      'If you do, choose a type of Energy. ' +
      'Electrode is now an Energy card (instead of a Pokémon) that provides 2 energy of that type. ' +
      'You can\'t use this power if Electrode is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Electric Shock',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 50,
    text: 'Flip a coin. If tails, Electrode does 10 damage to itself.'
  }];

  public set: string = 'BS';

  public name: string = 'Electrode';

  public fullName: string = 'Electrode BS';

  public provides: CardType[] = [];

  public energyType: EnergyType = EnergyType.SPECIAL;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Buzzap
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useBuzzap(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    // Electric Shock
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          const dealDamage = new DealDamageEffect(effect, 10);
          dealDamage.target = player.active;
          return store.reduceEffect(state, dealDamage);
        }
      });
    }

    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energy === this) {
      effect.energyMap.push({ card: this, provides: [...this.provides] });
    }

    if (effect instanceof DiscardCardsEffect && effect.cards.includes(this) && effect.target.energy === this) {
      effect.target.energy = undefined;
    }

    return state;
  }
}
