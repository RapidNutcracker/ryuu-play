import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, PlayerType, PokemonCardList, SlotType, StateUtils, CardTarget, Card, MoveEnergyPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect } from '../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

function* useEnergyTrans(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  const blockedMap: { source: CardTarget, blocked: number[] }[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, cardList);
    store.reduceEffect(state, checkProvidedEnergy);
    const blockedCards: Card[] = [];

    checkProvidedEnergy.energyMap.forEach(em => {
      if (!em.provides.includes(CardType.GRASS) && !em.provides.includes(CardType.ANY)) {
        blockedCards.push(em.card);
      }
    });

    const blocked: number[] = [];
    blockedCards.forEach(bc => {
      const index = cardList.cards.indexOf(bc);
      if (index !== -1 && !blocked.includes(index)) {
        blocked.push(index);
      }
    });

    if (blocked.length !== 0) {
      blockedMap.push({ source: target, blocked });
    }
  });

  return store.prompt(state, new MoveEnergyPrompt(
    effect.player.id,
    GameMessage.MOVE_ENERGY_CARDS,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { superType: SuperType.ENERGY },
    { allowCancel: true, blockedMap }
  ), transfers => {
    if (transfers === null) {
      return;
    }

    for (const transfer of transfers) {
      const source = StateUtils.getTarget(state, player, transfer.from);
      const target = StateUtils.getTarget(state, player, transfer.to);
      source.moveCardTo(transfer.card, target);
    }
  });
}

export class Venusaur extends PokemonCard {

  public id: number = 15;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Ivysaur';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 100;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Energy Trans',
    useWhenInPlay: true,
    powerType: PowerType.POKEPOWER,
    text: 'As often as you like during your turn (before your attack), you may take 1 {G} Energy card attached to 1 of your Pokémon and attach it to a different one. This power can\'t be used if Venusaur is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [
    { name: 'Solar Beam', cost: [CardType.GRASS, CardType.GRASS, CardType.GRASS, CardType.GRASS], damage: 60, text: '' },
  ];

  public set: string = 'BS';

  public name: string = 'Venusaur';

  public fullName: string = 'Venusaur BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Energy Trans
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if (cardList.specialConditions.length > 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useEnergyTrans(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
