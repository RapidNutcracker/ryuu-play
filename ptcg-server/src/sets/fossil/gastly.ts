import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition, SuperType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, GameMessage, CoinFlipPrompt, EnergyCard, ChooseCardsPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, PutDamageEffect } from '../../game/store/effects/attack-effects';

export class Gastly extends PokemonCard {

  public id: number = 33;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 50;

  public weakness = [];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Lick',
    cost: [CardType.PSYCHIC],
    damage: 10,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }, {
    name: 'Energy Conversion',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 0,
    text:
      'Put up to 2 Energy cards from your discard pile into your hand. Gastly does 10 damage to itself.'
  }];

  public set: string = 'FO';

  public name: string = 'Gastly';

  public fullName: string = 'Gastly FO';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Lick
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Energy Conversion
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      let hasEnergyCardsInDiscard = player.discard.cards.some(c => c instanceof EnergyCard);

      if (!hasEnergyCardsInDiscard) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.discard,
        { superType: SuperType.ENERGY },
        { min: 1, max: 2, allowCancel: false }
      ), selected => {
        player.discard.moveCardsTo(selected, player.hand);

        const selfDamageEffect = new PutDamageEffect(effect, 10);
        selfDamageEffect.target = player.active;
        store.reduceEffect(state, selfDamageEffect);
      });
    }

    return state;
  }
}
