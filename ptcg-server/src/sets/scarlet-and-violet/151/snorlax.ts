import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { ChooseCardsPrompt, GameError, GameMessage, PlayerType, TrainerCard } from '../../../game';
import { AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Snorlax extends PokemonCard {

  public id: number = 143;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 150;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Voraciousness',
    powerType: PowerType.ABILITY,
    text: 'Once during your turn, you may put up to 2 Leftovers cards from your discard pile into your hand.'
  }];

  public attacks = [{
    name: 'Thudding Press',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 130,
    text:
      'This Pokémon also does 30 damage to itself.'
  }];

  public set: string = 'MEW';

  public name: string = 'Snorlax';

  public fullName: string = 'Snorlax MEW';

  public readonly VORACIOUSNESS_MARKER = 'VORACIOUSNESS_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Voraciousness
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const numberOfLeftoversInDiscardPile = player.discard.cards.filter(c => {
        return c instanceof TrainerCard && c.name === 'Leftovers';
      }).length;

      if (numberOfLeftoversInDiscardPile === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      // Power already used
      if (player.marker.hasMarker(this.VORACIOUSNESS_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const max = Math.min(2, numberOfLeftoversInDiscardPile);

      return store.prompt(state, [
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.discard,
          { superType: SuperType.TRAINER, name: 'Leftovers' },
          { min: 0, max, allowCancel: true }
        )], selected => {
          const cards = selected || [];

          if (cards.length > 0) {
            player.marker.addMarker(this.VORACIOUSNESS_MARKER, this);
            player.discard.moveCardsTo(cards, player.hand);
          }
        });
    }

    // Thudding Press
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const selfDamageEffect = new PutDamageEffect(effect.attackEffect, 30);
      selfDamageEffect.target = effect.source;
      state = store.reduceEffect(state, selfDamageEffect);

      return state;
    }

    // Clear Voraciousness
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER,
        (cardList) => {
          cardList.marker.removeMarker(this.VORACIOUSNESS_MARKER, this);
        });
    }

    return state;
  }
}
