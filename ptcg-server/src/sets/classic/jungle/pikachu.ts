import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, ChoosePokemonPrompt, PlayerType, SlotType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Pikachu extends PokemonCard {

  public id: number = 60;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 50;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Spark',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 20,
    text:
      'If your opponent has any Benched Pokémon, ' +
      'choose 1 of them and this attack does 10 damage to it. ' +
      '(Don’t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'JU';

  public name: string = 'Pikachu';

  public fullName: string = 'Pikachu JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spark
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);

      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = targets[0];
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }
}
