import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, PlayerType, PokemonCardList, SlotType, StateUtils, AttachEnergyPrompt, EnergyCard, CardTarget } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckPokemonTypeEffect, CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { AttachEnergyEffect } from '../../game/store/effects/play-card-effects';


function* useRainDance(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  const hasEnergyInHand = player.hand.cards.some(c => {
    return c instanceof EnergyCard
      && c.energyType === EnergyType.BASIC
      && c.provides.includes(CardType.WATER);
  });
  if (!hasEnergyInHand) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let hasWaterPokemon = false;
  const blockedTo: CardTarget[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    const checkPokemonTypeEffect = new CheckPokemonTypeEffect(cardList);
    store.reduceEffect(state, checkPokemonTypeEffect);

    if (checkPokemonTypeEffect.cardTypes.includes(CardType.WATER)) {
      hasWaterPokemon = true;
    } else {
      blockedTo.push(target);
    }
  });

  if (!hasWaterPokemon) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  return store.prompt(state, new AttachEnergyPrompt(
    player.id,
    GameMessage.ATTACH_ENERGY_CARDS,
    player.hand,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.BENCH, SlotType.ACTIVE],
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Water Energy' },
    { allowCancel: true, blockedTo }
  ), transfers => {
    transfers = transfers || [];
    for (const transfer of transfers) {
      const target = StateUtils.getTarget(state, player, transfer.to);
      const energyCard = transfer.card as EnergyCard;
      const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target);
      store.reduceEffect(state, attachEnergyEffect);
    }
  });
}

export class Blastoise extends PokemonCard {

  public id: number = 2;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Wartortle';

  public cardType: CardType = CardType.WATER;

  public hp: number = 100;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Rain Dance',
    useWhenInPlay: true,
    powerType: PowerType.POKEPOWER,
    text:
      'As often as you like during your turn (before your attack), ' +
      'you may attach 1 {W} Energy card to 1 of your {W} Pokémon. ' +
      '(This doesn\'t use up your 1 Energy card attachment for the turn.) ' +
      'This power can\'t be used if Blastoise is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Hydro Pump',
    cost: [CardType.WATER, CardType.WATER, CardType.WATER],
    damage: 40,
    text:
      'Does 40 damage plus 10 more damage for each {W} Energy attached to Blastoise ' +
      'but not used to pay for this attack\'s Energy cost. ' +
      'Extra {W} Energy after the 2nd doesn\'t count.'
  },
  ];

  public set: string = 'BS';

  public name: string = 'Blastoise';

  public fullName: string = 'Blastoise BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Rain Dance
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if (cardList.specialConditions.length > 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useRainDance(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Hydro Pump
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergyEffect);

      let additionalWaterEnergyCount = 0;
      const attachedWaterEnergy = checkProvidedEnergyEffect.energyMap.reduce(
        (left, p) => left + p.provides.filter(cardType => cardType == CardType.WATER).length, 0);

      additionalWaterEnergyCount = Math.max(attachedWaterEnergy - 3, 0);

      effect.damage += Math.min(additionalWaterEnergyCount, 2) * 10;
    }

    return state;
  }
}
