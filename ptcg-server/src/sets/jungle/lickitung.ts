import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../game/store/effects/attack-effects';
import { CoinFlipPrompt } from '../../game/store/prompts/coin-flip-prompt';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Lickitung extends PokemonCard {

  public id: number = 38;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Tongue Wrap',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }, {
    name: 'Supersonic',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }];

  public set: string = 'JU';

  public name: string = 'Lickitung';

  public fullName: string = 'Lickitung JU';

  public readonly TONGUE_TIED_MARKER = 'TONGUE_TIED_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Tongue Wrap 
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Supersonic
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }

}
