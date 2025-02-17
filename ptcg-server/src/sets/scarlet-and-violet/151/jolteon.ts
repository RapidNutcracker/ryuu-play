import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, StateUtils, ChoosePokemonPrompt, GameMessage, PlayerType, SlotType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Jolteon extends PokemonCard {

  public id: number = 135;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Eevee';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Linear Attack',
    cost: [CardType.LIGHTNING],
    damage: 0,
    text:
      'This attack does 30 damage to 1 of your opponent\'s Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }, {
    name: 'Fighting Lightning',
    cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text: 'If your opponent\'s Active Pokémon is a Pokémon ex or Pokémon V, this attack does 90 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Jolteon';

  public fullName: string = 'Jolteon MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Linear Attack
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
          effect.damage = 30;
          return;
        }

        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 30);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }

    // Fighting Lightning
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const defending = opponent.active.getPokemonCard();
      if (defending && (defending.tags.includes(CardTag.EX) || defending.tags.includes(CardTag.V))) {
        effect.damage += 90;
      }
    }
    return state;
  }

}
