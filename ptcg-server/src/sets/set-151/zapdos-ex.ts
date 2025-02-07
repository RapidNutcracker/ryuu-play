import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { CardTarget, ChoosePokemonPrompt, GameMessage, PlayerType, SlotType, StateUtils } from '../../game';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect, CheckRetreatCostEffect } from '../../game/store/effects/check-effects';

export class ZapdosEx extends PokemonCard {

  public id: number = 145;

  public tags: string[] = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 200;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Voltaic Float',
    powerType: PowerType.ABILITY,
    text: 'If this Pokémon has any {L} Energy attached, it has no Retreat Cost.'
  }];

  public attacks = [{
    name: 'Multishot Lightning',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 110,
    text:
      'This attack also does 90 damage to 1 of your opponent\'s ' +
      'Benched Pokémon that has any damage counters on it. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Zapdos ex';

  public fullName: string = 'Zapdos ex MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Voltaic Float
    if (effect instanceof CheckRetreatCostEffect) {
      const player = effect.player;

      const isZapdosActive = player.active.getPokemonCard() === this;

      if (!isZapdosActive) {
        return state;
      }

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, player.active);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyMap = checkProvidedEnergyEffect.energyMap;
      const hasLightningEnergyAttached = StateUtils.checkEnoughEnergy(energyMap, [CardType.LIGHTNING]);

      if (hasLightningEnergyAttached) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.cost = [];
      }

      return state;
    }

    // Multishot Lightning
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      let hasDamagedBench = false;
      const blocked: CardTarget[] = [];
      player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
        if (target.slot === SlotType.ACTIVE) {
          return;
        }

        if (cardList.cards.length > 0 && cardList.damage > 0) {
          hasDamagedBench = true;
        } else {
          blocked.push(target);
        }
      });

      if (!hasDamagedBench) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false, blocked }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        const damageEffect = new PutDamageEffect(effect, 90);
        damageEffect.target = targets[0];
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }
}
