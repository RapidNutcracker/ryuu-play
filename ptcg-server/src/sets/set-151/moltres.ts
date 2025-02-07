import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Attack, Power, PowerType, Resistance, Weakness } from '../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { Card, ChooseEnergyPrompt, ChoosePokemonPrompt, GameMessage, PlayerType, SlotType, StateUtils } from '../../game';
import { DiscardCardsEffect, PutDamageEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect, CheckRetreatCostEffect } from '../../game/store/effects/check-effects';

export class Moltres extends PokemonCard {

  /**
   * Moltres · 120 HP · {R}
Pokémon (Moltres) › Basic

Ability ⇢ Flare Float
If this Pokémon has any {R} Energy attached, it has no Retreat Cost.

{R}{R}{R} → Blazing Flight
Discard 2 {R} Energy from this Pokémon. This attack does 120 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)
weak: {L}×2 | resist: {F}-30 | retreat: 2
   */
  public id: number = 146;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Flare Float',
    powerType: PowerType.ABILITY,
    text: 'If this Pokémon has any {R} Energy attached, it has no Retreat Cost.'
  }];

  public attacks: Attack[] = [{
    name: 'Blazing Flight',
    cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE],
    damage: 0,
    text:
      'Discard 2 {R} Energy from this Pokémon. ' +
      'This attack does 120 damage to 1 of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Moltres';

  public fullName: string = 'Moltres MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flare Float
    if (effect instanceof CheckRetreatCostEffect) {
      const player = effect.player;

      const isMoltresActive = player.active.getPokemonCard() === this;

      if (!isMoltresActive) {
        return state;
      }

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, player.active);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyMap = checkProvidedEnergyEffect.energyMap;
      const hasFireEnergyAttached = StateUtils.checkEnoughEnergy(energyMap, [CardType.FIRE]);

      if (hasFireEnergyAttached) {
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

    // Blazing Flight
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      const cards: Card[] = [];
      checkProvidedEnergy.energyMap.forEach(em => {
        if (em.provides.includes(CardType.FIRE) || em.provides.includes(CardType.ANY)) {
          cards.push(em.card);
        }
      });

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.FIRE, CardType.FIRE],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });

      state = store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), selected => {
        const targets = selected || [];

        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 120);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });

      return state;
    }

    return state;
  }
}
