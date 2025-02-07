import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, PokemonCardList, StateUtils, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';


function* useBuzzap(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {

  /// TODO
  throw new GameError(GameMessage.CANNOT_USE_POWER);
}

export class Electrode extends PokemonCard {

  public id: number = 21;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Voltorb';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 80;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [{
    name: 'Buzzap',
    useWhenInPlay: true,
    powerType: PowerType.POKEPOWER,
    text: 'As often as you like during your turn (before your attack), you may attach 1 {W} Energy card to 1 of your {W} Pokémon. (This doesn\'t use up your 1 Energy card attachment for the turn.) This power can\'t be used if Electrode is Asleep, Confused, or Paralyzed.'
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

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Buzzap
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if (cardList.specialConditions.length > 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useBuzzap(() => generator.next(), store, state, effect);
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

    return state;
  }
}
