import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckPokemonStatsEffect } from '../../../game/store/effects/check-effects';

export class Electrode extends PokemonCard {

  public id: number = 2;

  public stage: Stage = Stage.STAGE_1;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 90;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Tackle',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }, {
    name: 'Chain Lightning',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 20,
    text: 'If the Defending Pokémon isn\'t Colorless, this attack does 10 damage to each Benched Pokémon of the same type as the Defending Pokémon (including your own).'
  }];

  public set: string = 'JU';

  public name: string = 'Electrode';

  public fullName: string = 'Electrode JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Chain Lightning
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const checkPokemonStatsEffect = new CheckPokemonStatsEffect(opponent.active);
      state = store.reduceEffect(state, checkPokemonStatsEffect);

      const targetCardTypes = opponent.active.getPokemonCard()?.cardTypes;

      if (!targetCardTypes?.includes(CardType.COLORLESS)) {
        player.bench.forEach(b => {
          if (b.cards.length > 0 && b.getPokemonCard()?.cardTypes === targetCardTypes) {
            const damageEffect = new PutDamageEffect(effect, 10);
            damageEffect.target = b;
            state = store.reduceEffect(state, damageEffect);
          }
        })
      }
    }

    return state;
  }
}
