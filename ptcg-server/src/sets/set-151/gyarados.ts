import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Power, PowerType, Attack, ConfirmPrompt, EnergyCard, ChooseCardsPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';

export class Gyarados extends PokemonCard {

  public id: number = 120;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Magikarp';

  public cardType: CardType = CardType.WATER;

  public hp: number = 190;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Untamed One',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, ' +
      'you must discard the top 5 cards of your deck.'
  }];

  public attacks: Attack[] = [{
    name: 'Hyper Beam',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 200,
    text: 'Discard an Energy from your opponent\'s Active Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Gyarados';

  public fullName: string = 'Gyarados MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Untamed One
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;

      return store.prompt(state, new ConfirmPrompt(
        effect.player.id,
        GameMessage.WANT_TO_USE_ABILITY
      ), result => {
        if (result === true) {
          player.deck.moveTo(player.discard, 5);
        }
      });
    }

    // Hyper Beam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      // Defending Pokémon has no energy cards attached
      if (!opponent.active.cards.some(c => c instanceof EnergyCard)) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        opponent.active,
        { superType: SuperType.ENERGY },
        { min: 1, max: 1, allowCancel: false }
      ), selected => {
        const discardEnergy = new DiscardCardsEffect(effect, selected);
        return store.reduceEffect(state, discardEnergy);
      });
    }

    return state;
  }

}
