import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType, CardTag } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameMessage, EnergyCard, ChooseCardsPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';

export class BlastoiseEX extends PokemonCard {

  public id: number = 9;

  public tags: string[] = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Wartortle';

  public cardType: CardType = CardType.WATER;

  public hp: number = 330;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Solid Shell',
    powerType: PowerType.ABILITY,
    text:
      'This Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).'
  }];

  public attacks = [
    {
      name: 'Hydro Pump',
      cost: [CardType.WATER, CardType.WATER],
      damage: 140,
      text:
        'Discard up to 2 Basic {W} Energy cards from your hand. ' +
        'This attack does 140 damage for each card you discarded in this way.'
    },
  ];

  public set: string = 'MEW';

  public name: string = 'Blastoise EX';

  public fullName: string = 'Blastoise EX MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Solid Shell
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      effect.damage -= 30;
    }

    // Twin Cannons
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      // Player has no Basic Water Energy in-hand.
      let basicWaterEnergyCards = 0;
      player.discard.cards.forEach(c => {
        if (c instanceof EnergyCard && c.energyType === EnergyType.BASIC && c.provides.indexOf(CardType.WATER) > -1) {
          basicWaterEnergyCards++;
        }
      });

      if (basicWaterEnergyCards === 0) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        player.hand,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
        { min: 1, max: 2, allowCancel: true }
      ), selected => {
        const waterEnergyToDiscard = selected || [];

        player.hand.moveCardsTo(waterEnergyToDiscard, player.discard);

        effect.damage += waterEnergyToDiscard.length * 140;
      });
    }

    return state;
  }
}
