import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, ChoosePokemonPrompt, PlayerType, SlotType, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';

export class Raichu extends PokemonCard {

  public id: number = 14;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Pikachu';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Gigashock',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 30,
    text:
      'Choose 3 of your opponent\'s Benched Pokémon and this attack does 10 damage to each of them. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.) ' +
      'If your opponent has fewer than 3 Benched Pokémon, do the damage to each of them.'
  }];

  public set: string = 'FO';

  public name: string = 'Raichu';

  public fullName: string = 'Raichu FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Gigashock
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentBenchPokemon = opponent.bench.filter(b => b.cards.length > 0);
      if (opponentBenchPokemon.length === 0) {
        return state;
      }

      if (opponentBenchPokemon.length <= 3) {
        opponentBenchPokemon.forEach(benchSlot => {
          const damageEffect = new PutDamageEffect(effect, 10);
          damageEffect.target = benchSlot;
          store.reduceEffect(state, damageEffect);
        });

        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { min: 3, max: 3, allowCancel: false }
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
