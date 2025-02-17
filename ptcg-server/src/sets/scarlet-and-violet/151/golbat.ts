import { AttackEffect } from '../../../game/store/effects/game-effects';
import { ChoosePokemonPrompt, PlayerType, SlotType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';

export class Golbat extends PokemonCard {

  public id: number = 42;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Zubat';

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Skill Dive',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'This attack does 40 damage to 1 of your opponent\'s Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Golbat';

  public fullName: string = 'Golbat MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Skill Dive
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { allowCancel: false }
      ), selected => {
        const targets = selected || [];
        if (targets.includes(opponent.active)) {
          effect.damage = 40;
          return;
        }
        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 40);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }

    return state;
  }

}
