import { StoreLike, State, StateUtils, PlayerType, Power, PowerType, DamageMap, PutDamagePrompt, SlotType } from '../../game';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { CheckHpEffect, CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

export class MrMime extends PokemonCard {

  public id: number = 122;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 90;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Mimic Barrier',
    powerType: PowerType.ABILITY,
    text:
      'If this Pokémon and your opponent\'s Active Pokémon have the same amount of Energy attached, ' +
      'prevent all damage done to this Pokémon by attacks from your opponent\'s Pokémon.'
  }];

  public attacks = [{
    name: 'Psypower',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'Put 3 damage counters on your opponent\'s Pokémon in any way you like.'
  }];

  public set: string = 'MEW';

  public name: string = 'Mr. Mime';

  public fullName: string = 'Mr. Mime MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // 😡imic Barrier
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkAttackerProvidedEnergyEffect = new CheckProvidedEnergyEffect(opponent, effect.source);
      store.reduceEffect(state, checkAttackerProvidedEnergyEffect);

      const attackerEnergyCount = checkAttackerProvidedEnergyEffect.energyMap.reduce((left, p) => left + p.provides.length, 0);

      const checkDefenderProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, effect.target);
      store.reduceEffect(state, checkDefenderProvidedEnergyEffect);

      const defenderEnergyCount = checkDefenderProvidedEnergyEffect.energyMap.reduce((left, p) => left + p.provides.length, 0);

      if (attackerEnergyCount === defenderEnergyCount) {
        effect.preventDefault = true;
      }
    }

    // Psypower
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const maxAllowedDamage: DamageMap[] = [];
      let damageLeft = 0;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
        const checkHpEffect = new CheckHpEffect(opponent, cardList);
        state = store.reduceEffect(state, checkHpEffect);

        damageLeft += checkHpEffect.hp - cardList.damage;

        maxAllowedDamage.push({ target, damage: checkHpEffect.hp });
      });

      const damage = Math.min(30, damageLeft);

      return store.prompt(state, new PutDamagePrompt(
        effect.player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        damage,
        maxAllowedDamage,
        { allowCancel: true }
      ), targets => {
        const results = targets || [];

        // cancelled by user
        if (results.length === 0) {
          return;
        }

        for (const result of results) {
          const target = StateUtils.getTarget(state, player, result.target);
          target.damage += result.damage;
        }
      });
    }

    return state;
  }

}
